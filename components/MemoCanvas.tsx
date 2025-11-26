
import React, { useState, useMemo } from 'react';
import { MemoData, RiskFactor, FinancialModel, TermSheetData, NegativeCovenant } from '../types';
import { FileText, Table2, Download, PenLine, CheckSquare, AlertTriangle, Shield, TrendingUp, Activity, AlertOctagon, Briefcase } from 'lucide-react';
import { FinancialCharts, CapitalStructureChart } from './FinancialCharts';
import { FinancialModelSheet } from './FinancialModelSheet';

// --- Components for Institutional Layout ---

// Continuous Layout Wrapper - Replaces fixed A4 pages with a continuous dashboard/doc hybrid
const DocumentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="max-w-5xl mx-auto my-8 flex flex-col gap-0 bg-transparent print:w-full print:my-0">
    <div className="bg-white shadow-xl min-h-screen p-12 relative flex flex-col rounded-xl print:shadow-none print:p-8 print:rounded-none">
        {children}
    </div>
  </div>
);

const SectionHeading: React.FC<{ number: number; title: string }> = ({ number, title }) => (
  <div className="border-b-2 border-slate-900 pb-2 mb-8 mt-16 first:mt-0 break-after-avoid">
    <h2 className="text-xl font-serif font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3">
      <span className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center text-sm rounded-sm shadow-sm">{number}</span>
      {title}
    </h2>
  </div>
);

const VelocityIcon: React.FC<{ velocity: string }> = ({ velocity }) => {
  if (velocity === 'Fast') return <div className="flex items-center gap-1 text-red-600"><Activity className="w-3 h-3" /> Fast</div>;
  if (velocity === 'Medium') return <div className="flex items-center gap-1 text-amber-600"><TrendingUp className="w-3 h-3" /> Med</div>;
  return <div className="text-slate-400">Slow</div>;
};

