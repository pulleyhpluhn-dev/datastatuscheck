import React, { useRef } from 'react';
import { Upload, FolderOpen, RefreshCw, Download, Filter, FileInput } from 'lucide-react';
import { generateMockFiles } from '../services/analysisService';

interface SidebarProps {
  onAnalyze: (files: FileList | File[]) => void;
  isAnalyzing: boolean;
  progress: number;
  totalFiles: number;
  rootPath: string;
  onPathChange: (path: string) => void;
  filter24h: boolean;
  onToggleFilter: (checked: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onAnalyze, 
  isAnalyzing, 
  progress, 
  totalFiles, 
  rootPath,
  onPathChange,
  filter24h,
  onToggleFilter
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAnalyze(e.target.files);
    }
  };

  const handleMockData = () => {
    const mockFiles = generateMockFiles(2000);
    onAnalyze(mockFiles);
  };

  return (
    <div className="w-80 bg-slate-50 border-r border-slate-200 h-full flex flex-col shadow-lg z-20">
      <div className="p-6 border-b border-slate-200 bg-white">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-1.5 rounded-lg shadow-sm">
            <Upload size={18} />
          </span>
          数据洞察 (Data Insight)
        </h1>
        <p className="text-xs text-slate-500 mt-1 pl-9">IoT 数据完整性与状态分析助手</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-8">
        {/* Configuration Section */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileInput size={12} />
            数据源 (Data Source)
          </h2>
          
          <div className="space-y-4">
            <div className="group">
              <label className="block text-xs font-semibold text-slate-600 mb-2">存储路径</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={rootPath}
                  onChange={(e) => onPathChange(e.target.value)}
                  placeholder="/path/to/data"
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
                />
              </div>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <FolderOpen size={18} />
              {isAnalyzing ? '扫描中 (Scanning)...' : '开始分析 (Start Analysis)'}
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              // @ts-ignore
              webkitdirectory="" 
              directory="" 
              multiple 
              onChange={handleFolderSelect}
            />

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 px-2 text-xs text-slate-400">DEV TOOLS</span>
              </div>
            </div>

            <button 
              onClick={handleMockData}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} />
              加载演示数据 (Load Demo)
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
             <Filter size={12} />
             筛选 (Filters)
          </h2>
          <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-indigo-300 transition-colors">
            <input 
              type="checkbox" 
              checked={filter24h}
              onChange={(e) => onToggleFilter(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700 font-medium">仅显示最近 24 小时</span>
          </label>
        </div>

        {/* Status Section */}
        {(isAnalyzing || totalFiles > 0) && (
          <div className="animate-fade-in pt-4 border-t border-slate-200">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">状态 (Status)</h2>
            
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">处理进度</span>
                <span className="text-xs font-mono text-indigo-600">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">
                {isAnalyzing ? '正在解析文件...' : `已分析 ${totalFiles.toLocaleString()} 个文件。`}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-100 border-t border-slate-200 text-center">
         <span className="text-[10px] text-slate-400 font-mono">v1.1.0-ubuntu-docker (CN)</span>
      </div>
    </div>
  );
};

export default Sidebar;