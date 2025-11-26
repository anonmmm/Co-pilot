
import React, { useState, useMemo } from 'react';
import { FinancialModel, ModelSheet } from '../types';
import { ChevronDown, Plus, Download, LayoutGrid, AlertTriangle, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { validateCellInput, runModelHealthCheck, formatValue } from '../services/financialLogic';

interface FinancialModelSheetProps {
  model: FinancialModel;
  onUpdate: (newModel: FinancialModel) => void;
}

export const FinancialModelSheet: React.FC<FinancialModelSheetProps> = ({ model, onUpdate }) => {
  
  const activeSheet = model.sheets.find(s => s.id === model.activeSheetId) || model.sheets[0];
  const healthChecks = useMemo(() => runModelHealthCheck(model), [model]);

  const handleSheetChange = (sheetId: string) => {
    onUpdate({ ...model, activeSheetId: sheetId });
  };

  const handleValueChange = (rowId: string, colId: string, rawValue: string) => {
    // Basic clean up
    const cleanVal = rawValue.replace(/[$,%]/g, '');
    const numValue = parseFloat(cleanVal);
    
    const updatedSheets = model.sheets.map(sheet => {
      if (sheet.id !== activeSheet.id) return sheet;
      
      const newRows = sheet.rows.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            values: {
              ...row.values,
              // If it's a valid number, store number, else store string (user correcting input)
              [colId]: isNaN(numValue) && rawValue !== '' ? rawValue : (rawValue === '' ? 0 : numValue)
            }
          };
        }
        return row;
      });
      return { ...sheet, rows: newRows };
    });

    onUpdate({ ...model, sheets: updatedSheets });
  };

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden select-none font-sans">
      {/* Toolbar */}
      <div className="flex flex-col border-b border-slate-300 bg-slate-50 shadow-sm z-20">
        <div className="h-12 flex items-center px-4 border-b border-slate-200 gap-4 text-xs text-slate-600">
           <div className="flex items-center gap-2 cursor-pointer hover:bg-white hover:shadow-sm px-3 py-1.5 rounded-md border border-transparent hover:border-slate-200 transition-all font-medium text-slate-700">
              <Download className="w-3.5 h-3.5 text-indigo-600" /> 
              Export Excel
           </div>
           <div className="h-6 w-px bg-slate-300 mx-2"></div>
           
           {/* Health Check Dashboard */}
           <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
              {healthChecks.map(check => (
                  <div key={check.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide transition-colors shadow-sm whitespace-nowrap ${
                      check.passed 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                  }`} title={check.details}>
                      {check.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {check.label}: {check.passed ? 'OK' : 'FAIL'}
                  </div>
              ))}
           </div>
           
           <div className="flex-1"></div>
           <div className="text-slate-400 text-[10px] font-medium flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
             <ShieldCheck className="w-3 h-3" /> 
             Auto-Validation Active
           </div>
        </div>
        
        {/* Formula Bar */}
        <div className="h-9 flex items-center px-2 bg-white gap-2">
          <div className="w-8 flex justify-center text-slate-400 font-serif italic font-bold">fx</div>
          <div className="h-5 w-[1px] bg-slate-200"></div>
          <div className="flex-1 bg-slate-50 border border-slate-200 h-7 rounded-md px-3 text-xs flex items-center text-slate-600 font-mono shadow-inner">
             {activeSheet.name}!Selection
          </div>
        </div>
      </div>

      {/* The Spreadsheet Grid */}
      <div className="flex-1 overflow-auto relative bg-slate-100/50">
        <div className="absolute inset-0 m-4 mt-0 rounded-tl-none overflow-hidden flex flex-col bg-white border border-slate-300 shadow-lg rounded-lg">
            <SheetGrid sheet={activeSheet} onValueChange={handleValueChange} />
        </div>
      </div>

      {/* Bottom Tabs Bar */}
      <div className="h-10 bg-slate-100 border-t border-slate-300 flex items-center px-2 gap-1 overflow-x-auto scrollbar-hide">
         <div className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded cursor-pointer text-slate-500 transition-colors">
            <Plus className="w-4 h-4" />
         </div>
         <div className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded cursor-pointer mr-2 text-slate-500 transition-colors">
            <LayoutGrid className="w-4 h-4" />
         </div>
         
         {model.sheets.map(sheet => (
           <button
             key={sheet.id}
             onClick={() => handleSheetChange(sheet.id)}
             className={`
               h-8 px-4 flex items-center gap-2 text-xs font-bold rounded-t-lg border-t border-l border-r transition-all min-w-max
               ${sheet.id === model.activeSheetId 
                 ? 'bg-white border-slate-300 text-indigo-600 shadow-[0_-2px_3px_rgba(0,0,0,0.05)] translate-y-[1px] z-10' 
                 : 'bg-slate-200 border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'
               }
             `}
             style={{ borderTopColor: sheet.id === model.activeSheetId ? sheet.color : 'transparent' }}
           >
             {sheet.name}
             {sheet.id === model.activeSheetId && <ChevronDown className="w-3 h-3 opacity-50" />}
           </button>
         ))}
      </div>
    </div>
  );
};

const SheetGrid: React.FC<{ sheet: ModelSheet; onValueChange: (r: string, c: string, v: string) => void }> = ({ sheet, onValueChange }) => {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm">
          <tr>
            <th className="w-10 border-r border-b border-slate-300 bg-slate-100 sticky left-0 z-30"></th>
            <th className="border-r border-b border-slate-300 bg-slate-50 px-4 py-2.5 text-left font-bold text-slate-700 w-[240px] min-w-[240px] sticky left-10 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
              Line Item
            </th>
            {sheet.columns.map((col, idx) => (
              <th 
                key={col.id} 
                className={`border-r border-b border-slate-300 px-2 py-1.5 font-semibold text-center min-w-[110px] ${
                  col.type === 'input' ? 'bg-amber-50/50 text-amber-900' : 
                  col.type === 'output' ? 'bg-indigo-50/50 text-indigo-900' : 
                  col.type === 'historical' ? 'bg-slate-100 text-slate-500' : 'text-slate-700'}`}
                style={{ width: col.width }}
              >
                <div className="flex flex-col">
                   <span className="text-[9px] text-slate-400 font-normal mb-0.5">{String.fromCharCode(65 + idx)}</span>
                   <span>{col.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
           {sheet.rows.map((row, idx) => (
             <tr key={row.id} className="hover:bg-blue-50/30 group transition-colors">
               {/* Row Index */}
               <td className="border-r border-b border-slate-200 bg-slate-50 text-center text-slate-400 select-none font-mono text-[10px] sticky left-0 z-10 group-hover:bg-blue-50/50">
                 {idx + 1}
               </td>
               
               {/* Label */}
               <td className={`border-r border-b border-slate-200 px-4 py-1 flex items-center overflow-hidden whitespace-nowrap sticky left-10 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] ${
                 row.isHeader 
                  ? 'bg-slate-100 font-bold text-slate-800 uppercase tracking-wider h-8' 
                  : 'bg-white h-8 group-hover:bg-blue-50/30'
               }`}>
                 <span style={{ paddingLeft: `${(row.indent || 0) * 1.5}em` }} className={`truncate ${row.isCalculated ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                    {row.label}
                 </span>
               </td>

               {/* Values */}
               {sheet.columns.map(col => (
                 <td key={`${row.id}-${col.id}`} className={`border-r border-b border-slate-200 p-0 relative transition-colors ${
                   row.isHeader ? 'bg-slate-100' : ''
                 }`}>
                   {!row.isHeader && (
                     <ValidatedInput 
                        value={row.values[col.id]} 
                        format={row.format} 
                        isCalculated={row.isCalculated}
                        colType={col.type}
                        onChange={(val) => onValueChange(row.id, col.id, val)}
                     />
                   )}
                 </td>
               ))}
             </tr>
           ))}
        </tbody>
      </table>
    </div>
  );
};

