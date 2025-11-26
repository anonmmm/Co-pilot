
import { Loan, MemoData, ScheduleEntry, LedgerEntry, INITIAL_MEMO_STATE, LoanSecurity, StatusChangeLog } from "../types";

// Helper to clean currency strings
const parseAmount = (val: string | number): number => {
  if (typeof val === 'number') return val;
  return parseFloat(val.replace(/[^0-9.-]+/g, ""));
};

// Helper to clean percentage strings
const parseRate = (val: string | number): number => {
  if (typeof val === 'number') return val;
  const clean = parseFloat(val.replace(/[^0-9.-]+/g, ""));
  return val.includes('%') ? clean / 100 : clean;
};

// Advanced Schedule Calculator
export const calculateAmortizationSchedule = (
  principal: number,
  annualRate: number,
  months: number,
  startDate: Date,
  type: 'Amortizing' | 'Interest Only' | 'Bullet' = 'Amortizing'
): ScheduleEntry[] => {
  const schedule: ScheduleEntry[] = [];
  const monthlyRate = annualRate / 12;
  
  let currentBalance = principal;
  let currentDate = new Date(startDate);

  // Standard Amortization PMT
  let amortizingPmt = 0;
  if (monthlyRate > 0) {
      amortizingPmt = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  } else {
      amortizingPmt = principal / months;
  }

  for (let i = 1; i <= months; i++) {
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    const interestPayment = currentBalance * monthlyRate;
    let principalPayment = 0;
    let totalPayment = 0;

    if (type === 'Amortizing') {
      principalPayment = amortizingPmt - interestPayment;
      totalPayment = amortizingPmt;
    } else if (type === 'Interest Only') {
      // Pay interest only, principal at end
      principalPayment = (i === months) ? currentBalance : 0;
      totalPayment = interestPayment + principalPayment;
    } else if (type === 'Bullet') {
      // Bullet typically implies Interest + Principal at maturity (Zero Coupon style) OR Interest Only behavior.
      // We will treat "Bullet" as a single lump sum payment at the end for this system.
      principalPayment = (i === months) ? principal : 0;
      // Simple interest accumulation representation
      totalPayment = (i === months) ? (principal * (1 + monthlyRate * months)) : 0;
    }

    // Determine closing balance
    let closingBalance = currentBalance - principalPayment;
    // For bullet, balance conceptually remains until paid
    if (type === 'Bullet' && i < months) {
        closingBalance = currentBalance; 
    }
    
    schedule.push({
      period: i,
      dueDate: currentDate.toISOString().split('T')[0],
      openingBalance: currentBalance,
      interest: interestPayment,
      principal: principalPayment,
      totalPayment: totalPayment,
      closingBalance: Math.max(0, closingBalance),
      status: 'Pending'
    });
    
    currentBalance = closingBalance;
  }

  return schedule;
};

export const createLoanFromMemo = (memo: MemoData): Loan => {
  const principal = parseAmount(memo.termSheet.amount) || 1000000;
  
  let rate = 0.08; 
  if (memo.termSheet.baseRate && memo.termSheet.spread) {
      const baseNum = parseRate(memo.termSheet.baseRate) || 0.05;
      const spreadNum = parseRate(memo.termSheet.spread) || 0.03;
      rate = baseNum + spreadNum;
  }

  const years = parseFloat(memo.termSheet.tenor.split(' ')[0]) || 5;
  const months = Math.round(years * 12);
  const bookingDate = new Date().toISOString().split('T')[0];

  // Determine Repayment Type based on memo text
  let repaymentType: 'Amortizing' | 'Interest Only' | 'Bullet' = 'Amortizing';
  const amortText = JSON.stringify(memo.termSheet.amortization).toLowerCase();
  const tenorText = memo.termSheet.tenor.toLowerCase();
  
  if (tenorText.includes('bullet') || amortText.includes('bullet')) {
    repaymentType = 'Bullet';
  } else if (amortText.includes('interest only') || amortText.includes('io')) {
    repaymentType = 'Interest Only';
  }

  // Map Collateral
  const security: LoanSecurity[] = memo.termSheet.collateral.map((c, i) => ({
    id: `sec-${Date.now()}-${i}`,
    assetName: c.assetCategory,
    assetType: 'Tangible',
    valuation: c.bookValue,
    lastValuationDate: bookingDate,
    isPledged: true
  }));

  const schedule = calculateAmortizationSchedule(principal, rate, months, new Date(), repaymentType);

  const statusHistory: StatusChangeLog[] = [{
    date: bookingDate,
    from: null,
    to: 'Sanctioned',
    reason: 'Loan origination from Investment Memo'
  }];

  return {
    id: `LOAN-${Math.floor(1000 + Math.random() * 9000)}`,
    memoData: memo,
    bookingDate: bookingDate,
    status: 'Sanctioned',
    statusHistory: statusHistory,
    principalAmount: principal,
    interestRate: rate,
    tenorMonths: months,
    repaymentType: repaymentType,
    startDate: bookingDate,
    schedule: schedule,
    ledger: [], 
    security: security,
    totalInterestAccrued: 0,
    totalPrincipalRepaid: 0,
    outstandingBalance: principal,
    nextPaymentDate: undefined 
  };
};

export interface ManualLoanInput {
  borrower: string;
  facilityType: string;
  amount: number;
  interestRate: number;
  tenorMonths: number;
  startDate: string;
  repaymentType: 'Amortizing' | 'Interest Only' | 'Bullet';
}

export const createManualLoan = (input: ManualLoanInput): Loan => {
  const schedule = calculateAmortizationSchedule(
    input.amount,
    input.interestRate,
    input.tenorMonths,
    new Date(input.startDate),
    input.repaymentType
  );

  const dummyMemo: MemoData = {
    ...INITIAL_MEMO_STATE,
    title: `Manual Loan: ${input.borrower}`,
    status: 'Approved',
    termSheet: {
      ...INITIAL_MEMO_STATE.termSheet,
      borrower: input.borrower,
      facilityType: input.facilityType,
      amount: `$${input.amount.toLocaleString()}`,
      tenor: `${(input.tenorMonths / 12).toFixed(1)} Years`,
      pricing: `${(input.interestRate * 100).toFixed(2)}% ${input.repaymentType}`,
      baseRate: 'Fixed',
      spread: `${(input.interestRate * 100).toFixed(2)}%`,
      collateral: []
    }
  };

  const statusHistory: StatusChangeLog[] = [{
    date: input.startDate,
    from: null,
    to: 'Sanctioned',
    reason: 'Manual loan origination'
  }];

  return {
    id: `LOAN-M-${Math.floor(1000 + Math.random() * 9000)}`,
    memoData: dummyMemo,
    bookingDate: input.startDate,
    status: 'Sanctioned',
    statusHistory: statusHistory,
    principalAmount: input.amount,
    interestRate: input.interestRate,
    tenorMonths: input.tenorMonths,
    repaymentType: input.repaymentType,
    startDate: input.startDate,
    schedule: schedule,
    ledger: [],
    security: [],
    totalInterestAccrued: 0,
    totalPrincipalRepaid: 0,
    outstandingBalance: input.amount,
    nextPaymentDate: undefined
  };
};

export const disburseLoan = (loan: Loan): Loan => {
  if (loan.status !== 'Sanctioned') return loan;

  const disbursementDate = new Date();
  const dateStr = disbursementDate.toISOString().split('T')[0];

  const newSchedule = calculateAmortizationSchedule(
    loan.principalAmount, 
    loan.interestRate, 
    loan.tenorMonths, 
    disbursementDate,
    loan.repaymentType
  );

  const disbursementEntry: LedgerEntry = {
    id: `txn-${Date.now()}`,
    date: dateStr,
    description: "Loan Disbursement",
    debit: loan.principalAmount,
    credit: 0,
    balance: loan.principalAmount
  };

  const historyEntry: StatusChangeLog = {
    date: dateStr,
    from: loan.status,
    to: 'Repaying',
    reason: 'Disbursement executed'
  };

  return {
    ...loan,
    status: 'Repaying',
    statusHistory: [...loan.statusHistory, historyEntry],
    startDate: dateStr,
    schedule: newSchedule,
    ledger: [disbursementEntry],
    nextPaymentDate: newSchedule[0]?.dueDate
  };
};

