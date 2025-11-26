
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CapitalStructureItem } from '../types';

interface ChartMetric {
  year: string;
  revenue: number;
  ebitda: number;
  netDebt: number;
}

interface FinancialChartsProps {
  data: ChartMetric[];
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Check if data is essentially empty/zeroed out
  const hasData = data.some(d => d.revenue > 0 || d.ebitda > 0);
  
  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <div className="text-center">
            <p className="text-slate-500 font-medium mb-1">No Financial Data Visualized</p>
            <p className="text-slate-400 text-xs">Go to the 'Model' tab to populate financial data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full mt-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
         <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historical Performance (USD M)</h4>
         <span className="text-[10px] text-indigo-400 bg-indigo-50 px-2 py-1 rounded">Linked to Model</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="year" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 12}}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 12}}
          />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
          />
          <Legend wrapperStyle={{paddingTop: '20px'}} />
          <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
          <Bar dataKey="ebitda" name="EBITDA" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
          <Bar dataKey="netDebt" name="Net Debt" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CapitalStructureChartProps {
  items: CapitalStructureItem[];
}

export const CapitalStructureChart: React.FC<CapitalStructureChartProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  // Sort by seniority descending so highest seniority (lowest number) is on top of stack
  // Recharts renders stack from bottom up. So bottom bar comes first in array of bars.
  // We want Equity at bottom (Low Seniority / High Number) -> First Bar
  // We want Senior Debt at top (High Seniority / Low Number) -> Last Bar
  const sortedItems = [...items].sort((a, b) => (b.seniority || 10) - (a.seniority || 10));

  // Transform for Recharts: Single object with keys for each instrument
  const dataObj: Record<string, any> = { name: 'Pro Forma Cap' };
  sortedItems.forEach(item => {
    dataObj[item.instrument] = item.amount;
  });
  const chartData = [dataObj];

  // Distinct colors
  const colors = ['#94a3b8', '#64748b', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9'];

  return (
    <div className="h-80 w-full mt-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
       <div className="flex justify-between items-center mb-4">
         <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Capital Structure Stack</h4>
         <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">Pro Forma</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barSize={60}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} label={{ value: '$ Million', angle: -90, position: 'insideLeft', style: {fill: '#94a3b8'} }} />
          <Tooltip 
             cursor={{fill: 'transparent'}}
             contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
             formatter={(value: number) => [`$${value}m`, '']}
          />
          <Legend wrapperStyle={{paddingTop: '20px'}} />
          {sortedItems.map((item, index) => (
            <Bar 
              key={item.instrument} 
              dataKey={item.instrument} 
              stackId="a" 
              fill={colors[index % colors.length]} 
              radius={[index === sortedItems.length - 1 ? 4 : 0, index === sortedItems.length - 1 ? 4 : 0, index === 0 ? 4 : 0, index === 0 ? 4 : 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
