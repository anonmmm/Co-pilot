
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export type ModelProvider = 'gemini' | 'claude';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  attachments?: Attachment[];
  isTyping?: boolean;
  workflowEvents?: WorkflowEvent[];
  provider?: ModelProvider;
}

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64
}

// --- Agent & Workflow Types ---

export type AgentType = 
  | 'Orchestrator' 
  | 'DataCollector' 
  | 'FinancialModeler' 
  | 'RiskAnalyst' 
  | 'StructuringExpert' 
  | 'CovenantDesigner' 
  | 'Writer';

export interface WorkflowEvent {
  id: string;
  agent: AgentType;
  status: 'active' | 'completed' | 'failed' | 'pending';
  message: string;
  timestamp: number;
  partialData?: Partial<MemoData>;
}

// --- Risk & Ontology Types ---

export interface RiskFactor {
  category: 'Business' | 'Financial' | 'Operational' | 'Legal' | 'Market';
  risk: string;
  mitigant: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: 'Low' | 'Medium' | 'High';
  velocity: 'Slow' | 'Medium' | 'Fast'; // Mandatory per Ontology
  residualRisk: 'Low' | 'Medium' | 'High'; // Mandatory per Ontology
}

// --- Financial Model Types ---

export interface ModelColumn {
  id: string;
  label: string;
  type: 'historical' | 'projection' | 'input' | 'output' | 'text';
  width?: number;
}

export interface ModelRow {
  id: string;
  label: string;
  format: 'currency' | 'percentage' | 'number' | 'text';
  isCalculated?: boolean;
  isHeader?: boolean;
  indent?: number;
  values: Record<string, number | string>;
}

export interface ModelSheet {
  id: string;
  name: string;
  color?: string;
  columns: ModelColumn[];
  rows: ModelRow[];
}

export interface FinancialModel {
  activeSheetId: string;
  activeScenario: 'Base Case' | 'Upside Case' | 'Downside Case';
  sheets: ModelSheet[];
  validationStatus?: {
    balanceSheetBalanced: boolean;
    cashFlowTied: boolean;
    covenantsPassed: boolean;
    debtScheduleIntegrity: boolean;
  };
}

// --- New Institutional Credit Types ---

export interface FeeStructure {
  type: string; // e.g. "Origination", "Commitment", "Exit", "Monitoring"
  amount: string; // e.g., "2.0%" or "$500k"
  paymentTerms: string;
  rationale: string;
}

export interface AmortizationItem {
  period: string; // e.g. "Year 1", "Year 2"
  percentage: number;
  type: 'Interest Only' | 'Fixed Amortization' | 'Bullet' | 'Sweep';
}

export interface CollateralItem {
  assetCategory: string;
  bookValue: number;
  liquidationValue: number;
  advanceRate: number;
  loanCoverage: number;
}

export interface CovenantDetail {
  name: string;
  initialLevel: string;
  targetLevel: string;
  headroom: string; // e.g. "30%"
  frequency: string; // e.g. "Quarterly"
  testingPeriod?: string; // e.g. "Trailing 12 Months"
}

export interface PricingGridTier {
  leverageRange: string;
  spread: string;
}

export interface PrepaymentTerm {
  type: 'Mandatory' | 'Voluntary';
  description: string;
  conditions: string;
}

export interface NegativeCovenant {
  restriction: string; // e.g. "Indebtedness"
  details: string;
  exceptions: string; // Permitted baskets
}

export interface ConditionPrecedent {
  category: 'Documentary' | 'Financial' | 'Business' | 'Regulatory' | 'Legal';
  item: string;
  status: 'Pending' | 'Satisfied' | 'Waived';
}

export interface ReportingRequirement {
  report: string;
  frequency: string;
  deadline: string;
}

export interface TermSheetData {
  borrower: string;
  facilityType: string;
  amount: string;
  tenor: string;
  
  // Pricing
  pricing: string; // Summary string
  baseRate: string;
  spread: string;
  pricingGrid: PricingGridTier[]; // Detailed grid
  defaultRate?: string;
  
