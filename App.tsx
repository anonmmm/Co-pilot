
import React, { useState } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { MemoCanvas } from './components/MemoCanvas';
import { LMSDashboard } from './components/LMSDashboard';
import { Message, MessageRole, Attachment, MemoData, INITIAL_MEMO_STATE, WorkflowEvent, ModelProvider, Loan } from './types';
import { runGeminiWorkflow, streamChatResponse } from './services/gemini';
import { runClaudeWorkflow, streamClaudeChatResponse, CLAUDE_SONNET, CLAUDE_OPUS } from './services/claude';
import { createLoanFromMemo } from './services/lending';
import { Settings, Cpu, Briefcase, FileText } from 'lucide-react';

type AppView = 'underwriting' | 'lending';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('underwriting');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: MessageRole.MODEL,
      content: "Welcome to CreditAlpha. I am your AI Orchestrator. \n\nI coordinate a sequential workflow of specialized agents:\n1. Data Collector\n2. Financial Modeler\n3. Risk Analyst\n4. Structuring Expert\n5. Covenant Designer\n6. Writer\n\nTo begin, tell me which company to analyze.",
      provider: 'gemini'
    }
  ]);
  const [memoData, setMemoData] = useState<MemoData>(INITIAL_MEMO_STATE);
  const [bookedLoans, setBookedLoans] = useState<Loan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowEvents, setWorkflowEvents] = useState<WorkflowEvent[]>([]);
  const [provider, setProvider] = useState<ModelProvider>('gemini');
  const [claudeModel, setClaudeModel] = useState<string>(CLAUDE_SONNET);

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: text,
      attachments,
      provider: provider
    };
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);
    setWorkflowEvents([]); // Reset workflow display

    try {
      let workflow;
      
      // 2. Select Provider Workflow
      if (provider === 'claude') {
         // Claude Workflow
         workflow = runClaudeWorkflow(text, attachments, memoData, claudeModel);
      } else {
         // Gemini Workflow
         workflow = runGeminiWorkflow(text, attachments, memoData);
      }
      
      // Consume generator
      for await (const step of workflow) {
        // Update Workflow Log
        setWorkflowEvents(prev => [...prev, step.event]);
        
        // Update Memo State incrementally if data is present
        if (step.partialData) {
          setMemoData(prev => ({
            ...prev,
            ...step.partialData
          }));
        }
      }

      // 3. Final Chat Confirmation
      const prompt = `The user asked: "${text}". The agents have successfully updated the memo through all 6 phases. Summarize the outcome briefly.`;
      let responseText = "";

      if (provider === 'claude') {
        responseText = await streamClaudeChatResponse(prompt, claudeModel);
      } else {
        responseText = await streamChatResponse([], prompt);
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        content: responseText || "Analysis complete. The memorandum has been updated with the latest data from all agents.",
        provider: provider
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        content: `I encountered a critical error in the ${provider} agent workflow. Please check the console for details.`,
        provider: provider
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBookLoan = () => {
    // Convert current Memo to a Loan entity
    const newLoan = createLoanFromMemo(memoData);
    setBookedLoans(prev => [newLoan, ...prev]);
    
    // Switch view to LMS
    setCurrentView('lending');
  };

  const handleLoanUpdate = (updatedLoan: Loan) => {
    setBookedLoans(prev => prev.map(l => l.id === updatedLoan.id ? updatedLoan : l));
  };

  const handleMemoUpdate = (newData: MemoData) => {
    setMemoData(newData);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <div className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 shadow-md z-20 shrink-0">
        <div className="flex items-center gap-2 font-serif font-bold text-lg tracking-tight">
           <div className="bg-indigo-500 w-8 h-8 rounded flex items-center justify-center">
             <Cpu className="w-5 h-5 text-white" />
           </div>
           CreditAlpha <span className="font-sans font-light opacity-50 text-sm">System</span>
        </div>
        
        {/* Module Switcher */}
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button 
            onClick={() => setCurrentView('underwriting')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'underwriting' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" />
            Co-Pilot
          </button>
          <button 
             onClick={() => setCurrentView('lending')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'lending' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <Briefcase className="w-4 h-4" />
            LMS
          </button>
        </div>

        <div className="flex items-center gap-4">
           {/* Model Selector only visible in Co-Pilot mode */}
           {currentView === 'underwriting' && (
             <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button 
                   onClick={() => setProvider('gemini')}
                   className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${provider === 'gemini' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" className="w-4 h-4" alt="Gemini" />
                  Gemini 2.5
                </button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button 
                   onClick={() => setProvider('claude')}
                   className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${provider === 'claude' ? 'bg-orange-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <div className="w-3 h-3 rounded-sm bg-white"></div>
                  Claude
                </button>
             </div>
           )}
           
           {currentView === 'underwriting' && provider === 'claude' && (
              <select 
                value={claudeModel} 
                onChange={(e) => setClaudeModel(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value={CLAUDE_SONNET}>Claude 4.5 Sonnet (Extended Thinking)</option>
                <option value={CLAUDE_OPUS}>Claude 4.1 Opus</option>
              </select>
           )}

           <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
             <Settings className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {currentView === 'underwriting' ? (
          <>
            {/* Left Pane: Chat (35%) */}
            <div className="w-[400px] lg:w-[35%] h-full shadow-xl z-10 relative border-r border-slate-200">
              <ChatPanel 
                messages={messages} 
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
                currentWorkflow={workflowEvents}
              />
            </div>

            {/* Right Pane: Live Artifact (65%) */}
            <div className="flex-1 h-full bg-slate-100 relative">
              <MemoCanvas 
                data={memoData} 
                onUpdate={handleMemoUpdate}
                onBookLoan={handleBookLoan}
              />
            </div>
          </>
        ) : (
          <LMSDashboard 
            loans={bookedLoans} 
            onUpdateLoan={handleLoanUpdate}
            onAddLoan={(loan) => setBookedLoans(prev => [loan, ...prev])}
          />
        )}
      </div>
    </div>
  );
};

export default App;
