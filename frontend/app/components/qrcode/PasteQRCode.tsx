'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { qrcodeApi } from '@/app/services/qrcode';
import { useTableFeatures } from '@/app/hooks/useTableFeatures';
import { QRCodeTable } from '@/app/components/table/QRCodeTable';
import LoadingState from '@/app/components/LoadingState';
import { QRCodePreview } from '@/app/components/qrcode/QRCodePreview';

interface TableRow {
  id: string;
  content: string;
  label: string;
}

export default function PasteQRCode() {
  // 表格数据状态
  const [tableData, setTableData] = useState<TableRow[]>([
    { id: 'empty-row', content: '', label: '' }
  ]);
  
  // 状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'error' | 'success'>('error');

  // 使用表格功能 hook
  const {
    searchTerm,
    setSearchTerm,
    filteredData,
    selectedRow,
    handleRowSelect,
    handleKeyNavigation,
    canUndo,
    canRedo,
    undo,
    redo,
    addToHistory,
    handleRowChange,
    qrCodesData,
    setQrCodesData,
    previewQRCode,
    setPreviewQRCode,
    findMatchingQRCode,
  } = useTableFeatures<TableRow>({
    data: tableData,
    searchColumn: 'content',
    onDataChange: (newData) => {
      setTableData(newData);
    },
    qrcodeConfig: {
      contentColumn: 'content',
      labelColumn: 'label',
    },
  });

  // 当二维码数据或选中行变化时，更新预览
  useEffect(() => {
    if (selectedRow && Object.keys(qrCodesData).length > 0) {
      const qrCode = findMatchingQRCode(selectedRow);
      setPreviewQRCode(qrCode);
    }
  }, [qrCodesData, selectedRow, findMatchingQRCode]);

  // 处理生成二维码
  const handleGenerateQRCodes = async () => {
    setLoading(true);
    setError(null);

    try {
      // 准备数据
      const contents = filteredData.map(row => {
        return `${row.content},${row.label}`;
      });

      const response = await qrcodeApi.generate({ contents });
      
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      // 保存所有二维码数据
      setQrCodesData(response.data);
      setAlertSeverity('success');
      setError('二维码生成成功');
      
    } catch (err) {
      setAlertSeverity('error');
      setError(err instanceof Error ? err.message : '生成二维码失败');
      // 清除所有二维码数据
      setQrCodesData({});
      setPreviewQRCode(null);
    } finally {
      setLoading(false);
    }
  };

  // 处理粘贴事件
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('text');
    const rows = clipboardData
      .split('\n')
      .filter(row => row.trim()) // 过滤空行
      .map((row, index) => {
        const [content, label] = row.split('\t').map(cell => cell.trim());
        return {
          id: `${Date.now()}-${index}`,
          content: content || '',
          label: label || '',
        };
      });

    if (rows.length > 0) {
      setTableData(rows);
      addToHistory(rows);
    }
  }, [addToHistory]);

  const columns = [
    {
      id: 'content',
      header: '二维码内容',
      accessor: (row: TableRow) => row.content,
      editable: true,
    },
    {
      id: 'label',
      header: '标签',
      accessor: (row: TableRow) => row.label,
      editable: true,
    },
  ];

  if (loading) {
    return <LoadingState message="正在更新..." fullHeight={false} />;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {error && (
        <Alert 
          severity={alertSeverity} 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      <Box sx={{ width: '100%', display: 'flex', gap: 3 }}>
        {/* 表格区域 */}
        <Box sx={{ flex: 1 }}>
          <Paper 
            elevation={0}
            sx={{ 
              width: '100%', 
              mb: 2,
              overflow: 'hidden',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {filteredData.length === 1 && !filteredData[0].content ? (
              // 空状态显示
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  color: 'text.secondary',
                  p: 4,
                }}
                onPaste={handlePaste}
              >
                <ContentPasteIcon 
                  sx={{ 
                    fontSize: 64,
                    color: 'primary.main',
                    opacity: 0.8,
                  }} 
                />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    从 Excel 复制数据到这里
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ maxWidth: 400 }}
                  >
                    支持多行数据，
                    第一列为二维码内容，第二列为标签（可选）
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{ 
                    mt: 2,
                    p: 2, 
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <EditNoteIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="body2">
                    双击单元格可以编辑内容
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Box onPaste={handlePaste}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    使用说明
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    <Box component="li" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        可以继续粘贴数据，新数据会替换当前表格内容
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        粘贴数据到表格中可双击单元格编辑内容, 支持撤销和重做, 数据无误之后, 点击 [ 生成二维码 ] 按钮
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                      生成二维码之后若需要修改单元格内容, 则二维码需要重新生成
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                  再次点击每行可以在右侧预览对应的二维码, 并支持鼠标点击和键盘上下键进行快速查看
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                  支持单个图片下载或整页 PDF 下载
                  </Typography>
                </Box>
                  </Box>
                </Paper>
                <QRCodeTable
                  data={filteredData}
                  columns={columns}
                  selectedRow={selectedRow}
                  onRowSelect={handleRowSelect}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={undo}
                  onRedo={redo}
                  onKeyNavigation={handleKeyNavigation}
                  onRowChange={handleRowChange}
                  showGenerateQRCode={true}
                  onGenerateQRCode={handleGenerateQRCodes}
                  qrCodesData={qrCodesData}
                  isGeneratingQRCode={loading}
                  selectedColumn="content"
                  selectedLabelColumn="label"
                />
              </Box>
            )}
          </Paper>
        </Box>

        {/* 预览区域 */}
        <QRCodePreview
          loading={loading}
          qrcode={previewQRCode}
          content={selectedRow?.content}
          label={selectedRow?.label}
          emptyIcon={<ContentPasteIcon sx={{ fontSize: 48, opacity: 0.5 }} />}
        />
      </Box>
    </Box>
  );
}