  fees: FeeStructure[];
  amortization: AmortizationItem[];
  prepayments: PrepaymentTerm[];
  
  // Covenants
  maintenanceCovenants: CovenantDetail[];
  negativeCovenants: NegativeCovenant[]; 
  financialCovenants?: CovenantDetail[]; 
  
  collateral: CollateralItem[];
  guarantors?: string;
  
  conditionsPrecedent: ConditionPrecedent[];
  reportingRequirements: ReportingRequirement[];
  
  governingLaw?: string;
}

export interface KeyTerm {
  label: string;
  value: string;
}

export interface CapitalStructureItem {
  instrument: string;
  amount: number;
  pricing: string;
  maturity: string;
  leverageMetric: number;
  seniority?: number;
}

export interface ScenarioOutcome {
  caseName: 'Base Case' | 'Upside Case' | 'Downside Case';
  probability: number; // 0-1
  irr: number;
  moic: number;
  description: string;
  recovery?: number;
}

export interface LiquidationLayer {
  priority: number;
  claimClass: string;
  claimAmount: number;
  recoveryAmount: number;
  recoveryPercent: number;
}

// --- IC Approval Types ---
export interface ICMember {
  name: string;
  role: string;
  signature: string;
  date: string;
  conditions?: string;
}

export interface ICApproval {
  chair: ICMember;
  cro: ICMember;
  cfo: ICMember;
  pm: ICMember;
}

export interface ValidationReport {
  dataConsistency: boolean;
  modelIntegrity: boolean;
  completeness: boolean;
  issues: string[];
}

export interface MemoData {
  title: string;
  status: 'Draft' | 'Review' | 'Approved';
  lastUpdated: string;
  
  // Section 1: Executive Summary
  recommendation: string;
  executiveSummary: string;
  investmentThesis: string[];
  
  // Section 2: Terms & Structure
  keyTerms: KeyTerm[]; // Quick summary
  termSheet: TermSheetData; // Detailed Ontology structure
  capitalStructure: CapitalStructureItem[];

  // Section 3: Business Summary
  companyOverview: string;
  marketAnalysis?: string;
  competitivePosition?: string;

  // Section 4: Investment Highlights
  investmentHighlights: string[];

  // Section 5: Risks
  risks: RiskFactor[];

  // Section 6: Returns & Downside
  scenarios: ScenarioOutcome[];

  // Section 7: Collateral & Liquidation
  liquidationWaterfall: LiquidationLayer[];
  downsideAnalysis: string;

  // Section 8: Business Analysis
  businessAnalysis: string; 
  financialModel: FinancialModel;
  financialAnalysis: string;

  // Compliance & Validation
  icApproval?: ICApproval;
  validationReport?: ValidationReport;
}

// --- Loan Management System (LMS) Types ---

export type LoanStatus = 'Sanctioned' | 'Disbursed' | 'Repaying' | 'Closed' | 'Default';

export interface ScheduleEntry {
  period: number;
  dueDate: string;
  openingBalance: number;
  interest: number;
  principal: number;
  totalPayment: number;
  closingBalance: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LoanSecurity {
  id: string;
  assetName: string;
  assetType: string;
  valuation: number;
  lastValuationDate: string;
  isPledged: boolean;
}

export interface StatusChangeLog {
  date: string;
  from: LoanStatus | null;
  to: LoanStatus;
  reason: string;
}

export interface Loan {
  id: string;
  memoData: MemoData; // The original underwriting package
  bookingDate: string;
  status: LoanStatus;
  statusHistory: StatusChangeLog[];
  
  // Key Terms extracted for servicing
  principalAmount: number;
  interestRate: number; // annual %
  tenorMonths: number;
  repaymentType: 'Amortizing' | 'Interest Only' | 'Bullet';
  startDate: string;
  
  // Servicing Data
  schedule: ScheduleEntry[];
  ledger: LedgerEntry[];
  security: LoanSecurity[]; // New Collateral Management
  
  // Summary Stats
  totalInterestAccrued: number;
  totalPrincipalRepaid: number;
  outstandingBalance: number;
  nextPaymentDate?: string;
}


// Helper to generate empty rows
const generateRows = (count: number): ModelRow[] => 
  Array.from({ length: count }).map((_, i) => ({
    id: `empty-${i}`,
    label: '',
    format: 'text',
    values: {}
  }));

export const INITIAL_MODEL: FinancialModel = {
  activeSheetId: 'dashboard',
  activeScenario: 'Base Case',
  sheets: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      color: '#10b981', // Emerald
      columns: [
        { id: 'metric', label: 'KPI', type: 'output', width: 200 },
        { id: 'current', label: 'Current', type: 'output' },
        { id: 'target', label: 'Target', type: 'output' }
      ],
      rows: [
        { id: 'd1', label: 'COMPANY OVERVIEW', format: 'text', isHeader: true, values: {} },
        { id: 'd2', label: 'Sector', format: 'text', values: { 'current': 0, 'target': 0 } },
        { id: 'd3', label: 'Investment Date', format: 'text', values: { 'current': '2024-01-01' } },
        { id: 'd4', label: 'Investment Amount', format: 'currency', values: { 'current': 0, 'target': 0 } },
        { id: 'd5', label: 'KEY METRICS SUMMARY', format: 'text', isHeader: true, values: {} },
        { id: 'd6', label: 'Revenue', format: 'currency', values: { 'current': 0, 'target': 0 } },
        { id: 'd7', label: 'EBITDA', format: 'currency', values: { 'current': 0, 'target': 0 } },
        { id: 'd8', label: 'EBITDA Margin', format: 'percentage', values: { 'current': 0, 'target': 0 } },
        { id: 'd9', label: 'Net Leverage', format: 'number', values: { 'current': 0, 'target': 0 } },
        { id: 'd10', label: 'Interest Coverage', format: 'number', values: { 'current': 0, 'target': 0 } },
        { id: 'd11', label: 'DSCR', format: 'number', values: { 'current': 0, 'target': 0 } },
        { id: 'd12', label: 'INVESTMENT RETURNS', format: 'text', isHeader: true, values: {} },
        { id: 'd13', label: 'IRR', format: 'percentage', isCalculated: true, values: { 'current': 0, 'target': 0 } },
        { id: 'd14', label: 'MOIC', format: 'number', isCalculated: true, values: { 'current': 0, 'target': 0 } },
        { id: 'd15', label: 'NPV', format: 'currency', isCalculated: true, values: { 'current': 0, 'target': 0 } },
        // Charts placeholders
        { id: 'd16', label: 'VISUALIZATIONS', format: 'text', isHeader: true, values: {} },
        { id: 'd17', label: 'Revenue Growth Chart', format: 'text', values: { 'current': 'View in Memo' } },
        { id: 'd18', label: 'EBITDA Margin Trend', format: 'text', values: { 'current': 'View in Memo' } },
        { id: 'd19', label: 'Debt Service Coverage', format: 'text', values: { 'current': 'View in Memo' } },
        { id: 'd20', label: 'Capital Structure Stack', format: 'text', values: { 'current': 'View in Memo' } },
      ]
    },
    {
      id: 'assumptions',
      name: 'Assumptions',
      color: '#f59e0b', // Amber
      columns: [
        { id: 'param', label: 'Parameter', type: 'input', width: 250 },
        { id: 'value', label: 'Input Value', type: 'input', width: 150 },
        { id: 'notes', label: 'Notes', type: 'text', width: 300 }
      ],
      rows: [
        { id: 'a1', label: 'COMPANY INFORMATION', format: 'text', isHeader: true, values: {} },
        { id: 'a2', label: 'Company Name', format: 'text', values: { 'value': 'Target Co' } },
        { id: 'a3', label: 'Sector', format: 'text', values: { 'value': 'Technology' } },
        { id: 'a4', label: 'Jurisdiction', format: 'text', values: { 'value': 'US' } },
        { id: 'a5', label: 'Currency', format: 'text', values: { 'value': 'USD' } },
        { id: 'a6', label: 'Model Start Date', format: 'text', values: { 'value': '2024-01-01' } },
        { id: 'a7', label: 'Fiscal Year End', format: 'text', values: { 'value': '12/31' } },

        { id: 'a8', label: 'TRANSACTION STRUCTURE', format: 'text', isHeader: true, values: {} },
        { id: 'a9', label: 'Investment Amount', format: 'currency', values: { 'value': 0 } },
        { id: 'a10', label: 'Debt Amount', format: 'currency', values: { 'value': 0 } },
        { id: 'a11', label: 'Interest Rate', format: 'percentage', values: { 'value': 0 } },
        { id: 'a12', label: 'Loan Term (Years)', format: 'number', values: { 'value': 0 } },
        { id: 'a13', label: 'Amortization %', format: 'percentage', values: { 'value': 0 } },
        { id: 'a14', label: 'Exit Fee %', format: 'percentage', values: { 'value': 0 } },
        { id: 'a15', label: 'Origination Fee %', format: 'percentage', values: { 'value': 0 } },
        
        { id: 'a16', label: 'REVENUE ASSUMPTIONS', format: 'text', isHeader: true, values: {} },
        { id: 'a17', label: 'Base Year Revenue', format: 'currency', values: { 'value': 0 } },
        { id: 'a18', label: 'Annual Growth Rate', format: 'percentage', values: { 'value': 0 } },
        { id: 'a19', label: 'Customer Count', format: 'number', values: { 'value': 0 } },
        { id: 'a20', label: 'ARPU', format: 'currency', values: { 'value': 0 } },
        { id: 'a21', label: 'Churn Rate %', format: 'percentage', values: { 'value': 0 } },
        { id: 'a22', label: 'Market Size', format: 'currency', values: { 'value': 0 } },
        { id: 'a23', label: 'Market Share %', format: 'percentage', values: { 'value': 0 } },
        
        { id: 'a24', label: 'OPERATING ASSUMPTIONS', format: 'text', isHeader: true, values: {} },
        { id: 'a25', label: 'Gross Margin %', format: 'percentage', values: { 'value': 0 } },
        { id: 'a26', label: 'SG&A % of Revenue', format: 'percentage', values: { 'value': 0 } },
        { id: 'a27', label: 'R&D % of Revenue', format: 'percentage', values: { 'value': 0 } },
      ]
    }
  ]
};

