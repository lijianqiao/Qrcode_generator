import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
  Button,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import QrCodeIcon from '@mui/icons-material/QrCode';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { QRCodeData } from '@/app/types/api';

interface TableToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  showGenerateQRCode?: boolean;
  onGenerateQRCode?: () => Promise<void>;
  isGeneratingQRCode?: boolean;
  selectedColumn?: string;
  selectedLabelColumn?: string;
  showReupload?: boolean;
  onReupload?: () => void;
  qrCodesData?: Record<string, QRCodeData>;
}

export function TableToolbar({
  searchTerm,
  onSearchChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  showGenerateQRCode = false,
  onGenerateQRCode,
  isGeneratingQRCode = false,
  selectedColumn,
  selectedLabelColumn,
  showReupload = false,
  onReupload,
  qrCodesData,
}: TableToolbarProps) {
  // 处理下载 PDF
  const handleDownloadPDF = () => {
    if (!qrCodesData) return;

    // 找到 PDF 文件
    const pdfFile = Object.values(qrCodesData).find(qr => qr.file_type === 'pdf');
    if (!pdfFile) return;

    // 创建下载链接
    const link = document.createElement('a');
    link.href = pdfFile.base64_image;
    link.download = pdfFile.file_path.split('\\').pop() || 'qrcodes.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 检查是否有 PDF 可下载
  const hasPDF = qrCodesData && Object.values(qrCodesData).some(qr => qr.file_type === 'pdf');

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <TextField
        size="small"
        placeholder="搜索..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ width: 200 }}
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="撤销">
          <span>
            <IconButton
              size="small"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="重做">
          <span>
            <IconButton
              size="small"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
        {showReupload && (
          <Tooltip title="重新上传文件">
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={onReupload}
              sx={{ py: 1 }}
            >
              重新上传
            </Button>
          </Tooltip>
        )}

        {hasPDF && (
          <Tooltip title="下载所有二维码 PDF">
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleDownloadPDF}
              sx={{ py: 1 }}
            >
              下载 PDF
            </Button>
          </Tooltip>
        )}

        {showGenerateQRCode && (
          <Tooltip 
            title={
              !selectedColumn 
                ? "请选择二维码内容列" 
                : selectedLabelColumn 
                  ? `将使用 "${selectedColumn}" 列作为内容，"${selectedLabelColumn}" 列作为标签生成二维码`
                  : `将使用 "${selectedColumn}" 列生成二维码`
            }
          >
            <span>
              <Button
                variant="contained"
                startIcon={isGeneratingQRCode ? <CircularProgress size={20} color="inherit" /> : <QrCodeIcon />}
                onClick={onGenerateQRCode}
                disabled={isGeneratingQRCode || !selectedColumn || !onGenerateQRCode}
                sx={{ py: 1 }}
              >
                {isGeneratingQRCode ? '生成中...' : '生成二维码'}
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
} 