const RiskTable: React.FC<{ risks: RiskFactor[] }> = ({ risks }) => (
  <div className="border border-slate-200 rounded-lg overflow-hidden mb-8 shadow-sm">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
        <tr>
          <th className="px-4 py-3 text-left w-24 border-b">Category</th>
          <th className="px-4 py-3 text-left border-b">Risk Factor & Mitigant</th>
          <th className="px-4 py-3 text-center w-24 border-b">Impact</th>
          <th className="px-4 py-3 text-center w-20 border-b">Prob.</th>
          <th className="px-4 py-3 text-center w-24 border-b">Velocity</th>
          <th className="px-4 py-3 text-center w-24 border-b">Residual</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {risks.map((r, i) => (
          <tr key={i} className="bg-white hover:bg-slate-50 transition-colors">
            <td className="px-4 py-4 font-bold text-slate-400 text-xs uppercase align-top">{r.category}</td>
            <td className="px-4 py-4 align-top">
                <div className="text-slate-900 font-semibold text-sm mb-1.5">{r.risk}</div>
                <div className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-bold text-slate-700">Mitigant:</span> {r.mitigant}
                </div>
            </td>
            <td className="px-4 py-4 text-center align-top">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                r.impact === 'Critical' ? 'bg-red-100 text-red-800' : 
                r.impact === 'High' ? 'bg-orange-100 text-orange-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {r.impact}
              </span>
            </td>
            <td className="px-4 py-4 text-center text-xs text-slate-500 align-top pt-5">{r.probability}</td>
            <td className="px-4 py-4 text-center text-xs font-medium align-top pt-5">
               <VelocityIcon velocity={r.velocity} />
            </td>
            <td className="px-4 py-4 text-center align-top pt-5">
               <span className={`text-xs font-bold ${
                 r.residualRisk === 'High' ? 'text-red-600' : 
                 r.residualRisk === 'Medium' ? 'text-amber-600' : 'text-green-600'
               }`}>{r.residualRisk || '-'}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TermSheetTable: React.FC<{ termSheet: TermSheetData }> = ({ termSheet }) => (
  <div className="mb-10">
    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
      <FileText className="w-4 h-4" /> Primary Terms Structure
    </h4>
    <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white text-sm shadow-sm overflow-hidden">
      <div className="grid grid-cols-12 p-4 bg-slate-50/50 hover:bg-slate-50">
        <div className="col-span-3 font-medium text-slate-500">Borrower</div>
        <div className="col-span-9 font-bold text-slate-900 text-base">{termSheet.borrower}</div>
      </div>
      <div className="grid grid-cols-12 p-4 hover:bg-slate-50">
        <div className="col-span-3 font-medium text-slate-500">Facility Type</div>
        <div className="col-span-9 text-slate-900">{termSheet.facilityType}</div>
      </div>
      <div className="grid grid-cols-12 p-4 bg-slate-50/50 hover:bg-slate-50">
        <div className="col-span-3 font-medium text-slate-500">Amount</div>
        <div className="col-span-9 font-mono font-bold text-slate-900 text-lg text-indigo-700">{termSheet.amount}</div>
      </div>
      <div className="grid grid-cols-12 p-4 hover:bg-slate-50">
        <div className="col-span-3 font-medium text-slate-500">Pricing</div>
        <div className="col-span-9 text-slate-900">
          <div className="flex items-center gap-4 mb-4">
              <div className="bg-indigo-50 px-3 py-1 rounded border border-indigo-100 text-indigo-800 font-medium">
                 Base: <span className="font-bold">{termSheet.baseRate}</span>
              </div>
              <div className="text-slate-300">+</div>
              <div className="bg-indigo-50 px-3 py-1 rounded border border-indigo-100 text-indigo-800 font-medium">
                 Spread: <span className="font-bold">{termSheet.spread}</span>
              </div>
          </div>
          {termSheet.pricingGrid && termSheet.pricingGrid.length > 0 && (
            <div className="text-xs border border-slate-200 rounded-md overflow-hidden w-full max-w-md shadow-sm">
              <div className="flex bg-slate-100 p-2 font-bold text-slate-500 border-b border-slate-200">
                 <div className="w-1/2 px-2">Leverage Range</div>
                 <div className="w-1/2 px-2">Applicable Margin</div>
              </div>
              {termSheet.pricingGrid.map((tier, i) => (
                <div key={i} className="flex p-2 border-b last:border-0 border-slate-50 bg-white items-center">
                  <div className="w-1/2 px-2 text-slate-700 font-medium">{tier.leverageRange}</div>
                  <div className="w-1/2 px-2 font-mono text-indigo-600 font-bold">{tier.spread}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-12 p-4 bg-slate-50/50 hover:bg-slate-50">
        <div className="col-span-3 font-medium text-slate-500">Fee Structure</div>
        <div className="col-span-9 text-slate-900 text-sm">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {termSheet.fees.map((f, i) => (
               <div key={i} className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-700">{f.type}</span>
                    <span className="font-mono font-bold text-indigo-600">{f.amount}</span>
                 </div>
                 <div className="text-xs text-slate-400 flex justify-between">
                    <span>{f.paymentTerms}</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
      <div className="grid grid-cols-12 p-4 hover:bg-slate-50">
          <div className="col-span-3 font-medium text-slate-500">Amortization</div>
          <div className="col-span-9 text-slate-900 text-xs">
             <div className="flex flex-wrap gap-2">
              {termSheet.amortization.map((a, i) => (
                  <div key={i} className="flex flex-col bg-slate-50 px-4 py-2 rounded border border-slate-200 items-center min-w-[100px]">
                      <span className="font-bold text-slate-700 mb-1">{a.period}</span>
                      <span className="text-xs text-slate-500 mb-1">{a.type}</span>
                      <span className="font-mono font-bold text-indigo-600">{a.percentage}%</span>
                  </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  </div>
);

const CovenantBox: React.FC<{ maintenance: any[], negative: (string | NegativeCovenant)[] }> = ({ maintenance, negative }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
    <div className="border border-indigo-100 bg-indigo-50/30 p-6 rounded-lg">
      <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 pb-2 border-b border-indigo-100 flex items-center gap-2">
        <Shield className="w-4 h-4 text-indigo-600" /> Maintenance Covenants
      </h4>
      <div className="space-y-6">
        {maintenance.map((c, i) => (
          <div key={i} className="text-sm group bg-white p-4 rounded-md border border-indigo-50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
               <span className="font-bold text-slate-800">{c.name}</span>
               <span className="font-mono font-bold text-xl text-indigo-700">{c.targetLevel}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mb-3 uppercase tracking-wide">
               <span>Frequency: {c.frequency}</span>
               <span>Testing: {c.testingPeriod || 'T12M'}</span>
            </div>
            {/* Visual bar for headroom */}
            <div className="relative pt-4">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Current Forecast</span>
                    <span>Covenant Level</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                   <div className="bg-emerald-500 h-full rounded-full w-[70%] shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                   <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 right-[10%] z-10"></div>
                </div>
                <div className="text-center mt-1 text-xs font-bold text-emerald-600">
                    {c.headroom} Headroom
                </div>
            </div>
          </div>
        ))}
        {maintenance.length === 0 && <div className="text-sm text-slate-400 italic text-center py-4">No maintenance covenants defined yet.</div>}
      </div>
    </div>

    <div className="border border-amber-100 bg-amber-50/30 p-6 rounded-lg">
      <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-4 pb-2 border-b border-amber-100 flex items-center gap-2">
        <AlertOctagon className="w-4 h-4 text-amber-600" /> Negative Covenants
      </h4>
      <ul className="space-y-4 text-sm text-slate-600">
        {negative.map((nc, i) => {
          const isObject = typeof nc !== 'string';
          return (
            <li key={i} className="flex items-start gap-3 bg-white p-3 rounded border border-amber-50/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
              <div className="flex-1">
                 {isObject ? (
                   <>
                     <div className="font-bold text-slate-900 mb-1 flex justify-between">
                        {(nc as NegativeCovenant).restriction}
                        <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-100 font-normal">Restriction</span>
                     </div>
                     <div className="text-slate-700 mb-2 text-xs leading-relaxed">{(nc as NegativeCovenant).details}</div>
                     <div className="bg-slate-50 p-2 rounded text-xs border border-slate-100">
                        <span className="font-bold text-slate-500">Permitted Baskets:</span> <span className="italic text-slate-600">{(nc as NegativeCovenant).exceptions}</span>
                     </div>
                   </>
                 ) : (
                   <span className="leading-relaxed">{nc as string}</span>
                 )}
              </div>
            </li>
          );
        })}
         {negative.length === 0 && <div className="text-sm text-slate-400 italic text-center py-4">Standard negative covenants apply.</div>}
      </ul>
    </div>
  </div>
);

const SignatureBlock: React.FC<{ approval: MemoData['icApproval'] }> = ({ approval }) => {
  if (!approval) return null;
  const members = [approval.chair, approval.cro, approval.cfo, approval.pm];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 mt-12 page-break-inside-avoid">
      {members.map((m, i) => (
        <div key={i} className="border-t-2 border-slate-200 pt-4">
          <div className="font-serif font-bold text-slate-900 text-lg">{m.name || "____________________"}</div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-6 font-semibold">{m.role}</div>
          <div className="flex justify-between text-xs text-slate-400 font-mono bg-slate-50 p-3 rounded">
            <span>Date: {m.date || "YYYY-MM-DD"}</span>
            <span>Sig: {m.signature ? "/s/ " + m.signature : "________________"}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Helper Logic ---

const extractChartData = (model: FinancialModel) => {
  const pnlSheet = model.sheets.find(s => s.id === 'pnl');
  const bsSheet = model.sheets.find(s => s.id === 'bs');
  if (!pnlSheet || !pnlSheet.columns) return [];

  const revenueRow = pnlSheet.rows.find(r => r.label.toLowerCase().includes('revenue'));
  const ebitdaRow = pnlSheet.rows.find(r => r.label.toLowerCase().includes('ebitda'));
  const debtRow = bsSheet?.rows.find(r => r.label.toLowerCase().includes('total debt'));

  return pnlSheet.columns.map(col => ({
    year: col.label,
    revenue: revenueRow ? Number(revenueRow.values[col.id] || 0) : 0,
    ebitda: ebitdaRow ? Number(ebitdaRow.values[col.id] || 0) : 0,
    netDebt: debtRow ? Number(debtRow.values[col.id] || 0) : 0
  }));
};

interface MemoCanvasProps {
  data: MemoData;
  onUpdate: (newData: MemoData) => void;
  onBookLoan?: () => void; // New prop for LMS
}

export const MemoCanvas: React.FC<MemoCanvasProps> = ({ data, onUpdate, onBookLoan }) => {
  const [activeTab, setActiveTab] = useState<'memo' | 'model'>('memo');
  const handleModelUpdate = (newModel: FinancialModel) => {
    onUpdate({ ...data, financialModel: newModel });
  };
  const chartData = useMemo(() => extractChartData(data.financialModel), [data.financialModel]);

  return (
    <div className="h-full flex flex-col bg-slate-100 font-sans">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center justify-between h-16 shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-lg border border-slate-200">
          <button 
            onClick={() => setActiveTab('memo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'memo' ? 'bg-white text-indigo-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-4 h-4" /> Memo
          </button>
          <button 
            onClick={() => setActiveTab('model')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'model' ? 'bg-white text-indigo-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Table2 className="w-4 h-4" /> Model
          </button>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Status</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${data.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>{data.status}</span>
           </div>
           
           {/* Book Loan Button - Only appears when ready (or simulating readiness) and onBookLoan is provided */}
           {onBookLoan && (
             <button 
               onClick={onBookLoan}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-md"
               title="Move to Loan Management System"
             >
               <Briefcase className="w-4 h-4" /> Book Loan
             </button>
           )}

           <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors shadow-md">
            <Download className="w-4 h-4" /> Export PDF
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className={`h-full overflow-y-auto bg-slate-100 transition-opacity duration-300 ${activeTab === 'memo' ? 'opacity-100 z-10' : 'opacity-0 z-0 absolute inset-0 pointer-events-none'}`}>
           <MemoDocumentView data={data} chartData={chartData} onUpdate={onUpdate} />
        </div>
        <div className={`h-full overflow-hidden transition-opacity duration-300 ${activeTab === 'model' ? 'opacity-100 z-10' : 'opacity-0 z-0 absolute inset-0 pointer-events-none'}`}>
           <FinancialModelSheet model={data.financialModel} onUpdate={handleModelUpdate} />
        </div>
      </div>
    </div>
  );
};

const MemoDocumentView: React.FC<{ data: MemoData; chartData: any[]; onUpdate: (d: MemoData) => void; }> = ({ data, chartData, onUpdate }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  
  const EditableBlock = ({ field, content, className = "prose prose-slate max-w-none text-slate-700" }: { field: keyof MemoData, content: string, className?: string }) => (
    <div className="relative group min-h-[4em] transition-all rounded-md hover:bg-slate-50/50 -ml-4 pl-4 pr-4 py-2 border border-transparent hover:border-slate-100">
       <button onClick={() => setEditingField(field as string)} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-full transition-all"><PenLine className="w-4 h-4" /></button>
       {editingField === field ? (
         <textarea 
            className="w-full min-h-[200px] p-4 border border-indigo-300 rounded-lg bg-white shadow-xl text-sm leading-relaxed focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all"
            value={content} 
            onChange={(e) => onUpdate({ ...data, [field]: e.target.value })} 
            onBlur={() => setEditingField(null)} 
            autoFocus
         />
       ) : (
         <div className={`whitespace-pre-wrap leading-relaxed ${className}`} onClick={() => setEditingField(field as string)}>
            {content || <div className="flex items-center gap-2 text-slate-400 italic bg-slate-50 px-4 py-8 rounded-lg border border-dashed border-slate-200 justify-center cursor-pointer hover:bg-slate-100 hover:text-indigo-500 transition-colors"><PenLine className="w-4 h-4"/> Click to generate analysis for {String(field)}...</div>}
         </div>
       )}
    </div>
  );

  return (
    <div className="pb-24 print:pb-0">
       <DocumentWrapper>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-slate-900 pb-8 mb-12 gap-6">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                Institutional Credit Memorandum
              </div>
              <h1 className="text-5xl font-serif font-bold text-slate-900 leading-tight mb-3">{data.title}</h1>
              <div className="text-sm text-slate-500 font-mono flex items-center gap-4">
                  <span>Date: {data.lastUpdated}</span>
                  <span className="text-slate-300">|</span>
                  <span>ID: #{Math.floor(Math.random() * 100000)}</span>
              </div>
            </div>
            <div className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-2 rounded-lg ${data.status === 'Approved' ? 'border-green-600 text-green-700 bg-green-50' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                {data.status}
            </div>
          </div>

          {/* 1. Executive Summary */}
          <SectionHeading number={1} title="Executive Summary & Recommendation" />
          
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 border-l-4 border-indigo-600 p-8 mb-10 shadow-sm rounded-r-lg">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recommendation</h3>
            <div className="text-2xl font-serif font-bold text-indigo-950 leading-relaxed">
              {data.recommendation}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
            <div className="lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-500" /> Investment Thesis
              </h3>
              <ul className="space-y-4 mb-8">
                {data.investmentThesis.map((pt, i) => (
                  <li key={i} className="flex items-start gap-4 text-base text-slate-700">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2.5 shrink-0"></div>
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-1 bg-slate-900 text-white p-6 rounded-xl shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
               <h3 className="text-xs font-bold text-indigo-300 uppercase mb-6 relative z-10">Projected Returns</h3>
               <div className="space-y-6 relative z-10">
                  <div>
                    <div className="text-xs text-slate-400 uppercase mb-1">Expected IRR</div>
                    <div className="text-4xl font-bold text-white">
                        {((data.scenarios.find(s => s.caseName === 'Base Case')?.irr || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase mb-1">Target MOIC</div>
                    <div className="text-3xl font-bold text-white">
                        {(data.scenarios.find(s => s.caseName === 'Base Case')?.moic || 0).toFixed(2)}x
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <EditableBlock field="executiveSummary" content={data.executiveSummary} className="text-lg leading-8 text-slate-700 font-serif" />

          {/* 2. Terms */}
          <SectionHeading number={2} title="Transaction Overview" />
          <TermSheetTable termSheet={data.termSheet} />

          {/* 3. Business */}
          <SectionHeading number={3} title="Business Overview" />
          <EditableBlock field="companyOverview" content={data.companyOverview} />

          {/* 4. Highlights */}
          <SectionHeading number={4} title="Investment Highlights" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {data.investmentHighlights.map((hl, i) => (
               <div key={i} className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm flex gap-4 hover:shadow-md transition-all hover:border-indigo-200">
                 <div className="bg-indigo-50 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm shadow-inner">{i+1}</div>
                 <p className="text-sm text-slate-700 leading-relaxed font-medium">{hl}</p>
               </div>
             ))}
          </div>

          {/* 5. Risks */}
          <SectionHeading number={5} title="Risk Assessment" />
          <RiskTable risks={data.risks} />

          {/* 6. Financials */}
          <SectionHeading number={6} title="Financial Analysis" />
          <div className="mb-12">
             <div className="flex items-center justify-between mb-6">
               <h4 className="text-base font-bold text-slate-700">Historical & Projected Performance</h4>
             </div>
             <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50 mb-8">
                <FinancialCharts data={chartData} />
             </div>
             <div className="mt-8">
               <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Commentary</h4>
               <EditableBlock field="financialAnalysis" content={data.financialAnalysis} />
             </div>
          </div>

          {/* 7. Structure & Covenants */}
          <SectionHeading number={7} title="Structure & Covenants" />
          <CovenantBox maintenance={data.termSheet.maintenanceCovenants} negative={data.termSheet.negativeCovenants} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
             <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase mb-4 pl-2 border-l-4 border-slate-900">Capital Structure Table</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-6 py-3 text-left">Instrument</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-right">Maturity</th>
                        <th className="px-6 py-3 text-right">Lev.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {data.capitalStructure.map((item, i) => (
                         <tr key={i} className="bg-white">
                           <td className="px-6 py-4 font-bold text-slate-800">{item.instrument}</td>
                           <td className="px-6 py-4 text-right font-mono text-slate-600 text-base">{item.amount}</td>
                           <td className="px-6 py-4 text-right text-xs text-slate-500">{item.maturity}</td>
                           <td className="px-6 py-4 text-right font-bold text-slate-900 bg-slate-50">{item.leverageMetric.toFixed(1)}x</td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
             </div>
             <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase mb-4 pl-2 border-l-4 border-indigo-500">Capital Stack Visualization</h4>
                <CapitalStructureChart items={data.capitalStructure} />
             </div>
          </div>

          {/* 8. Collateral */}
          <SectionHeading number={8} title="Collateral & Downside" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">Collateral Package</h4>
               <div className="border border-slate-200 rounded-lg overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3 text-left">Asset</th>
                      <th className="px-4 py-3 text-right">Book Value</th>
                      <th className="px-4 py-3 text-right">Adv. Rate</th>
                      <th className="px-4 py-3 text-right">Coverage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {data.termSheet.collateral.map((col, i) => (
                       <tr key={i} className="bg-white">
                         <td className="px-4 py-3 font-medium text-slate-800">{col.assetCategory}</td>
                         <td className="px-4 py-3 text-right font-mono text-slate-600">{col.bookValue}</td>
                         <td className="px-4 py-3 text-right text-xs text-slate-500">{col.advanceRate * 100}%</td>
                         <td className="px-4 py-3 text-right font-bold text-indigo-700">{col.loanCoverage.toFixed(2)}x</td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>

              <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">Downside Protection Analysis</h4>
              <EditableBlock field="downsideAnalysis" content={data.downsideAnalysis} />
            </div>
            <div className="lg:col-span-1 bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-6">Recovery Summary</h4>
               <div className="space-y-6">
                 <div className="flex justify-between items-end">
                   <span className="text-sm font-medium text-slate-600">Gross Recovery</span>
                   <span className="text-2xl font-bold text-slate-900">92%</span>
                 </div>
                 <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                   <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 w-[92%] h-full rounded-full"></div>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                   Based on orderly liquidation of inventory (50%) and 80% advance on receivables. Real estate value excluded from base recovery.
                 </p>
               </div>
            </div>
          </div>

          {/* 9. Compliance & Reporting */}
          <SectionHeading number={9} title="Compliance & Reporting" />
          
          {/* Conditions Precedent - New Table Implementation */}
          <div className="mb-10">
            <h4 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" /> Conditions Precedent
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left w-12 border-b"></th>
                    <th className="px-4 py-3 text-left border-b">Condition Item</th>
                    <th className="px-4 py-3 text-left w-32 border-b">Category</th>
                    <th className="px-4 py-3 text-right w-24 border-b">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.termSheet.conditionsPrecedent.map((cp, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-center">
                         <div className={`w-5 h-5 border rounded-md flex items-center justify-center transition-colors ${cp.status === 'Satisfied' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                            {cp.status === 'Satisfied' && <CheckSquare className="w-3.5 h-3.5" />}
                         </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 group-hover:text-indigo-900 transition-colors">
                        <span className={cp.status === 'Satisfied' ? 'text-slate-400 line-through decoration-slate-300' : ''}>{cp.item}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {cp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          cp.status === 'Satisfied' ? 'bg-emerald-100 text-emerald-800' : 
                          cp.status === 'Waived' ? 'bg-amber-100 text-amber-800' : 
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {cp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                   {data.termSheet.conditionsPrecedent.length === 0 && (
                     <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">No conditions precedent defined.</td></tr>
                   )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-12">
             <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">Reporting Requirements</h4>
             <div className="border border-slate-200 rounded-lg text-sm overflow-hidden">
               {data.termSheet.reportingRequirements.map((req, i) => (
                 <div key={i} className="flex justify-between items-center p-4 border-b last:border-0 border-slate-100 bg-white hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      <span className="text-slate-700 font-medium">{req.report}</span>
                    </div>
                    <span className="text-slate-500 text-xs bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-medium font-mono">{req.frequency} | {req.deadline}</span>
                 </div>
               ))}
                {data.termSheet.reportingRequirements.length === 0 && (
                    <div className="px-4 py-6 text-center text-slate-400 italic">No reporting requirements defined.</div>
                )}
             </div>
          </div>

          {/* Signatures */}
          <div className="mt-24 pt-12 border-t-4 border-double border-slate-200">
             <div className="text-center mb-12">
                 <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Investment Committee Approval</h3>
                 <p className="text-slate-400 text-sm mt-2">Electronic Signature Verification System</p>
             </div>
             <SignatureBlock approval={data.icApproval} />
          </div>

       </DocumentWrapper>
    </div>
  );
};