interface ValidatedInputProps {
  value: string | number;
  format: 'currency' | 'percentage' | 'number' | 'text';
  isCalculated?: boolean;
  colType: string;
  onChange: (val: string) => void;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({ value, format, isCalculated, colType, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(String(value ?? ''));
  
  const validation = useMemo(() => 
    validateCellInput(localValue, format), 
  [localValue, format]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
    if (e.key === 'Escape') {
      setLocalValue(String(value ?? ''));
      setIsEditing(false);
    }
  };

  // Only input columns are editable, unless it's a manual override scenario
  const canEdit = colType === 'input' && !isCalculated;

  if (isEditing) {
    return (
      <div className="relative w-full h-full group">
        <input
          className={`w-full h-full px-2 py-1 text-right outline-none text-xs font-mono transition-all z-20 relative ${
            !validation.isValid ? 'bg-red-50 text-red-700 ring-2 ring-inset ring-red-500' : 
            validation.severity === 'warning' ? 'bg-amber-50 ring-2 ring-inset ring-amber-400' :
            'bg-white ring-2 ring-inset ring-indigo-500'
          }`}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {(!validation.isValid || validation.severity === 'warning') && (
           <div className={`absolute bottom-full right-0 mb-2 px-3 py-1.5 text-[10px] rounded-md shadow-xl whitespace-nowrap z-50 font-bold border animate-in fade-in slide-in-from-bottom-1 ${
             validation.severity === 'error' 
              ? 'bg-red-600 text-white border-red-700' 
              : 'bg-amber-100 text-amber-800 border-amber-200'
           }`}>
             <div className="absolute -bottom-1 right-3 w-2 h-2 rotate-45 border-b border-r bg-inherit"></div>
             {validation.severity === 'error' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
             {validation.message}
           </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`w-full h-full px-2 py-1 text-right text-xs flex items-center justify-end transition-colors ${
         isCalculated ? 'font-bold text-slate-900 bg-slate-50/50' : 
         canEdit ? 'text-indigo-600 cursor-text hover:bg-indigo-50 hover:ring-1 hover:ring-inset hover:ring-indigo-200' : 'text-slate-600'
      }`}
      onClick={() => canEdit && setIsEditing(true)}
    >
      {formatValue(value, format)}
    </div>
  );
};
