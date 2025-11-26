
import { FinancialModel } from "../types";

// --- Input Validation Logic ---

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  severity?: 'error' | 'warning';
}

export const validateCellInput = (value: string | number, format: 'currency' | 'percentage' | 'number' | 'text'): ValidationResult => {
  if (value === '' || value === null || value === undefined) return { isValid: true }; // Allow empty

  const strVal = String(value);

  if (format === 'text') return { isValid: true };

  // Numeric checks - allow negative numbers and decimals
  // Remove currency symbols or % before checking if user typed them
  const cleanVal = strVal.replace(/[$,%]/g, '');
  const numVal = parseFloat(cleanVal);

  if (isNaN(numVal)) {
    return { isValid: false, message: 'Must be a valid number', severity: 'error' };
  }

  if (format === 'percentage') {
    // heuristic: if user types "50" for 50%, it's usually fine, but if they type "5000", warn them.
    if (Math.abs(numVal) > 100 && numVal !== 0) {
      return { isValid: true, message: 'Value > 100%. Confirm intended.', severity: 'warning' };
    }
  }

  return { isValid: true };
};

// --- Integrity & Sense Checks ---

export interface HealthCheck {
  id: string;
  label: string;
  passed: boolean;
  details: string;
}

export const runModelHealthCheck = (model: FinancialModel): HealthCheck[] => {
  const checks: HealthCheck[] = [];

  // 1. Balance Sheet Check (Assets = Liabs + Equity)
  const bsSheet = model.sheets.find(s => s.id === 'bs');
  if (bsSheet) {
    const assetsRow = bsSheet.rows.find(r => r.label.toLowerCase().includes('total assets'));
    const liabsEquityRow = bsSheet.rows.find(r => r.label.toLowerCase().includes('total liab') && r.label.toLowerCase().includes('equity'));
    
    if (assetsRow && liabsEquityRow) {
      // Check projections columns
      const columns = bsSheet.columns.filter(c => c.type === 'projection');
      let isBalanced = true;
      let maxDiff = 0;

      columns.forEach(col => {
        const assets = typeof assetsRow.values[col.id] === 'number' ? Number(assetsRow.values[col.id]) : 0;
        const le = typeof liabsEquityRow.values[col.id] === 'number' ? Number(liabsEquityRow.values[col.id]) : 0;
        const diff = Math.abs(assets - le);
        if (diff > 0.1) { // Floating point tolerance
          isBalanced = false;
          if (diff > maxDiff) maxDiff = diff;
        }
      });

      checks.push({
        id: 'bs-balance',
        label: 'BS Balance',
        passed: isBalanced,
        details: isBalanced ? 'Balanced' : `Imbalance: $${maxDiff.toFixed(2)}`
      });
    } else {
        checks.push({ id: 'bs-struct', label: 'BS Balance', passed: false, details: 'Structure incomplete' });
    }
  }

  // 2. Cash Flow Reconciliation (Ending Cash = BS Cash)
  const cfSheet = model.sheets.find(s => s.id === 'cf');
  if (bsSheet && cfSheet) {
    const bsCashRow = bsSheet.rows.find(r => r.label.toLowerCase().includes('cash') && !r.label.toLowerCase().includes('flow'));
    const cfEndCashRow = cfSheet.rows.find(r => r.label.toLowerCase().includes('ending cash'));

    if (bsCashRow && cfEndCashRow) {
      const columns = cfSheet.columns.filter(c => c.type === 'projection');
      let isReconciled = true;
      
      columns.forEach(col => {
         const bsCash = Number(bsCashRow.values[col.id] || 0);
         const cfCash = Number(cfEndCashRow.values[col.id] || 0);
         if (Math.abs(bsCash - cfCash) > 0.1) {
           isReconciled = false;
         }
      });

      checks.push({
        id: 'cf-tie',
        label: 'Cash Tie',
        passed: isReconciled,
        details: isReconciled ? 'Reconciled' : 'CF does not tie to BS'
      });
    } else {
       checks.push({ id: 'cf-struct', label: 'Cash Tie', passed: false, details: 'Rows missing' });
    }
  }

  // 3. Leverage Check
  const debtSheet = model.sheets.find(s => s.id === 'debt');
  if (debtSheet) {
      const levRow = debtSheet.rows.find(r => r.label.toLowerCase().includes('total leverage'));
      
      if (levRow) {
          const columns = debtSheet.columns.filter(c => c.type === 'projection');
          let safeLeverage = true;
          let maxLev = 0;
          columns.forEach(col => {
              const val = Number(levRow.values[col.id] || 0);
              if (val > maxLev) maxLev = val;
              if (val > 6.5) safeLeverage = false; // Hard cap warning
          });
          checks.push({
              id: 'lev-check',
              label: 'Leverage',
              passed: safeLeverage,
              details: safeLeverage ? `Max ${maxLev.toFixed(1)}x` : `Critical: ${maxLev.toFixed(1)}x`
          });
      }
  }

  return checks;
};

// --- Formatting Utilities ---

export const formatValue = (value: string | number, format: 'currency' | 'percentage' | 'number' | 'text'): string => {
  if (value === undefined || value === null || value === '') return '-';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        maximumFractionDigits: 0,
        notation: Math.abs(num) > 1000000 ? "compact" : "standard"
      }).format(num);
    case 'percentage':
      // If the value is 0.05, display 5.0%. If it's 5, display 500%? 
      // Convention: inputs usually decimal (0.10)
      return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(num);
    case 'number':
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(num);
    default:
      return String(value);
  }
};
