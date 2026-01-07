export enum DataType {
  GOOD = 'GoodData',
  BAD = 'BadData',
  UNKNOWN = 'Unknown'
}

export enum BusinessStatus {
  NORMAL = '正常 (Normal)',
  LEVEL_1 = '一级报警 (Level 1)',
  LEVEL_2 = '二级报警 (Level 2)',
  LEVEL_3 = '三级报警 (Level 3)',
  UNKNOWN = '未知 (Unknown)'
}

export interface FileRecord {
  fileName: string;
  path: string;
  type: DataType;
  timestamp: number;
  status?: BusinessStatus; // For Good Data
  totalBlocks?: number; // For Bad Data
  receivedBlocks?: number; // For Bad Data
  missingBlockIds?: number[]; // For Bad Data (0-9)
}

export interface AnalysisSummary {
  totalFiles: number;
  goodDataCount: number;
  badDataCount: number;
  processingTimeMs: number;
  
  // Good Data Stats
  statusDistribution: Record<BusinessStatus, number>;

  // Bad Data Stats
  missingBlockCounts: Record<number, number>; // ID -> Count of times missing
  completenessDistribution: Record<number, number>; // Received Count -> File Count
}

export interface AppState {
  isAnalyzing: boolean;
  progress: number; // 0 to 100
  summary: AnalysisSummary | null;
  files: FileRecord[];
  rootPath: string;
  filter24h: boolean;
}