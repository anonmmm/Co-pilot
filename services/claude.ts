import Anthropic from '@anthropic-ai/sdk';
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

// Initialize Claude Client
// Note: This expects the API key to be available in the environment.
// In a real client-side app, you might need a proxy or allow unsafe browser usage.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '', 
  dangerouslyAllowBrowser: true
});

// Claude 4.5 / 4.1 Model IDs
export const CLAUDE_SONNET = 'claude-sonnet-4-5-20250929'; 
export const CLAUDE_OPUS = 'claude-opus-4-1-20250805';

// --- Agent Skills Configuration ---
// Defining standard Anthropic skills for document intelligence and generation
const SKILLS = {
  PDF: { type: 'anthropic' as const, skill_id: 'pdf', version: 'latest' },
  EXCEL: { type: 'anthropic' as const, skill_id: 'xlsx', version: 'latest' },
  PPT: { type: 'anthropic' as const, skill_id: 'pptx', version: 'latest' },
  DOCS: { type: 'anthropic' as const, skill_id: 'docx', version: 'latest' }
};

// Helper to extract text from content blocks
const extractText = (content: any[]): string => {
  if (!content || !Array.isArray(content)) return '{}';
  // Filter for text blocks, ignoring thinking blocks or tool use blocks for the final output
  const textBlock = content.find(b => b.type === 'text');
  return textBlock ? textBlock.text : '{}';
};

interface GenerateOptions {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  attachments?: { mimeType: string; data: string; name: string }[];
  useThinking?: boolean;
  temperature?: number;
  skills?: Array<{ type: 'anthropic' | 'custom'; skill_id: string; version: string }>;
}

// Unified Generation Helper handling 4.5 breaking changes, Thinking, and Skills
const generateWithClaude = async ({
  model,
  systemPrompt,
  userPrompt,
  attachments = [],
  useThinking = false,
  temperature = 0,
  skills = []
}: GenerateOptions) => {
  
  const messages: any[] = [{ role: "user", content: [] }];

  // Handle attachments properly
  // We use 'document' blocks for PDFs to enable native analysis and 'image' blocks for images
  // Text-based files are appended to the prompt context
  let textContext = userPrompt;

  if (attachments.length > 0) {
    for (const att of attachments) {
      if (att.mimeType === 'application/pdf') {
        // Native PDF support
        messages[0].content.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: att.data
          }
        });
        textContext += `\n\n[Attached PDF: ${att.name}]`;
      } else if (att.mimeType.startsWith('image/')) {
        // Native Image support
        messages[0].content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: att.mimeType as any,
            data: att.data
          }
        });
        textContext += `\n\n[Attached Image: ${att.name}]`;
      } else {
        // Fallback for text/other files
        textContext += `\n\n[Attachment: ${att.name} (${att.mimeType})]\n(Base64 Data: ${att.data.substring(0, 50)}...)`;
      }
    }
  }

  // Add the user text prompt
  messages[0].content.push({ type: "text", text: textContext });

  // Config object construction
  const config: any = {
    model: model,
    max_tokens: useThinking ? 16000 : 8000, // Higher limit for thinking
    system: systemPrompt,
    messages: messages,
    // Enable Code Execution and Skills betas
    betas: ["code-execution-2025-08-25", "skills-2025-10-02"], 
  };

  // Add Skills Container if skills are requested
  if (skills.length > 0) {
    config.container = { skills };
    // Code execution tool is required for skills to function
    config.tools = [{ type: "code_execution_20250825", name: "code_execution" }];
  }

  // Apply Extended Thinking Config (Only for Sonnet 4.5)
  if (useThinking && model === CLAUDE_SONNET) {
    config.thinking = { 
      type: "enabled", 
      budget_tokens: 8000 
    };
    // Breaking Change in 4.5: Temperature/Top_p cannot be used with Thinking
  } else {
    // Standard sampling
    config.temperature = temperature;
  }

  try {
    const response = await anthropic.messages.create(config);
    return response;
  } catch (err) {
    console.error("Claude API Error:", err);
    throw err;
  }
};

// --- Workflow Orchestrator for Claude ---

export async function* runClaudeWorkflow(
  prompt: string,
  attachments: { mimeType: string; data: string; name: string }[],
  currentMemo: MemoData,
  model: string = CLAUDE_SONNET
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
    // SKILL: PDF Analysis for deep reading of uploaded docs (10-Ks, etc)
    yield { event: createEvent('DataCollector', 'active', 'Analyzing request and gathering intelligence (PDF Skill Active)...') };
    
    const resp1 = await generateWithClaude({
      model,
      systemPrompt: DATA_AGENT_PROMPT,
      userPrompt: `User Request: ${prompt}. \n\nAnalyze the request and any attachments. Use your PDF skills to extract specific financial tables if a PDF is provided. \nOutput valid JSON matching the schema.`,
      attachments,
      useThinking: false,
      temperature: 0.2,
      skills: [SKILLS.PDF]
    });

    const researchData = JSON.parse(cleanJson(extractText(resp1.content)));
    
    workingMemo = {
      ...workingMemo,
      companyOverview: researchData.companyOverview || workingMemo.companyOverview,
      marketAnalysis: researchData.marketAnalysis || workingMemo.marketAnalysis,
    };
    
    yield { 
      event: createEvent('DataCollector', 'completed', 'Entity data and market intelligence analyzed.'),
      partialData: { companyOverview: workingMemo.companyOverview, marketAnalysis: workingMemo.marketAnalysis }
    };

    // --- Phase 2: Financial Modeling ---
    // SKILL: Excel (XLSX) for robust data manipulation and formula verification
    // CRITICAL: Use Extended Thinking for complex 3-statement modeling logic
    yield { event: createEvent('FinancialModeler', 'active', 'Engaging Extended Thinking & Excel Skill for model construction...') };

    const resp2 = await generateWithClaude({
      model,
      systemPrompt: "You are a financial modeling expert. You must output strictly valid JSON matching the FinancialModel schema.",
      userPrompt: `
        CONTEXT:
        Research Data: ${JSON.stringify(researchData)}
        User Request: ${prompt}
        
        INSTRUCTIONS:
        ${FINANCIAL_MODELER_PROMPT}
        
        Use your Excel skills to conceptually verify the balance sheet equation (Assets = Liabs + Equity) or run python checks before finalizing the JSON.
      `,
      useThinking: true, // Enabled for complex logic
      skills: [SKILLS.EXCEL]
    });

    const financialData = JSON.parse(cleanJson(extractText(resp2.content)));
    
    workingMemo = {
      ...workingMemo,
      financialModel: financialData.financialModel || workingMemo.financialModel,
      financialAnalysis: financialData.financialAnalysis || workingMemo.financialAnalysis,
      scenarios: financialData.scenarios || workingMemo.scenarios,
      capitalStructure: financialData.capitalStructure || workingMemo.capitalStructure,
    };

    yield {
      event: createEvent('FinancialModeler', 'completed', 'Financial model built with probability-weighted scenarios.'),
      partialData: { 
        financialModel: workingMemo.financialModel,
        financialAnalysis: workingMemo.financialAnalysis,
        scenarios: workingMemo.scenarios,
        capitalStructure: workingMemo.capitalStructure
      }
    };


    // --- Phase 3: Risk Assessment ---
    // Use Thinking to derive second-order risks
    yield { event: createEvent('RiskAnalyst', 'active', 'Deep-dive risk assessment and mitigation strategy...') };

    const resp3 = await generateWithClaude({
      model,
      systemPrompt: "You are a senior risk analyst. Output strictly valid JSON.",
      userPrompt: `
        CONTEXT:
        Company: ${workingMemo.companyOverview}
        Financial Analysis: ${workingMemo.financialAnalysis}
        
        INSTRUCTIONS:
        ${RISK_ANALYST_PROMPT}
        
        Analyze second-order effects and correlation between risks before scoring.
      `,
      useThinking: true
    });

    const riskData = JSON.parse(cleanJson(extractText(resp3.content)));
    
    workingMemo = {
      ...workingMemo,
      risks: riskData.risks || workingMemo.risks
    };

    yield {
      event: createEvent('RiskAnalyst', 'completed', 'Risk matrix calibrated.'),
      partialData: { risks: workingMemo.risks }
    };


    // --- Phase 4: Deal Structuring ---
    // Use Thinking to optimize the capital structure
    yield { event: createEvent('StructuringExpert', 'active', 'Structuring optimal credit facility...') };

    const resp4 = await generateWithClaude({
      model,
      systemPrompt: "You are a deal structuring expert. Output strictly valid JSON.",
      userPrompt: `
        CONTEXT:
        Company: ${workingMemo.companyOverview}
        Risks: ${JSON.stringify(workingMemo.risks)}
        Scenarios: ${JSON.stringify(workingMemo.scenarios)}
        
        INSTRUCTIONS:
        ${STRUCTURING_EXPERT_PROMPT}
      `,
      useThinking: true
    });

    const structData = JSON.parse(cleanJson(extractText(resp4.content)));
    
    workingMemo = {
      ...workingMemo,
      termSheet: { ...workingMemo.termSheet, ...structData.termSheet },
      capitalStructure: structData.capitalStructure || workingMemo.capitalStructure
    };

    yield {
      event: createEvent('StructuringExpert', 'completed', 'Term sheet structured.'),
      partialData: { termSheet: workingMemo.termSheet, capitalStructure: workingMemo.capitalStructure }
    };


    // --- Phase 5: Covenant Design ---
    yield { event: createEvent('CovenantDesigner', 'active', 'Calibrating covenants against model headroom...') };

    const resp5 = await generateWithClaude({
      model,
      systemPrompt: "You are a covenant lawyer. Output strictly valid JSON.",
      userPrompt: `
        CONTEXT:
        Financial Model Summary: ${workingMemo.financialAnalysis}
        Current Terms: ${JSON.stringify(workingMemo.termSheet)}
        
        INSTRUCTIONS:
        ${COVENANT_DESIGNER_PROMPT}
      `,
      useThinking: false, 
      temperature: 0.1
    });

    const covData = JSON.parse(cleanJson(extractText(resp5.content)));

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
      event: createEvent('CovenantDesigner', 'completed', 'Covenants designed.'),
      partialData: { termSheet: workingMemo.termSheet }
    };


    // --- Phase 6: Documentation & Assembly ---
    // SKILL: PowerPoint (PPTX) and Word (DOCX) generation for final artifacts
    yield { event: createEvent('Writer', 'active', 'Synthesizing final Investment Memorandum (PPTX/DOCX Skills Active)...') };

    const resp6 = await generateWithClaude({
      model,
      systemPrompt: "You are a credit investment writer. Output strictly valid JSON.",
      userPrompt: `
        CONTEXT:
        Full Analysis Data: ${JSON.stringify(workingMemo)}
        
        INSTRUCTIONS:
        ${WRITER_PROMPT}
        
        Note: You have the 'pptx' and 'docx' skills available. 
        While you output JSON here for the web view, prepare the content structure 
        as if you were generating a professional presentation deck.
      `,
      useThinking: false,
      temperature: 0.4,
      skills: [SKILLS.PPT, SKILLS.DOCS]
    });

    const writerData = JSON.parse(cleanJson(extractText(resp6.content)));

    workingMemo = {
      ...workingMemo,
      title: writerData.title || `Investment Memo: ${workingMemo.termSheet.borrower}`,
      recommendation: writerData.recommendation || workingMemo.recommendation,
      executiveSummary: writerData.executiveSummary || workingMemo.executiveSummary,
      investmentThesis: writerData.investmentThesis || workingMemo.investmentThesis,
      investmentHighlights: writerData.investmentHighlights || workingMemo.investmentHighlights,
      businessAnalysis: writerData.businessAnalysis || workingMemo.businessAnalysis,
      downsideAnalysis: writerData.downsideAnalysis || workingMemo.downsideAnalysis,
      termSheet: { ...workingMemo.termSheet, ...writerData.termSheet },
      status: "Draft"
    };

    yield {
      event: createEvent('Writer', 'completed', 'Final Investment Memo assembled successfully.'),
      partialData: workingMemo
    };

  } catch (error) {
    console.error("Workflow Error:", error);
    yield { event: createEvent('Orchestrator', 'failed', `Workflow interrupted: ${error instanceof Error ? error.message : String(error)}`) };
    throw error;
  }
}

export const streamClaudeChatResponse = async (
  newMessage: string,
  model: string = CLAUDE_SONNET
) => {
  const resp = await generateWithClaude({
    model,
    systemPrompt: "You are the CreditAlpha Orchestrator. Summarize the actions taken by the agents briefly.",
    userPrompt: newMessage,
    useThinking: false
  });
  
  return extractText(resp.content);
};