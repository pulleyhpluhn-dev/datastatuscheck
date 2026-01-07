import React, { useState, useMemo } from 'react';
import { FileRecord, DataType, BusinessStatus } from '../types';
import { Download, Search, ChevronUp, ChevronDown, FileText, AlertCircle, Activity, LayoutList } from 'lucide-react';
import { generateCSV } from '../services/analysisService';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';

interface Props {
  files: FileRecord[];
}

type SortField = 'fileName' | 'type' | 'status' | 'timestamp' | 'integrity';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'list' | 'chart';

const DataTable: React.FC<Props> = ({ files }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [limit, setLimit] = useState(100);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    let result = files;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(f => 
        f.fileName.toLowerCase().includes(lower) || 
        f.path.toLowerCase().includes(lower)
      );
    }

    result = [...result].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortField) {
        case 'fileName': valA = a.fileName; valB = b.fileName; break;
        case 'type': valA = a.type; valB = b.type; break;
        case 'status': valA = a.status || ''; valB = b.status || ''; break;
        case 'timestamp': valA = a.timestamp; valB = b.timestamp; break;
        case 'integrity': 
           valA = a.receivedBlocks || 0; 
           valB = b.receivedBlocks || 0; 
           break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [files, searchTerm, sortField, sortDirection]);

  // Prepare Chart Data
  const chartData = useMemo(() => {
    return filteredAndSortedFiles.map((f, i) => {
      let yVal = 0;
      let label = '异常数据';
      let color = '#ef4444'; // Red 500

      if (f.type === DataType.GOOD) {
        if (f.status === BusinessStatus.NORMAL) { yVal = 1; label = '正常'; color = '#10b981'; } // Emerald
        else if (f.status === BusinessStatus.LEVEL_1) { yVal = 2; label = '一级报警'; color = '#f59e0b'; } // Amber
        else if (f.status === BusinessStatus.LEVEL_2) { yVal = 3; label = '二级报警'; color = '#f97316'; } // Orange
        else if (f.status === BusinessStatus.LEVEL_3) { yVal = 4; label = '三级报警'; color = '#7c3aed'; } // Violet (Distinct from Bad Data)
      }

      return {
        x: f.timestamp,
        y: yVal,
        label,
        color,
        fileName: f.fileName,
        idx: i
      };
    });
  }, [filteredAndSortedFiles]);

  const displayedFiles = filteredAndSortedFiles.slice(0, limit);

  const handleDownload = () => {
    const csvContent = generateCSV(filteredAndSortedFiles);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `analysis_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return <div className="w-4 h-4 opacity-0" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  if (files.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col mt-6 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">详细数据日志 (Detailed Data Logs)</h3>
          <p className="text-sm text-slate-500">
            共找到 {filteredAndSortedFiles.length} 条记录
          </p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto items-center">
          {/* View Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="列表视图 (List)"
            >
              <LayoutList size={18} />
            </button>
            <button 
              onClick={() => setViewMode('chart')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'chart' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="时间轴视图 (Timeline)"
            >
              <Activity size={18} />
            </button>
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="搜索文件名..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            导出 CSV
          </button>
        </div>
      </div>

      {viewMode === 'chart' && (
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-4">事件时间轴 (状态与异常)</h4>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="x" 
                  domain={['auto', 'auto']} 
                  name="时间" 
                  tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })} 
                  type="number"
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="状态" 
                  domain={[-0.5, 4.5]} 
                  ticks={[0, 1, 2, 3, 4]}
                  tickFormatter={(val) => {
                    if (val === 0) return '异常';
                    if (val === 1) return '正常';
                    if (val === 2) return '一级';
                    if (val === 3) return '二级';
                    if (val === 4) return '三级';
                    return '';
                  }}
                  stroke="#94a3b8"
                  fontSize={12}
                  width={80}
                />
                <ZAxis type="number" range={[50, 50]} />
                <RechartsTooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg text-xs">
                          <p className="font-semibold text-slate-800 mb-1">{data.label}</p>
                          <p className="text-slate-600 mb-1">文件: <span className="font-mono">{data.fileName}</span></p>
                          <p className="text-slate-400">{new Date(data.x).toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={chartData} line={false} shape="circle">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs text-slate-500">
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>正常 (Normal)</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div>一级报警</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div>二级报警</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-600"></div>三级报警</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>异常/丢包 (Integrity Failure)</div>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="overflow-x-auto animate-fade-in">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('fileName')}>
                  <div className="flex items-center gap-1">文件名 (File) <SortIcon field="fileName" /></div>
                </th>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-1">类型 (Type) <SortIcon field="type" /></div>
                </th>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('timestamp')}>
                  <div className="flex items-center gap-1">时间戳 (Time) <SortIcon field="timestamp" /></div>
                </th>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">业务状态 (Status) <SortIcon field="status" /></div>
                </th>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('integrity')}>
                  <div className="flex items-center gap-1">完整性 (Integrity) <SortIcon field="integrity" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedFiles.map((file, idx) => (
                <tr key={`${file.fileName}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-slate-600 truncate max-w-[200px]" title={file.fileName}>
                    {file.fileName}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      file.type === DataType.GOOD ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {file.type === DataType.GOOD ? '有效' : '异常'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {new Date(file.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    {file.type === DataType.GOOD ? (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                         file.status === BusinessStatus.NORMAL ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                         file.status === BusinessStatus.LEVEL_1 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                         file.status === BusinessStatus.LEVEL_2 ? 'bg-orange-50 text-orange-700 border-orange-100' :
                         file.status === BusinessStatus.LEVEL_3 ? 'bg-violet-50 text-violet-700 border-violet-100' : 
                         'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                           file.status === BusinessStatus.NORMAL ? 'bg-emerald-500' :
                           file.status === BusinessStatus.LEVEL_1 ? 'bg-amber-500' :
                           file.status === BusinessStatus.LEVEL_2 ? 'bg-orange-500' :
                           file.status === BusinessStatus.LEVEL_3 ? 'bg-violet-500' : 
                           'bg-slate-400'
                        }`}></span>
                        {file.status}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {file.type === DataType.BAD ? (
                      <div className="flex items-center text-red-600 gap-1.5 font-medium text-xs">
                        <AlertCircle size={14} />
                        <span>丢失 {file.missingBlockIds?.length} 个块</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-emerald-600 gap-1.5 font-medium text-xs">
                        <FileText size={14} />
                        <span>完整</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {filteredAndSortedFiles.length > limit && viewMode === 'list' && (
        <div className="p-3 border-t border-slate-100 text-center">
          <button 
            onClick={() => setLimit(prev => prev + 100)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            加载更多... (Show more)
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;