export const payInstallment = (loan: Loan): Loan => {
  if (loan.status !== 'Repaying' && loan.status !== 'Default') return loan;

  const nextInstallmentIndex = loan.schedule.findIndex(s => s.status === 'Pending' || s.status === 'Overdue');
  if (nextInstallmentIndex === -1) return loan; 

  const installment = loan.schedule[nextInstallmentIndex];
  const paymentDate = new Date().toISOString().split('T')[0];
  const timestamp = Date.now();

  // 1. Accrue Interest Transaction (Debit)
  const interestEntry: LedgerEntry = {
    id: `int-${timestamp}-1`,
    date: paymentDate,
    description: `Interest Accrual - Period #${installment.period}`,
    debit: installment.interest,
    credit: 0,
    balance: loan.outstandingBalance + installment.interest
  };

  // 2. Repayment Transaction (Credit)
  const repaymentEntry: LedgerEntry = {
    id: `pay-${timestamp}-2`,
    date: paymentDate,
    description: `Repayment - Installment #${installment.period}`,
    debit: 0,
    credit: installment.totalPayment,
    // Balance calculation: (Old + Interest) - Payment = Old - Principal
    balance: (loan.outstandingBalance + installment.interest) - installment.totalPayment
  };

  const newSchedule = [...loan.schedule];
  newSchedule[nextInstallmentIndex] = {
    ...installment,
    status: 'Paid'
  };

  const newPrincipalRepaid = loan.totalPrincipalRepaid + installment.principal;
  const newInterestAccrued = loan.totalInterestAccrued + installment.interest;
  const newOutstanding = Math.max(0, loan.outstandingBalance - installment.principal);
  
  // Check if loan is effectively closed (tolerance for floating point)
  const isClosed = newOutstanding < 0.01 || (nextInstallmentIndex === newSchedule.length - 1 && newOutstanding < 1);
  const newStatus = isClosed ? 'Closed' : loan.status;

  let newHistory = [...loan.statusHistory];
  if (isClosed) {
    newHistory.push({
      date: paymentDate,
      from: loan.status,
      to: 'Closed',
      reason: 'Loan fully repaid'
    });
  }

  return {
    ...loan,
    schedule: newSchedule,
    // Add repayment first (top of stack), then interest, then old entries
    ledger: [repaymentEntry, interestEntry, ...loan.ledger], 
    totalPrincipalRepaid: newPrincipalRepaid,
    totalInterestAccrued: newInterestAccrued,
    outstandingBalance: newOutstanding,
    status: newStatus,
    statusHistory: newHistory,
    nextPaymentDate: isClosed ? undefined : newSchedule[nextInstallmentIndex + 1]?.dueDate
  };
};

export const markLoanAsDefault = (loan: Loan, reason: string): Loan => {
  const historyEntry: StatusChangeLog = {
    date: new Date().toISOString().split('T')[0],
    from: loan.status,
    to: 'Default',
    reason: reason
  };

  return {
    ...loan,
    status: 'Default',
    statusHistory: [...loan.statusHistory, historyEntry]
  };
};

export const writeOffLoan = (loan: Loan): Loan => {
  if (loan.status === 'Closed' || loan.outstandingBalance < 0.01) return loan;

  const date = new Date().toISOString().split('T')[0];
  const amount = loan.outstandingBalance;

  const writeOffEntry: LedgerEntry = {
    id: `wo-${Date.now()}`,
    date,
    description: "Write-off (Bad Debt)",
    debit: 0,
    credit: amount, // Credit the remaining balance to zero it out
    balance: 0
  };

  const statusEntry: StatusChangeLog = {
    date,
    from: loan.status,
    to: 'Closed', // Effectively closed from active tracking
    reason: 'Written Off'
  };

  return {
    ...loan,
    status: 'Closed',
    outstandingBalance: 0,
    ledger: [writeOffEntry, ...loan.ledger],
    statusHistory: [...loan.statusHistory, statusEntry],
    nextPaymentDate: undefined
  };
};

export const applyFee = (loan: Loan, description: string, amount: number): Loan => {
  const feeEntry: LedgerEntry = {
    id: `fee-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    description: description,
    debit: amount,
    credit: 0,
    balance: loan.outstandingBalance + amount
  };

  return {
    ...loan,
    ledger: [feeEntry, ...loan.ledger],
    outstandingBalance: loan.outstandingBalance + amount
  };
};

export const addCollateral = (loan: Loan, item: LoanSecurity): Loan => {
  return {
    ...loan,
    security: [...loan.security, item]
  };
};

export const updateSecurityValue = (loan: Loan, securityId: string, newValue: number): Loan => {
  const newSecurity = loan.security.map(s => 
    s.id === securityId 
      ? { ...s, valuation: newValue, lastValuationDate: new Date().toISOString().split('T')[0] } 
      : s
  );
  return { ...loan, security: newSecurity };
};

export const toggleSecurityPledge = (loan: Loan, securityId: string): Loan => {
  const newSecurity = loan.security.map(s => 
    s.id === securityId 
      ? { ...s, isPledged: !s.isPledged } 
      : s
  );
  return { ...loan, security: newSecurity };
};
