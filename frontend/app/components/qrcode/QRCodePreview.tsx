'use client';

import { Box, Paper, Typography, CircularProgress, Fade, IconButton, Tooltip } from '@mui/material';
import Image from 'next/image';
import { QRCodeData } from '@/app/types/api';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface QRCodePreviewProps {
  loading?: boolean;
  qrcode: QRCodeData | null;
  content?: string;
  label?: string;
  emptyIcon?: React.ReactNode;
  emptyText?: string;
}

export function QRCodePreview({
  loading = false,
  qrcode,
  content,
  label,
  emptyIcon = <QrCodeIcon sx={{ fontSize: 48, opacity: 0.5 }} />,
  emptyText = '请选择一行数据预览二维码',
}: QRCodePreviewProps) {
  const handleDownloadImage = () => {
    if (!qrcode?.file_path) return;
    
    const link = document.createElement('a');
    link.href = qrcode.base64_image;
    link.download = qrcode.file_path.split('/').pop() || 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        width: 320, 
        p: 3,
        height: 'fit-content',
        position: 'sticky',
        top: 24,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
          }}
        >
          二维码预览
        </Typography>
        {qrcode && (
          <Tooltip title="下载图片">
            <IconButton
              size="small"
              onClick={handleDownloadImage}
              sx={{ 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.50',
                },
              }}
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {content ? (
        <Box sx={{ textAlign: 'center' }}>
          {loading ? (
            <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={40} />
            </Box>
          ) : qrcode ? (
            <Fade in timeout={500}>
              <Box>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 240,
                    aspectRatio: '1',
                    margin: '0 auto',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <Image
                    src={qrcode.base64_image}
                    alt="预览二维码"
                    fill
                    priority
                    sizes="(max-width: 240px) 100vw"
                    style={{
                      objectFit: 'contain',
                    }}
                  />
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      wordBreak: 'break-word',
                      textAlign: 'left',
                    }}
                  >
                    <Box component="span" sx={{ display: 'block', mb: label ? 1 : 0 }}>
                      <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>内容：</Box>
                      {content}
                    </Box>
                    {label && (
                      <Box component="span" sx={{ display: 'block' }}>
                        <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>标签：</Box>
                        {label}
                      </Box>
                    )}
                  </Typography>
                </Paper>
              </Box>
            </Fade>
          ) : (
            <Typography 
              variant="body2" 
              color="error"
              align="center"
            >
              生成预览失败
            </Typography>
          )}
        </Box>
      ) : (
        <Box 
          sx={{ 
            py: 8, 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'text.secondary',
            gap: 2,
          }}
        >
          {emptyIcon}
          <Typography variant="body1" align="center">
            {emptyText}
          </Typography>
        </Box>
      )}
    </Paper>
  );
} 