
import React, { useState } from 'react';
import { Loan, LoanStatus, ScheduleEntry, LedgerEntry, LoanSecurity, StatusChangeLog } from '../types';
import { 
  Briefcase, Calendar, DollarSign, FileText, PieChart, 
  ArrowRight, CheckCircle2, AlertCircle, Clock, ChevronRight,
  Download, Activity, History, Wallet, Check, Plus, X, Shield, Landmark, AlertTriangle, Lock, Unlock, Trash2
} from 'lucide-react';
import { MemoCanvas } from './MemoCanvas';
import { disburseLoan, payInstallment, createManualLoan, ManualLoanInput, applyFee, addCollateral, updateSecurityValue, markLoanAsDefault, toggleSecurityPledge, writeOffLoan } from '../services/lending';

interface LMSDashboardProps {
  loans: Loan[];
  onUpdateLoan?: (loan: Loan) => void;
  onAddLoan?: (loan: Loan) => void;
}

export const LMSDashboard: React.FC<LMSDashboardProps> = ({ loans, onUpdateLoan, onAddLoan }) => {
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form State
  const [newLoanParams, setNewLoanParams] = useState<ManualLoanInput>({
    borrower: '',
    facilityType: 'Term Loan',
    amount: 1000000,
    interestRate: 0.085,
    tenorMonths: 60,
    startDate: new Date().toISOString().split('T')[0],
    repaymentType: 'Amortizing'
  });

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddLoan) return;
    
    const newLoan = createManualLoan(newLoanParams);
    onAddLoan(newLoan);
    setIsAddModalOpen(false);
    setNewLoanParams({ ...newLoanParams, borrower: '', amount: 1000000 });
  };

  const selectedLoan = loans.find(l => l.id === selectedLoanId);

  if (selectedLoan) {
    return (
      <LoanDetailView 
        loan={selectedLoan} 
        onBack={() => setSelectedLoanId(null)} 
        onUpdate={(updated) => onUpdateLoan?.(updated)}
      />
    );
  }

  return (
    <div className="flex-1 bg-slate-50 p-8 overflow-y-auto relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
           <div>
             <h1 className="text-3xl font-serif font-bold text-slate-900">Loan Portfolio</h1>
             <p className="text-slate-500 mt-1">Manage sanctioned and active credit facilities</p>
           </div>
           <div className="flex gap-4">
             <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hidden md:block">
                <div className="text-xs text-slate-400 uppercase font-bold">Total Exposure</div>
                <div className="text-xl font-mono font-bold text-indigo-600">
                  ${loans.reduce((sum, l) => sum + l.outstandingBalance, 0).toLocaleString()}
                </div>
             </div>
             
             <button 
               onClick={() => setIsAddModalOpen(true)}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md flex items-center gap-2 transition-colors"
             >
               <Plus className="w-4 h-4" /> New Loan
             </button>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Loan ID</th>
                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Borrower</th>
                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Sanctioned Amt</th>
                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Balance</th>
                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                 <th className="px-6 py-4"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {loans.map(loan => (
                 <tr key={loan.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedLoanId(loan.id)}>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">#{loan.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{loan.memoData.termSheet.borrower}</div>
                      <div className="text-xs text-slate-500">{loan.memoData.termSheet.facilityType}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-slate-600">
                      ${loan.principalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-indigo-600">
                      ${loan.outstandingBalance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs">
                       <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{loan.repaymentType}</span>
                    </td>
                    <td className="px-6 py-4">
                       <StatusBadge status={loan.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setSelectedLoanId(loan.id); }}
                         className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all"
                       >
                         Manage <ArrowRight className="w-4 h-4" />
                       </button>
                    </td>
                 </tr>
               ))}
               {loans.length === 0 && (
                 <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                     No loans booked yet. Create one manually or from a memo.
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>

      {/* Manual Loan Creation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-bold text-slate-900">Book New Loan</h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <form onSubmit={handleCreateLoan} className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Borrower Name</label>
                    <input 
                      required
                      type="text" 
                      value={newLoanParams.borrower}
                      onChange={e => setNewLoanParams({...newLoanParams, borrower: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      placeholder="e.g. Acme Corp"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Repayment Type</label>
                    <select 
                      value={newLoanParams.repaymentType}
                      onChange={e => setNewLoanParams({...newLoanParams, repaymentType: e.target.value as any})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white"
                    >
                      <option value="Amortizing">Amortizing (Principal + Interest)</option>
                      <option value="Interest Only">Interest Only (Bullet at end)</option>
                      <option value="Bullet">Bullet (Zero payments until end)</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ($)</label>
                        <input 
                          required
                          type="number" 
                          min="1"
                          value={newLoanParams.amount}
                          onChange={e => setNewLoanParams({...newLoanParams, amount: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Interest Rate</label>
                        <div className="relative">
                          <input 
                            required
                            type="number" 
                            step="0.01"
                            value={newLoanParams.interestRate * 100}
                            onChange={e => setNewLoanParams({...newLoanParams, interestRate: Number(e.target.value) / 100})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm pr-8"
                          />
                          <span className="absolute right-3 top-2 text-slate-400 text-sm">%</span>
                        </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tenor (Months)</label>
                        <input 
                          required
                          type="number" 
                          min="1"
                          value={newLoanParams.tenorMonths}
                          onChange={e => setNewLoanParams({...newLoanParams, tenorMonths: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                        <input 
                          required
                          type="date" 
                          value={newLoanParams.startDate}
                          onChange={e => setNewLoanParams({...newLoanParams, startDate: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        />
                    </div>
                 </div>

                 <div className="pt-4 flex justify-end gap-2">
                    <button 
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                    >
                      Create Loan
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const LoanDetailView: React.FC<{ loan: Loan; onBack: () => void; onUpdate: (l: Loan) => void }> = ({ loan, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'ledger' | 'security' | 'docs' | 'history'>('overview');

  const handleDisburse = () => {
    const updated = disburseLoan(loan);
    onUpdate(updated);
  };

  const handlePayment = () => {
    const updated = payInstallment(loan);
    onUpdate(updated);
  };

  const handleDefault = () => {
    const reason = window.prompt("Please state the reason for default (e.g. Missed Payment):");
    if (reason) {
       const updated = markLoanAsDefault(loan, reason);
       onUpdate(updated);
    }
  };

  const handleWriteOff = () => {
    if (window.confirm("Are you sure you want to write off this loan? This action cannot be undone and will set the balance to zero.")) {
       const updated = writeOffLoan(loan);
       onUpdate(updated);
    }
  };

  const handleAddFee = (desc: string, amount: number) => {
    const updated = applyFee(loan, desc, amount);
    onUpdate(updated);
  };

  const handleAddCollateral = (item: LoanSecurity) => {
    const updated = addCollateral(loan, item);
    onUpdate(updated);
  };

  const handleUpdateSecurityValue = (id: string, val: number) => {
    const updated = updateSecurityValue(loan, id, val);
    onUpdate(updated);
  };

  const handleTogglePledge = (id: string) => {
    const updated = toggleSecurityPledge(loan, id);
    onUpdate(updated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
         <button onClick={onBack} className="text-slate-400 hover:text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1 transition-colors">
            <ArrowRight className="w-3 h-3 rotate-180" /> Back to Portfolio
         </button>
         <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl font-serif font-bold text-slate-900">{loan.memoData.termSheet.borrower}</h1>
                 <StatusBadge status={loan.status} />
              </div>
              <p className="text-slate-500 flex items-center gap-2">
                 <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">ID: {loan.id}</span>
                 <span>•</span>
                 <span>{loan.memoData.termSheet.facilityType}</span>
              </p>
            </div>
            <div className="flex gap-2">
                {loan.status === 'Sanctioned' && (
                  <button 
                    onClick={handleDisburse}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" /> Disburse Loan
                  </button>
                )}
                {(loan.status === 'Repaying' || loan.status === 'Default') && (
                   <>
                     <button 
                      onClick={handlePayment}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                     >
                       <Check className="w-4 h-4" /> Record Payment
                     </button>
                     
                     {loan.status === 'Repaying' && (
                        <button 
                          onClick={handleDefault}
                          className="bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center gap-2 border border-red-100"
                        >
                          <AlertTriangle className="w-4 h-4" /> Mark Default
                        </button>
                     )}

                     <button 
                        onClick={handleWriteOff}
                        className="bg-slate-800 text-slate-200 hover:bg-slate-900 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
                        title="Write off remaining balance"
                     >
                        <Trash2 className="w-4 h-4" /> Write Off
                     </button>
                   </>
                )}
            </div>
         </div>

         <div className="flex gap-8 mt-8 border-b border-slate-100 pb-1">
            {['overview', 'schedule', 'ledger', 'security', 'history', 'docs'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-3 text-sm font-bold capitalize transition-all border-b-2 ${
                  activeTab === tab 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
              >
                {tab === 'docs' ? 'Original Memo' : tab}
              </button>
            ))}
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
         {activeTab === 'overview' && <OverviewTab loan={loan} onPay={handlePayment} />}
         {activeTab === 'schedule' && <ScheduleTab schedule={loan.schedule} />}
         {activeTab === 'ledger' && <LedgerTab ledger={loan.ledger} onAddFee={handleAddFee} />}
         {activeTab === 'security' && (
            <SecurityTab 
              security={loan.security} 
              loanBalance={loan.outstandingBalance} 
              onAddCollateral={handleAddCollateral}
              onUpdateValue={handleUpdateSecurityValue}
              onTogglePledge={handleTogglePledge}
            />
         )}
         {activeTab === 'history' && <StatusHistoryTab history={loan.statusHistory} />}
         {activeTab === 'docs' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[800px]">
              <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700">Archived Investment Memo</h3>
                 <span className="text-xs text-slate-500">Read-Only View</span>
              </div>
              <div className="p-8 bg-slate-50 overflow-auto h-full">
                 <MemoCanvas data={loan.memoData} onUpdate={() => {}} /> 
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{ loan: Loan; onPay: () => void }> = ({ loan, onPay }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
     {/* Stats Cards */}
     <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Principal Amount" value={`$${loan.principalAmount.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} />
        <StatsCard label="Outstanding Balance" value={`$${loan.outstandingBalance.toLocaleString()}`} icon={<PieChart className="w-5 h-5" />} highlight />
        <StatsCard label="Interest Rate" value={`${(loan.interestRate * 100).toFixed(2)}%`} icon={<Activity className="w-5 h-5" />} />
        <StatsCard label="Repayment Type" value={loan.repaymentType} icon={<Calendar className="w-5 h-5" />} />
     </div>

     {/* Main Info */}
     <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
             <Briefcase className="w-4 h-4 text-indigo-500" /> Facility Details
           </h3>
           <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-slate-500">Borrower</div>
              <div className="font-medium text-slate-900">{loan.memoData.termSheet.borrower}</div>
              
              <div className="text-slate-500">Facility Type</div>
              <div className="font-medium text-slate-900">{loan.memoData.termSheet.facilityType}</div>

              <div className="text-slate-500">Booking Date</div>
              <div className="font-medium text-slate-900">{loan.bookingDate}</div>
              
              <div className="text-slate-500">Maturity Date</div>
              <div className="font-medium text-slate-900">{loan.schedule[loan.schedule.length - 1]?.dueDate}</div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
             <AlertCircle className="w-4 h-4 text-amber-500" /> Active Covenants
           </h3>
           <div className="space-y-3">
              {loan.memoData.termSheet.maintenanceCovenants.map((cov, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                   <span className="text-sm font-medium text-slate-700">{cov.name}</span>
                   <div className="text-right">
                      <div className="text-xs font-bold text-indigo-600">{cov.targetLevel}</div>
                      <div className="text-[10px] text-slate-400">{cov.frequency}</div>
                   </div>
                </div>
              ))}
              {loan.memoData.termSheet.maintenanceCovenants.length === 0 && (
                <div className="text-sm text-slate-400 italic">No maintenance covenants tracked.</div>
              )}
           </div>
        </div>
     </div>

     {/* Side Info */}
     <div className="space-y-8">
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
           <h3 className="text-sm font-bold text-indigo-200 uppercase mb-6 relative z-10">Next Payment</h3>
           
           <div className="relative z-10">
              {loan.status === 'Sanctioned' ? (
                 <div className="text-center py-8 text-slate-400 italic">
                    Loan not yet disbursed
                 </div>
              ) : loan.status === 'Closed' ? (
                 <div className="text-center py-8 text-emerald-400 font-bold">
                    Loan Closed / Fully Repaid
                 </div>
              ) : (
                <>
                  <div className="text-3xl font-bold mb-1">
                     ${loan.schedule.find(s => s.status === 'Pending' || s.status === 'Overdue')?.totalPayment.toLocaleString() || '0.00'}
                  </div>
                  <div className="text-sm text-slate-400 mb-6">
                     {loan.status === 'Default' ? 'Overdue' : `Due ${loan.nextPaymentDate}`}
                  </div>
                  <button 
                    onClick={onPay}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 rounded-lg transition-colors"
                  >
                     Record Payment
                  </button>
                </>
              )}
           </div>
        </div>
     </div>
  </div>
);

const StatusHistoryTab: React.FC<{ history: StatusChangeLog[] }> = ({ history }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
       <History className="w-4 h-4 text-slate-500" /> Status Change Log
    </h3>
    <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
       {history.map((log, i) => (
         <div key={i} className="relative pl-8">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-100 border-2 border-indigo-500"></div>
            <div className="mb-1 flex items-center gap-2">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{log.date}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
               <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-700">{log.from || 'Start'}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="font-bold text-indigo-700">{log.to}</span>
               </div>
               <p className="text-sm text-slate-600">{log.reason}</p>
            </div>
         </div>
       ))}
    </div>
  </div>
);

const ScheduleTab: React.FC<{ schedule: ScheduleEntry[] }> = ({ schedule }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <table className="w-full text-left text-sm">
       <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
         <tr>
           <th className="px-6 py-3">#</th>
           <th className="px-6 py-3">Due Date</th>
           <th className="px-6 py-3 text-right">Begin Balance</th>
           <th className="px-6 py-3 text-right">Principal</th>
           <th className="px-6 py-3 text-right">Interest</th>
           <th className="px-6 py-3 text-right">Total Payment</th>
           <th className="px-6 py-3 text-right">End Balance</th>
           <th className="px-6 py-3 text-center">Status</th>
         </tr>
       </thead>
       <tbody className="divide-y divide-slate-100">
         {schedule.map((row) => (
           <tr key={row.period} className="hover:bg-slate-50">
              <td className="px-6 py-3 text-slate-500">{row.period}</td>
              <td className="px-6 py-3 font-medium text-slate-900">{row.dueDate}</td>
              <td className="px-6 py-3 text-right text-slate-500 font-mono">${row.openingBalance.toFixed(2)}</td>
              <td className="px-6 py-3 text-right text-indigo-600 font-mono">${row.principal.toFixed(2)}</td>
              <td className="px-6 py-3 text-right text-amber-600 font-mono">${row.interest.toFixed(2)}</td>
              <td className="px-6 py-3 text-right font-bold text-slate-900 font-mono">${row.totalPayment.toFixed(2)}</td>
              <td className="px-6 py-3 text-right text-slate-500 font-mono">${row.closingBalance.toFixed(2)}</td>
              <td className="px-6 py-3 text-center">
                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                   row.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                   row.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                 }`}>
                   {row.status}
                 </span>
              </td>
           </tr>
         ))}
       </tbody>
    </table>
  </div>
);

const LedgerTab: React.FC<{ ledger: LedgerEntry[]; onAddFee: (desc: string, amount: number) => void }> = ({ ledger, onAddFee }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFee(description, amount);
    setIsModalOpen(false);
    setDescription('');
    setAmount(0);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
       <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
             <History className="w-4 h-4" /> Transaction History
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 px-3 py-1.5 rounded transition-colors"
          >
            + Add Fee/Charge
          </button>
       </div>
       <table className="w-full text-left text-sm">
         <thead className="bg-white border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
           <tr>
             <th className="px-6 py-3">Date</th>
             <th className="px-6 py-3">Transaction ID</th>
             <th className="px-6 py-3">Description</th>
             <th className="px-6 py-3 text-right">Debit</th>
             <th className="px-6 py-3 text-right">Credit</th>
             <th className="px-6 py-3 text-right">Balance</th>
           </tr>
         </thead>
         <tbody className="divide-y divide-slate-100">
            {ledger.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-3 text-slate-600">{entry.date}</td>
                <td className="px-6 py-3 font-mono text-xs text-slate-400">{entry.id}</td>
                <td className="px-6 py-3 font-medium text-slate-900">{entry.description}</td>
                <td className="px-6 py-3 text-right font-mono text-slate-600">{entry.debit > 0 ? `$${entry.debit.toLocaleString()}` : '-'}</td>
                <td className="px-6 py-3 text-right font-mono text-emerald-600">{entry.credit > 0 ? `$${entry.credit.toLocaleString()}` : '-'}</td>
                <td className="px-6 py-3 text-right font-mono font-bold text-slate-900">${entry.balance.toLocaleString()}</td>
              </tr>
            ))}
            {ledger.length === 0 && (
               <tr>
                 <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">No transactions recorded yet.</td>
               </tr>
            )}
         </tbody>
       </table>

       {isModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96 border border-slate-100 animate-in fade-in zoom-in-95">
               <h3 className="font-bold text-lg mb-4 text-slate-900">Add Ad-hoc Charge</h3>
               <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                     <input className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Late Payment Fee" value={description} onChange={e => setDescription(e.target.value)} required />
                  </div>
                  <div className="mb-6">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ($)</label>
                     <input type="number" step="0.01" className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
                  </div>
                  <div className="flex justify-end gap-2">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                     <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">Add Charge</button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};

const SecurityTab: React.FC<{ 
  security: LoanSecurity[]; 
  loanBalance: number;
  onAddCollateral: (item: LoanSecurity) => void;
  onUpdateValue: (id: string, val: number) => void;
  onTogglePledge: (id: string) => void;
}> = ({ security, loanBalance, onAddCollateral, onUpdateValue, onTogglePledge }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCollateral, setNewCollateral] = useState({ name: '', type: 'Tangible', value: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  // Filter only pledged assets for LTV
  const activeCollateralValue = security.filter(s => s.isPledged).reduce((sum, s) => sum + s.valuation, 0);
  const ltv = activeCollateralValue > 0 ? (loanBalance / activeCollateralValue) * 100 : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCollateral({
      id: `sec-${Date.now()}`,
      assetName: newCollateral.name,
      assetType: newCollateral.type,
      valuation: newCollateral.value,
      lastValuationDate: new Date().toISOString().split('T')[0],
      isPledged: true
    });
    setIsAddModalOpen(false);
    setNewCollateral({ name: '', type: 'Tangible', value: 0 });
  };

  const startEdit = (id: string, currentVal: number) => {
    setEditingId(id);
    setEditValue(currentVal);
  };

  const saveEdit = (id: string) => {
    onUpdateValue(id, editValue);
    setEditingId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
             <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                   <Shield className="w-4 h-4" /> Pledged Assets
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded transition-colors border border-indigo-200">+ Add Collateral</button>
             </div>
             <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                   <tr>
                      <th className="px-6 py-3">Asset Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3 text-right">Valuation</th>
                      <th className="px-6 py-3">Last Valued</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 w-10"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {security.map(sec => (
                      <tr key={sec.id} className={`group hover:bg-slate-50 ${!sec.isPledged ? 'opacity-60 bg-slate-50/50' : ''}`}>
                         <td className="px-6 py-3 font-medium text-slate-900">{sec.assetName}</td>
                         <td className="px-6 py-3 text-slate-500">{sec.assetType}</td>
                         <td className="px-6 py-3 text-right font-mono text-slate-700 relative">
                            {editingId === sec.id ? (
                              <div className="flex items-center justify-end gap-2 absolute right-4 top-1.5 z-10 bg-white shadow-lg p-1 rounded border border-slate-200">
                                <input 
                                  type="number" 
                                  value={editValue} 
                                  onChange={e => setEditValue(Number(e.target.value))}
                                  className="w-24 border border-slate-300 rounded px-2 py-1 text-xs"
                                  autoFocus
                                />
                                <button onClick={() => saveEdit(sec.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check className="w-3 h-3" /></button>
                                <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded"><X className="w-3 h-3" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                ${sec.valuation.toLocaleString()}
                                <button onClick={() => startEdit(sec.id, sec.valuation)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity">
                                   <Clock className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                         </td>
                         <td className="px-6 py-3 text-slate-500 text-xs">{sec.lastValuationDate}</td>
                         <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                               sec.isPledged 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                               {sec.isPledged ? 'Pledged' : 'Released'}
                            </span>
                         </td>
                         <td className="px-6 py-3 text-right">
                            <button 
                              onClick={() => onTogglePledge(sec.id)}
                              title={sec.isPledged ? "Release Collateral" : "Re-pledge Collateral"}
                              className="text-slate-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                            >
                               {sec.isPledged ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                         </td>
                      </tr>
                   ))}
                   {security.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">No collateral pledged.</td></tr>
                   )}
                </tbody>
             </table>
          </div>
       </div>
       <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Loan to Value (LTV)</h3>
             <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-3xl font-bold ${ltv > 80 ? 'text-red-600' : 'text-emerald-600'}`}>{ltv.toFixed(1)}%</span>
                <span className="text-xs text-slate-400">Current Ratio</span>
             </div>
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                <div className={`h-full rounded-full transition-all duration-500 ${ltv > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(ltv, 100)}%` }}></div>
             </div>
             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
                <div>
                   <div className="text-slate-400 text-xs">Active Collateral</div>
                   <div className="font-medium text-slate-900">${activeCollateralValue.toLocaleString()}</div>
                </div>
                <div>
                   <div className="text-slate-400 text-xs">Loan Exposure</div>
                   <div className="font-medium text-slate-900">${loanBalance.toLocaleString()}</div>
                </div>
             </div>
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
             <div className="flex gap-3">
                <Landmark className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                   <h4 className="text-sm font-bold text-indigo-900 mb-1">Collateral Monitoring</h4>
                   <p className="text-xs text-indigo-700 leading-relaxed">
                      Valuations should be updated quarterly. LTV covenants are tested based on the active pledged valuation figures.
                   </p>
                </div>
             </div>
          </div>
       </div>

       {isAddModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96 border border-slate-100 animate-in fade-in zoom-in-95">
               <h3 className="font-bold text-lg mb-4 text-slate-900">Add New Collateral</h3>
               <form onSubmit={handleAdd}>
                  <div className="mb-4">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asset Name</label>
                     <input 
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="e.g. Warehouse A" 
                        value={newCollateral.name} 
                        onChange={e => setNewCollateral({...newCollateral, name: e.target.value})} 
                        required 
                     />
                  </div>
                  <div className="mb-4">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asset Type</label>
                     <select 
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={newCollateral.type}
                        onChange={e => setNewCollateral({...newCollateral, type: e.target.value})}
                     >
                        <option value="Real Estate">Real Estate</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Receivables">Receivables</option>
                        <option value="IP">Intellectual Property</option>
                     </select>
                  </div>
                  <div className="mb-6">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valuation ($)</label>
                     <input 
                        type="number" 
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="0.00" 
                        value={newCollateral.value} 
                        onChange={e => setNewCollateral({...newCollateral, value: Number(e.target.value)})} 
                        required 
                     />
                  </div>
                  <div className="flex justify-end gap-2">
                     <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                     <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">Add Asset</button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};

const StatsCard: React.FC<{ label: string; value: string; icon: React.ReactNode; highlight?: boolean }> = ({ label, value, icon, highlight }) => (
  <div className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between h-28 ${highlight ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-900'}`}>
      <div className={`flex justify-between items-start ${highlight ? 'text-indigo-200' : 'text-slate-400'}`}>
          <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
          {icon}
      </div>
      <div className="text-2xl font-bold font-mono tracking-tight">{value}</div>
  </div>
);

const StatusBadge: React.FC<{ status: LoanStatus }> = ({ status }) => {
  const styles = {
    Sanctioned: 'bg-blue-100 text-blue-700',
    Disbursed: 'bg-indigo-100 text-indigo-700',
    Repaying: 'bg-emerald-100 text-emerald-700',
    Closed: 'bg-slate-200 text-slate-600',
    Default: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
};
