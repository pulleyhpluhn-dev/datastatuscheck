import React from 'react';
import { AnalysisSummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface Props {
  summary: AnalysisSummary;
}

const BadDataPanel: React.FC<Props> = ({ summary }) => {
  // Process Missing Block Data
  const missingData = (Object.entries(summary.missingBlockCounts) as [string, number][])
    .map(([id, count]) => ({ id: `Block #${id}`, count, rawId: parseInt(id) }))
    .sort((a, b) => a.rawId - b.rawId);

  // Process Completeness Histogram
  const completenessData = (Object.entries(summary.completenessDistribution) as [string, number][])
    .map(([blocks, count]) => ({ blocks: `${blocks} Blocks`, count, rawBlocks: parseInt(blocks) }))
    .sort((a, b) => a.rawBlocks - b.rawBlocks);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full pb-6">
      
      {/* Missing ID Heatmap/Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">丢包特征分析 (Missing Blocks)</h3>
            <p className="text-sm text-slate-500">各 Block ID 的丢失频率。高柱状图表示系统性的丢包点。</p>
          </div>
          <div className="bg-red-50 p-2 rounded-lg text-red-600">
            <AlertTriangle size={20} />
          </div>
        </div>
        
        <div className="flex-1 min-h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={missingData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="id" tick={{fontSize: 12}} stroke="#64748b" />
              <YAxis stroke="#64748b" tick={{fontSize: 12}} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="count" name="丢失次数 (Count)" radius={[4, 4, 0, 0]}>
                {missingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.rawId === 0 || entry.rawId === 9 ? '#ef4444' : '#f87171'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-slate-400 bg-slate-50 p-3 rounded-md border border-slate-100">
          <span className="font-semibold text-red-500">分析洞察 (Insight):</span> 深色柱体 (Block #0, #9) 高亮显示，因为它们通常对应帧头或校验和，对数据包有效性至关重要。
        </div>
      </div>

      {/* Completeness Histogram */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">数据完整性分布 (Integrity)</h3>
        <p className="text-sm text-slate-500 mb-6">每个文件成功接收的数据块数量分布。</p>
        
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completenessData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" tick={{fontSize: 12}} />
              <YAxis dataKey="blocks" type="category" stroke="#64748b" tick={{fontSize: 12}} width={80} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b' }}
              />
              <Bar dataKey="count" name="文件数量 (Files)" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Top Missing Stats */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">最常丢失的 3 个 Block ID (Top 3 Missing)</h4>
          <div className="space-y-2">
            {[...missingData].sort((a,b) => b.count - a.count).slice(0,3).map((item, idx) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                  <span className="text-slate-600">{item.id}</span>
                </div>
                <span className="font-mono text-red-600 font-medium">{item.count} 次丢失</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadDataPanel;