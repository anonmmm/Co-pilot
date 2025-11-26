
import { GoogleGenAI } from "@google/genai";
import { MemoData, WorkflowEvent, AgentType } from "../types";
import { 
  DATA_AGENT_PROMPT, 
  FINANCIAL_MODELER_PROMPT, 
  RISK_ANALYST_PROMPT, 
  STRUCTURING_EXPERT_PROMPT, 
  COVENANT_DESIGNER_PROMPT, 
  WRITER_PROMPT, 
  cleanJson 
} from "./prompts";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Workflow Orchestrator ---

export async function* runGeminiWorkflow(
  prompt: string,
  attachments: { mimeType: string; data: string }[],
  currentMemo: MemoData
): AsyncGenerator<{ event: WorkflowEvent; partialData?: Partial<MemoData> }> {
  
  const runId = Date.now().toString();
  let workingMemo = { ...currentMemo };

  // Helper to emit events
  const createEvent = (agent: AgentType, status: 'active' | 'completed' | 'failed' | 'pending', message: string): WorkflowEvent => ({
    id: `${runId}-${agent}-${Date.now()}`,
    agent,
    status,
    message,
    timestamp: Date.now()
  });

  try {
    // --- Phase 1: Data Collection ---
    yield { event: createEvent('DataCollector', 'active', 'Searching for filings (10-K/Q) and market data...') };
    
    const dataAgentResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          ...attachments.map(a => ({ inlineData: a })),
          { text: `User Request: ${prompt}. \n\nSystem: ${DATA_AGENT_PROMPT}` }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const researchData = JSON.parse(cleanJson(dataAgentResp.text || '{}'));
    
    workingMemo = {
      ...workingMemo,
      companyOverview: researchData.companyOverview || workingMemo.companyOverview,
      marketAnalysis: researchData.marketAnalysis || workingMemo.marketAnalysis,
    };
    
    yield { 
      event: createEvent('DataCollector', 'completed', 'Entity data and market intelligence gathered.'),
      partialData: { companyOverview: workingMemo.companyOverview, marketAnalysis: workingMemo.marketAnalysis }
    };


    // --- Phase 2: Financial Modeling ---
    yield { event: createEvent('FinancialModeler', 'active', 'Constructing 3-statement model and return scenarios...') };

    const financialAgentResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: `
            CONTEXT:
            Research Data: ${JSON.stringify(researchData)}
            User Request: ${prompt}
            
            INSTRUCTIONS:
            ${FINANCIAL_MODELER_PROMPT}
            
            Ensure the 'financialModel' output matches the specific structure of the MemoData type (sheets: pnl, bs, cf, debt, returns).
            ` 
          }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const financialData = JSON.parse(cleanJson(financialAgentResp.text || '{}'));
    
    workingMemo = {
      ...workingMemo,
      financialModel: financialData.financialModel || workingMemo.financialModel,
      financialAnalysis: financialData.financialAnalysis || workingMemo.financialAnalysis,
      scenarios: financialData.scenarios || workingMemo.scenarios,
      capitalStructure: financialData.capitalStructure || workingMemo.capitalStructure,
    };

    yield {
      event: createEvent('FinancialModeler', 'completed', 'Financial model built with Base/Upside/Downside cases.'),
      partialData: { 
        financialModel: workingMemo.financialModel,
        financialAnalysis: workingMemo.financialAnalysis,
        scenarios: workingMemo.scenarios,
        capitalStructure: workingMemo.capitalStructure
      }
    };


    // --- Phase 3: Risk Assessment ---
    yield { event: createEvent('RiskAnalyst', 'active', 'Identifying risks and calculating probability/impact...') };

    const riskAgentResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: `
            CONTEXT:
            Company: ${workingMemo.companyOverview}
            Financial Analysis: ${workingMemo.financialAnalysis}
            
            INSTRUCTIONS:
            ${RISK_ANALYST_PROMPT}
            ` 
          }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const riskData = JSON.parse(cleanJson(riskAgentResp.text || '{}'));
    
    workingMemo = {
      ...workingMemo,
      risks: riskData.risks || workingMemo.risks
    };

    yield {
      event: createEvent('RiskAnalyst', 'completed', 'Risk matrix and mitigants defined.'),
      partialData: { risks: workingMemo.risks }
    };


    // --- Phase 4: Deal Structuring ---
    yield { event: createEvent('StructuringExpert', 'active', 'Structuring facility, pricing, and security package...') };

    const structAgentResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: `
            CONTEXT:
            Company: ${workingMemo.companyOverview}
            Risks: ${JSON.stringify(workingMemo.risks)}
            Scenarios: ${JSON.stringify(workingMemo.scenarios)}
            
            INSTRUCTIONS:
            ${STRUCTURING_EXPERT_PROMPT}
            ` 
          }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const structData = JSON.parse(cleanJson(structAgentResp.text || '{}'));
    
    workingMemo = {
      ...workingMemo,
      termSheet: { ...workingMemo.termSheet, ...structData.termSheet },
      capitalStructure: structData.capitalStructure || workingMemo.capitalStructure
    };

    yield {
      event: createEvent('StructuringExpert', 'completed', 'Term sheet core terms and pricing set.'),
      partialData: { termSheet: workingMemo.termSheet, capitalStructure: workingMemo.capitalStructure }
    };


    // --- Phase 5: Covenant Design ---
    yield { event: createEvent('CovenantDesigner', 'active', 'Calibrating maintenance and negative covenants...') };

    const covAgentResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: `
            CONTEXT:
            Financial Model Summary: ${workingMemo.financialAnalysis}
            Current Terms: ${JSON.stringify(workingMemo.termSheet)}
            
            INSTRUCTIONS:
            ${COVENANT_DESIGNER_PROMPT}
            ` 
          }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const covData = JSON.parse(cleanJson(covAgentResp.text || '{}'));

    workingMemo = {
      ...workingMemo,
      termSheet: { 
        ...workingMemo.termSheet, 
        maintenanceCovenants: covData.termSheet?.maintenanceCovenants || workingMemo.termSheet.maintenanceCovenants,
        negativeCovenants: covData.termSheet?.negativeCovenants || workingMemo.termSheet.negativeCovenants,
        conditionsPrecedent: covData.termSheet?.conditionsPrecedent || workingMemo.termSheet.conditionsPrecedent,
      }
    };

    yield {
      event: createEvent('CovenantDesigner', 'completed', 'Covenants calibrated with appropriate headroom.'),
      partialData: { termSheet: workingMemo.termSheet }
    };


    // --- Phase 6: Documentation & Assembly ---
    yield { event: createEvent('Writer', 'active', 'Synthesizing final Investment Memorandum...') };

    const writerAgentResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: `
            CONTEXT:
            Full Analysis Data: ${JSON.stringify(workingMemo)}
            
            INSTRUCTIONS:
            ${WRITER_PROMPT}
            ` 
          }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const writerData = JSON.parse(cleanJson(writerAgentResp.text || '{}'));

    workingMemo = {
      ...workingMemo,
      title: writerData.title || `Investment Memo: ${workingMemo.termSheet.borrower}`,
      recommendation: writerData.recommendation || workingMemo.recommendation,
      executiveSummary: writerData.executiveSummary || workingMemo.executiveSummary,
      investmentThesis: writerData.investmentThesis || workingMemo.investmentThesis,
      investmentHighlights: writerData.investmentHighlights || workingMemo.investmentHighlights,
      businessAnalysis: writerData.businessAnalysis || workingMemo.businessAnalysis,
      downsideAnalysis: writerData.downsideAnalysis || workingMemo.downsideAnalysis,
      // Merge final term sheet details if any
      termSheet: { ...workingMemo.termSheet, ...writerData.termSheet },
      status: "Draft" // Ready for review
    };

    yield {
      event: createEvent('Writer', 'completed', 'Final Investment Memo assembled successfully.'),
      partialData: workingMemo
    };

  } catch (error) {
    console.error("Workflow Error:", error);
    yield { event: createEvent('Orchestrator', 'failed', 'Workflow interrupted due to error.') };
    throw error;
  }
}

export const streamChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string
) => {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: "You are the CreditAlpha Orchestrator. Summarize the actions taken by the agents briefly and confirm the analysis is ready for review."
    }
  });
  
  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};
