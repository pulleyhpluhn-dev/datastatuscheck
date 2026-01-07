import React from 'react';
import { AnalysisSummary, BusinessStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  summary: AnalysisSummary;
}

const COLORS = {
  [BusinessStatus.NORMAL]: '#10b981', // Emerald 500
  [BusinessStatus.LEVEL_1]: '#f59e0b', // Amber 500
  [BusinessStatus.LEVEL_2]: '#f97316', // Orange 500
  [BusinessStatus.LEVEL_3]: '#ef4444', // Red 500
  [BusinessStatus.UNKNOWN]: '#94a3b8', // Slate 400
};

const GoodDataPanel: React.FC<Props> = ({ summary }) => {
  const data = (Object.entries(summary.statusDistribution) as [string, number][])
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">业务状态分布 (Business Status)</h3>
        <p className="text-sm text-slate-500 mb-6">有效数据文件中的正常 (Normal) 与报警 (Alarm) 状态分布统计。</p>
        
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as BusinessStatus]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                 itemStyle={{ color: '#1e293b' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* List / Detailed Breakdown Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">状态详情 (Status Breakdown)</h3>
        <p className="text-sm text-slate-500 mb-6">各类状态的具体数量与占比。</p>

        <div className="overflow-auto flex-1">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 font-medium text-slate-500">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">状态类型 (Type)</th>
                <th className="px-4 py-3">数量 (Count)</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">占比 (Pct)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => {
                 const pct = ((item.value / summary.goodDataCount) * 100).toFixed(2);
                 const color = COLORS[item.name as BusinessStatus];
                 return (
                  <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.value.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">{pct}%</td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
          
          {data.length === 0 && (
            <div className="text-center py-10 text-slate-400 italic">
              暂无有效数据 (No Good Data)。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoodDataPanel;