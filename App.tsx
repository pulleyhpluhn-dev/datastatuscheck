import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import OverviewCards from './components/OverviewCards';
import GoodDataPanel from './components/GoodDataPanel';
import BadDataPanel from './components/BadDataPanel';
import DataTable from './components/DataTable';
import { processFiles, calculateSummary } from './services/analysisService';
import { AppState } from './types';
import { LayoutDashboard, AlertOctagon, Monitor } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isAnalyzing: false,
    progress: 0,
    summary: null,
    files: [],
    rootPath: '/opt/huajun/device_hub/data/archived', // Default path
    filter24h: false,
  });

  const [activeTab, setActiveTab] = useState<'good' | 'bad'>('good');

  // Derive filtered data
  const { filteredFiles, displaySummary } = useMemo(() => {
    let result = state.files;
    
    if (state.filter24h) {
      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      result = result.filter(f => f.timestamp >= cutoff);
    }
    
    // Recalculate summary if filtered
    const summary = calculateSummary(result);
    // Add back processing time from original summary if available
    summary.processingTimeMs = state.summary?.processingTimeMs || 0;

    return { filteredFiles: result, displaySummary: summary };
  }, [state.files, state.filter24h, state.summary]);

  const handlePathChange = (newPath: string) => {
    setState(prev => ({ ...prev, rootPath: newPath }));
  };

  const handleAnalyze = async (files: FileList | File[]) => {
    // Determine if we should update the root path based on the source
    let newRootPath = state.rootPath;
    
    // If it's a real file list from browser picker, update the path to match selection
    if (files instanceof FileList && files.length > 0 && 'webkitRelativePath' in files[0]) {
       const relativePath = files[0].webkitRelativePath;
       if (relativePath) {
         newRootPath = relativePath.split('/')[0];
       }
    } 
    // If it's mock data (Array), we keep the current text in the input box as the "simulated" source

    setState(prev => ({ ...prev, isAnalyzing: true, progress: 0, rootPath: newRootPath }));

    const fileListLike = Array.isArray(files) ? files : files;

    try {
      const { files: processedFiles } = await processFiles(fileListLike as any, (progress) => {
        setState(prev => ({ ...prev, progress }));
      });
      
      const initialSummary = calculateSummary(processedFiles);

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        files: processedFiles,
        summary: initialSummary
      }));
    } catch (error) {
      console.error("Analysis failed", error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
      alert("处理文件时出错 (Error processing files).");
    }
  };

  const handleToggleFilter = (checked: boolean) => {
    setState(prev => ({ ...prev, filter24h: checked }));
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans">
      <Sidebar 
        onAnalyze={handleAnalyze} 
        isAnalyzing={state.isAnalyzing}
        progress={state.progress}
        totalFiles={state.files.length}
        rootPath={state.rootPath}
        onPathChange={handlePathChange}
        filter24h={state.filter24h}
        onToggleFilter={handleToggleFilter}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Streamlit-like minimal header */}
        <div className="bg-white border-b border-slate-200 py-3 px-8 shadow-sm flex justify-between items-center z-10">
          <div className="flex items-center gap-2 text-slate-500">
             <Monitor size={16} />
             <span className="text-sm font-medium">远程仪表盘 (Remote Dashboard)</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-sm text-slate-600 font-medium">系统在线 (System Online)</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {state.files.length > 0 ? (
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
              
              <OverviewCards summary={displaySummary} />

              {/* Main Analysis Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setActiveTab('good')}
                    className={`flex-1 flex justify-center items-center gap-2 py-4 text-sm font-semibold transition-all ${
                      activeTab === 'good' 
                        ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <LayoutDashboard size={18} />
                    有效业务数据分析 (Good Data Analytics)
                  </button>
                  <div className="w-[1px] bg-slate-200"></div>
                  <button
                    onClick={() => setActiveTab('bad')}
                    className={`flex-1 flex justify-center items-center gap-2 py-4 text-sm font-semibold transition-all ${
                      activeTab === 'bad' 
                        ? 'bg-white text-red-600 border-b-2 border-red-600' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <AlertOctagon size={18} />
                    异常数据诊断分析 (Bad Data Diagnostics)
                  </button>
                </div>

                <div className="p-6 bg-slate-50/50 min-h-[400px]">
                  {activeTab === 'good' ? (
                    <GoodDataPanel summary={displaySummary} />
                  ) : (
                    <BadDataPanel summary={displaySummary} />
                  )}
                </div>
              </div>

              {/* Data Table */}
              <DataTable files={filteredFiles} />

            </div>
          ) : (
            // Empty State
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-24 h-24 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <LayoutDashboard size={40} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">准备分析 (Ready to Analyze)</h3>
              <p className="max-w-md text-center text-slate-500 text-sm leading-relaxed">
                请使用左侧边栏选择数据源。<br/> 
                (Compatible with Ubuntu 20.04 & Docker mounted volumes)
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;