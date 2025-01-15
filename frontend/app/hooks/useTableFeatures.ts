import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { QRCodeData } from '@/app/types/api';

interface TableFeatures<T> {
  // 搜索相关
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredData: T[];
  
  // 排序相关
  sortConfig: { column: string; direction: 'asc' | 'desc' } | null;
  setSortConfig: (config: { column: string; direction: 'asc' | 'desc' } | null) => void;
  
  // 历史记录相关
  history: T[][];
  currentHistoryIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  addToHistory: (data: T[]) => void;
  undo: () => void;
  redo: () => void;
  
  // 选择相关
  selectedRow: T | null;
  handleRowSelect: (row: T) => void;
  handleKeyNavigation: (e: React.KeyboardEvent) => void;

  // 二维码匹配相关
  findMatchingQRCode: (row: T) => QRCodeData | null;
  handleRowChange: (rowId: string, field: string, value: string) => void;
  qrCodesData: Record<string, QRCodeData>;
  setQrCodesData: (data: Record<string, QRCodeData>) => void;
  previewQRCode: QRCodeData | null;
  setPreviewQRCode: (qrcode: QRCodeData | null) => void;
}

interface QRCodeConfig {
  contentColumn: string;
  labelColumn?: string;
}

export function useTableFeatures<T extends { id: string }>({
  data,
  searchColumn,
  onRowSelect,
  onDataChange,
  qrcodeConfig,
}: {
  data: T[];
  searchColumn: keyof T;
  onRowSelect?: (row: T) => void;
  onDataChange?: (newData: T[]) => void;
  qrcodeConfig?: QRCodeConfig;
}): TableFeatures<T> {
  // 搜索状态
  const [searchTerm, setSearchTerm] = useState('');
  // 使用防抖的搜索词
  const debouncedSearchTerm = useDebounce(searchTerm, 1000); // 1秒延迟
  
  // 排序状态
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  // 历史记录状态
  const [history, setHistory] = useState<T[][]>([data]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  
  // 选择状态
  const [selectedRow, setSelectedRow] = useState<T | null>(null);

  // 当前数据状态
  const [currentData, setCurrentData] = useState<T[]>(data);

  // 二维码相关状态
  const [qrCodesData, setQrCodesData] = useState<Record<string, QRCodeData>>({});
  const [previewQRCode, setPreviewQRCode] = useState<QRCodeData | null>(null);

  // 更新当前数据
  useEffect(() => {
    // 只在外部数据变化时更新
    if (JSON.stringify(data) !== JSON.stringify(currentData)) {
      setCurrentData(data);
      setHistory([data]);
      setCurrentHistoryIndex(0);
    }
  }, [data]);

  // 过滤数据
  const filteredData = useMemo(() => {
    let result = [...currentData];
    
    // 使用防抖后的搜索词进行过滤
    if (debouncedSearchTerm) {
      result = result.filter(row => 
        String(row[searchColumn]).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    // 排序
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = String(a[sortConfig.column as keyof T]);
        const bValue = String(b[sortConfig.column as keyof T]);
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [currentData, debouncedSearchTerm, sortConfig, searchColumn]);

  // 历史记录操作
  const addToHistory = useCallback((newData: T[]) => {
    // 先更新当前数据
    setCurrentData(newData);

    // 更新历史记录
    setHistory(prev => {
      // 移除当前位置之后的历史记录
      const newHistory = [...prev.slice(0, currentHistoryIndex + 1), newData];
      // 限制历史记录的最大长度
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      return newHistory;
    });

    // 更新历史记录索引
    setCurrentHistoryIndex(prev => {
      const newIndex = prev + 1;
      return newIndex >= 50 ? 49 : newIndex;
    });

    // 通知外部数据变化
    onDataChange?.(newData);
  }, [currentHistoryIndex, onDataChange]);

  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const previousData = history[newIndex];
      
      // 更新状态
      setCurrentHistoryIndex(newIndex);
      setCurrentData(previousData);
      onDataChange?.(previousData);
    }
  }, [currentHistoryIndex, history, onDataChange]);

  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const nextData = history[newIndex];
      
      // 更新状态
      setCurrentHistoryIndex(newIndex);
      setCurrentData(nextData);
      onDataChange?.(nextData);
    }
  }, [currentHistoryIndex, history, onDataChange]);

  // 二维码匹配函数
  const findMatchingQRCode = useCallback((row: T): QRCodeData | null => {
    if (!qrcodeConfig || !Object.keys(qrCodesData).length) {
      return null;
    }

    const content = String(row[qrcodeConfig.contentColumn as keyof T]);
    const label = qrcodeConfig.labelColumn 
      ? String(row[qrcodeConfig.labelColumn as keyof T]) 
      : '';
    const qrCodeText = `${content},${label}`;

    const qrCode = Object.values(qrCodesData).find(qr => {
      if (qr.file_type !== 'image') return false;
      return qr.qrcode_text === qrCodeText;
    });

    return qrCode || null;
  }, [qrcodeConfig]);

  // 处理行数据变更
  const handleRowChange = useCallback((rowId: string, field: string, value: string) => {
    const newData = currentData.map(row => {
      if (row.id === rowId) {
        return { ...row, [field]: value };
      }
      return row;
    });

    // 如果有二维码数据，只清除被修改行的二维码数据
    if (qrcodeConfig && Object.keys(qrCodesData).length > 0) {
      // 找到被修改的行
      const modifiedRow = newData.find(row => row.id === rowId);
      if (modifiedRow) {
        // 找到并删除该行对应的二维码数据
        const newQrCodesData = { ...qrCodesData };
        Object.entries(newQrCodesData).forEach(([key, qrCode]) => {
          const content = String(modifiedRow[qrcodeConfig.contentColumn as keyof T]);
          const label = qrcodeConfig.labelColumn 
            ? String(modifiedRow[qrcodeConfig.labelColumn as keyof T]) 
            : '';
          const qrCodeText = `${content},${label}`;
          
          if (qrCode.qrcode_text === qrCodeText) {
            delete newQrCodesData[key];
          }
        });
        setQrCodesData(newQrCodesData);

        // 如果当前选中的是被修改的行，清除预览
        if (selectedRow?.id === rowId) {
          setPreviewQRCode(null);
        }
      }
    }

    // 添加到历史记录
    addToHistory(newData);
  }, [currentData, qrcodeConfig, qrCodesData, selectedRow, addToHistory]);

  // 行选择处理
  const handleRowSelect = useCallback((row: T) => {
    setSelectedRow(row);
    if (qrcodeConfig && Object.keys(qrCodesData).length > 0) {
      const qrCode = findMatchingQRCode(row);
      setPreviewQRCode(qrCode);
    }
    onRowSelect?.(row);
  }, [qrcodeConfig, qrCodesData, findMatchingQRCode, onRowSelect]);

  // 键盘导航
  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    if (!selectedRow || !filteredData.length) return;

    const currentIndex = filteredData.indexOf(selectedRow);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = Math.min(filteredData.length - 1, currentIndex + 1);
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = filteredData.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      handleRowSelect(filteredData[nextIndex]);
    }
  }, [selectedRow, filteredData, handleRowSelect]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    sortConfig,
    setSortConfig,
    history,
    currentHistoryIndex,
    canUndo: currentHistoryIndex > 0,
    canRedo: currentHistoryIndex < history.length - 1,
    addToHistory,
    undo,
    redo,
    selectedRow,
    handleRowSelect,
    handleKeyNavigation,
    findMatchingQRCode,
    handleRowChange,
    qrCodesData,
    setQrCodesData,
    previewQRCode,
    setPreviewQRCode,
  };
} 