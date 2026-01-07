import { FileRecord, DataType, BusinessStatus, AnalysisSummary } from '../types';

// Constants for simulation
const TOTAL_BLOCKS_PER_FILE = 10;
const BLOCK_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Simulates parsing a file.
 */
const parseFile = (file: File, type: DataType): Partial<FileRecord> => {
  const seed = file.size + file.name.length;
  
  if (type === DataType.GOOD) {
    const rand = (seed % 100);
    let status = BusinessStatus.NORMAL;
    if (rand > 85) status = BusinessStatus.LEVEL_1;
    if (rand > 95) status = BusinessStatus.LEVEL_2;
    if (rand > 98) status = BusinessStatus.LEVEL_3;
    
    return { status };
  } else {
    const lossSeverity = (seed % 3); 
    const missingBlockIds: number[] = [];
    
    BLOCK_IDS.forEach(id => {
      let threshold = 0.1; 
      if (lossSeverity === 0) threshold = 0.6;
      if (lossSeverity === 1) threshold = 0.3;
      if (id === 9) threshold += 0.2;

      const blockSeed = seed + id * 17;
      if ((blockSeed % 100) / 100 < threshold) {
        missingBlockIds.push(id);
      }
    });

    return {
      totalBlocks: TOTAL_BLOCKS_PER_FILE,
      receivedBlocks: TOTAL_BLOCKS_PER_FILE - missingBlockIds.length,
      missingBlockIds
    };
  }
};

export const calculateSummary = (files: FileRecord[]): AnalysisSummary => {
  const summary: AnalysisSummary = {
    totalFiles: files.length,
    goodDataCount: 0,
    badDataCount: 0,
    processingTimeMs: 0,
    statusDistribution: {
      [BusinessStatus.NORMAL]: 0,
      [BusinessStatus.LEVEL_1]: 0,
      [BusinessStatus.LEVEL_2]: 0,
      [BusinessStatus.LEVEL_3]: 0,
      [BusinessStatus.UNKNOWN]: 0,
    },
    missingBlockCounts: {},
    completenessDistribution: {},
  };

  BLOCK_IDS.forEach(id => summary.missingBlockCounts[id] = 0);

  files.forEach(record => {
    if (record.type === DataType.GOOD) {
      summary.goodDataCount++;
      if (record.status) {
        summary.statusDistribution[record.status] = (summary.statusDistribution[record.status] || 0) + 1;
      }
    } else if (record.type === DataType.BAD) {
      summary.badDataCount++;
      record.missingBlockIds?.forEach(id => {
        summary.missingBlockCounts[id] = (summary.missingBlockCounts[id] || 0) + 1;
      });
      const rx = record.receivedBlocks || 0;
      summary.completenessDistribution[rx] = (summary.completenessDistribution[rx] || 0) + 1;
    }
  });

  return summary;
};

export const processFiles = async (
  fileList: FileList, 
  onProgress: (progress: number) => void
): Promise<{ files: FileRecord[] }> => {
  const startTime = performance.now();
  const records: FileRecord[] = [];
  const totalFiles = fileList.length;

  const CHUNK_SIZE = 500;
  
  for (let i = 0; i < totalFiles; i += CHUNK_SIZE) {
    const chunk = Array.from(fileList).slice(i, i + CHUNK_SIZE);
    
    chunk.forEach(file => {
      const path = file.webkitRelativePath || file.name;
      let type = DataType.UNKNOWN;

      if (path.includes('GoodData') || path.includes('good_data')) {
        type = DataType.GOOD;
      } else if (path.includes('BadData') || path.includes('bad_data')) {
        type = DataType.BAD;
      } else {
        type = (file.name.length % 2 === 0) ? DataType.GOOD : DataType.BAD;
      }

      const parsedData = parseFile(file, type);

      const record: FileRecord = {
        fileName: file.name,
        path: path,
        type: type,
        timestamp: file.lastModified,
        ...parsedData
      };

      records.push(record);
    });

    const currentProgress = Math.min(100, Math.round(((i + chunk.length) / totalFiles) * 100));
    onProgress(currentProgress);
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return { files: records };
};

export const generateMockFiles = (count: number): File[] => {
  const files: File[] = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < count; i++) {
    const isGood = Math.random() > 0.3;
    const folder = isGood ? 'GoodData' : 'BadData';
    const name = `sensor_log_${i}.bin`;
    
    // Generate mixed timestamps: 50% within last 24h, 50% older (up to 7 days)
    const isRecent = Math.random() > 0.5;
    const timeOffset = isRecent 
      ? Math.random() * oneDay 
      : oneDay + (Math.random() * 6 * oneDay);
    
    const lastModified = now - timeOffset;

    const file = new File(["dummy content"], name, { lastModified });
    Object.defineProperty(file, 'webkitRelativePath', {
      value: `Root/${folder}/${name}`
    });
    files.push(file);
  }
  return files;
};

export const generateCSV = (files: FileRecord[]): string => {
  const headers = ['文件名 (File Name)', '路径 (Path)', '类型 (Type)', '时间戳 (Timestamp)', '业务状态 (Status)', '总块数 (Total Blocks)', '实收块数 (Received)', '丢失块ID (Missing IDs)'];
  const rows = files.map(f => [
    f.fileName,
    f.path,
    f.type,
    new Date(f.timestamp).toISOString(),
    f.status || '',
    f.totalBlocks || '',
    f.receivedBlocks || '',
    f.missingBlockIds ? `"${f.missingBlockIds.join(',')}"` : ''
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};