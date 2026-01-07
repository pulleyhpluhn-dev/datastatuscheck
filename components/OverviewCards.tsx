import React from 'react';
import { CheckCircle, XCircle, FileText, PieChart } from 'lucide-react';
import { AnalysisSummary } from '../types';

interface Props {
  summary: AnalysisSummary;
}

const OverviewCards: React.FC<Props> = ({ summary }) => {
  if (!summary) return null;

  const total = summary.totalFiles;
  const goodPct = total > 0 ? ((summary.goodDataCount / total) * 100).toFixed(1) : '0.0';
  const badPct = total > 0 ? ((summary.badDataCount / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <FileText size={64} className="text-slate-800" />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">文件总数 (Total Files)</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{total.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-2">已扫描项目 (Scanned Items)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <CheckCircle size={64} className="text-emerald-600" />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">有效数据 (Good Data)</p>
          <h3 className="text-3xl font-bold text-emerald-600 mt-1">{goodPct}%</h3>
          <p className="text-xs text-slate-500 mt-2">{summary.goodDataCount.toLocaleString()} 个文件</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <XCircle size={64} className="text-red-600" />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider">异常数据 (Bad Data)</p>
          <h3 className="text-3xl font-bold text-red-600 mt-1">{badPct}%</h3>
          <p className="text-xs text-slate-500 mt-2">{summary.badDataCount.toLocaleString()} 个文件</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-md border border-indigo-700 p-5 text-white relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-20">
          <PieChart size={80} />
        </div>
        <div className="relative z-10">
           <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">系统状态 (System Status)</p>
           <div className="mt-2 space-y-1">
             <div className="flex justify-between text-sm">
               <span>耗时 (Time)</span>
               <span className="font-mono opacity-80">{summary.processingTimeMs.toFixed(0)}ms</span>
             </div>
             <div className="flex justify-between text-sm">
               <span>吞吐量 (Rate)</span>
               <span className="font-mono opacity-80">~{(total / (summary.processingTimeMs/1000 || 1)).toFixed(0)} f/s</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;