export const INITIAL_MEMO_STATE: MemoData = {
  title: 'New Investment Memo',
  status: 'Draft',
  lastUpdated: new Date().toISOString().split('T')[0],
  
  // Section 1: Executive Summary
  recommendation: 'Pending Analysis',
  executiveSummary: '',
  investmentThesis: [],
  
  // Section 2: Terms & Structure
  keyTerms: [],
  termSheet: {
    borrower: 'Target Company',
    facilityType: 'Senior Term Loan',
    amount: '$0',
    tenor: '5 Years',
    pricing: 'TBD',
    baseRate: 'SOFR',
    spread: '5.0%',
    pricingGrid: [],
    fees: [],
    amortization: [],
    prepayments: [],
    maintenanceCovenants: [],
    negativeCovenants: [],
    collateral: [],
    conditionsPrecedent: [],
    reportingRequirements: []
  },
  capitalStructure: [],

  // Section 3: Business Summary
  companyOverview: '',
  marketAnalysis: '',

  // Section 4: Investment Highlights
  investmentHighlights: [],

  // Section 5: Risks
  risks: [],

  // Section 6: Returns & Downside
  scenarios: [],

  // Section 7: Collateral & Liquidation
  liquidationWaterfall: [],
  downsideAnalysis: '',

  // Section 8: Business Analysis
  businessAnalysis: '', 
  financialModel: INITIAL_MODEL,
  financialAnalysis: '',
};
