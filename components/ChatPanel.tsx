
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, Bot, User, CheckCircle2, AlertCircle, Briefcase, Search, Calculator, ShieldAlert, Scale, PenTool, FileText } from 'lucide-react';
import { Message, MessageRole, Attachment, WorkflowEvent, AgentType } from '../types';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isGenerating: boolean;
  currentWorkflow?: WorkflowEvent[];
}

const AgentIcon: React.FC<{ agent: AgentType }> = ({ agent }) => {
  switch (agent) {
    case 'DataCollector': return <Search className="w-3 h-3" />;
    case 'FinancialModeler': return <Calculator className="w-3 h-3" />;
    case 'RiskAnalyst': return <ShieldAlert className="w-3 h-3" />;
    case 'StructuringExpert': return <Briefcase className="w-3 h-3" />;
    case 'CovenantDesigner': return <Scale className="w-3 h-3" />;
    case 'Writer': return <FileText className="w-3 h-3" />;
    default: return <Bot className="w-3 h-3" />;
  }
};

const WorkflowStatus: React.FC<{ events: WorkflowEvent[] }> = ({ events }) => {
  if (!events || events.length === 0) return null;

  const activeEvent = events[events.length - 1];
  
  // Determine progress based on the 6-phase workflow
  const steps: AgentType[] = [
    'DataCollector', 
    'FinancialModeler', 
    'RiskAnalyst', 
    'StructuringExpert', 
    'CovenantDesigner', 
    'Writer'
  ];
  
  const currentStepIndex = steps.indexOf(activeEvent.agent);
  const progress = Math.max(5, ((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="mx-4 mb-4 bg-white border border-indigo-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
           <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
           AI Agent Workflow
        </span>
        <span className="text-[10px] text-indigo-400 font-mono">{activeEvent.agent}</span>
      </div>
      
      <div className="space-y-3">
        {events.map((evt, i) => (
          <div key={evt.id} className={`flex items-start gap-3 text-sm ${evt.status === 'active' ? 'text-indigo-700 font-medium' : 'text-slate-500'}`}>
            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              evt.status === 'completed' ? 'bg-green-100 text-green-600' :
              evt.status === 'failed' ? 'bg-red-100 text-red-600' :
              'bg-indigo-100 text-indigo-600'
            }`}>
               {evt.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : 
                evt.status === 'failed' ? <AlertCircle className="w-3 h-3" /> :
                <AgentIcon agent={evt.agent} />
               }
            </div>
            <div className="flex-1">
               <p className="leading-tight">{evt.message}</p>
               {evt.status === 'active' && (
                 <div className="mt-1 h-1 bg-indigo-100 rounded-full overflow-hidden w-24">
                   <div className="h-full bg-indigo-50 animate-progress-indeterminate"></div>
                 </div>
               )}
            </div>
            <div className="text-[10px] text-slate-300 font-mono tabular-nums">
              {new Date(evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="mt-4 pt-3 border-t border-indigo-50">
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isGenerating, currentWorkflow }) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentWorkflow]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAttachments(prev => [...prev, {
          name: file.name,
          mimeType: file.type,
          data: base64String
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isGenerating) return;
    
    onSendMessage(inputText, attachments);
    setInputText('');
    setAttachments([]);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">CreditAlpha Co-Pilot</h2>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-xs text-gray-500 font-medium">Multi-Agent System Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-slate-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
              msg.role === MessageRole.USER ? 'bg-slate-900' : 'bg-white border border-indigo-100'
            }`}>
              {msg.role === MessageRole.USER ? 
                <User className="w-4 h-4 text-white" /> : 
                <Bot className="w-4 h-4 text-indigo-600" />
              }
            </div>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
              msg.role === MessageRole.USER 
                ? 'bg-slate-900 text-white' 
                : 'bg-white border border-gray-100 text-gray-700'
            }`}>
              {msg.content}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs opacity-80">
                      <Paperclip className="w-3 h-3" />
                      {att.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Active Workflow Status Display */}
        {isGenerating && currentWorkflow && (
           <WorkflowStatus events={currentWorkflow} />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto py-1">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs border border-indigo-100">
                <Paperclip className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{att.name}</span>
                <button 
                  onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                  className="hover:text-indigo-900 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask the Data Agent to research a company..."
            className="w-full pl-4 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400"
            disabled={isGenerating}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.csv,.txt,.md"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isGenerating}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              disabled={isGenerating || (!inputText.trim() && attachments.length === 0)}
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
