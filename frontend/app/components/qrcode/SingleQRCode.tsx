'use client';

import { useState, useTransition } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  CircularProgress,
  Paper,
  Typography,
  Fade,
  Collapse,
} from '@mui/material';
import Image from 'next/image';
import { QRCodeData } from '@/app/types/api';
import { qrcodeApi } from '@/app/services/qrcode';
import LoadingState from '@/app/components/LoadingState';
import FileDownload from '@mui/icons-material/FileDownload';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';

export default function SingleQRCode() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QRCodeData | null>(null);
  const [qrCodesData, setQrCodesData] = useState<Record<string, QRCodeData>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      setError('请输入二维码内容');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await qrcodeApi.generate({ 
        contents: [trimmedContent] 
      });
      
      // 使用 startTransition 来处理状态更新，使其不阻塞 UI
      startTransition(() => {
        if (!response.data) {
          throw new Error('生成二维码失败');
        }
        setQrCodesData(response.data);
        const [qrCode] = Object.values(response.data);
        if (!qrCode) {
          throw new Error('生成二维码失败');
        }
        setResult(qrCode);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成二维码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    // 清除之前的错误
    if (error) {
      setError(null);
    }
  };

  if (isPending) {
    return <LoadingState message="正在更新..." fullHeight={false} />;
  }

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        maxWidth: 600, 
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ mb: 2, fontWeight: 600 }}
        >
          输入内容
        </Typography>
        
        <TextField
          fullWidth
          label="请输入你要生成二维码的内容"
          value={content}
          onChange={handleContentChange}
          disabled={loading}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          fullWidth
          sx={{
            py: 1.5,
            position: 'relative',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>生成中...</span>
            </Box>
          ) : '生成二维码'}
        </Button>
      </Paper>

      <Collapse in={!!result} timeout={300}>
        {result && (
          <Fade in timeout={500}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 300,
                  aspectRatio: '1',
                  margin: '0 auto',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}
              >
                <Image
                  src={result.base64_image}
                  alt="生成的二维码"
                  fill
                  priority
                  sizes="(max-width: 300px) 100vw, 300px"
                  style={{
                    objectFit: 'contain',
                  }}
                />
              </Box>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownload />}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = result.base64_image;
                    link.download = result.file_path.split('/').pop() || 'qrcode.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  下载图片
                </Button>
                {Object.values(qrCodesData).some(qr => qr.file_type === 'pdf') && (
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdf />}
                    onClick={() => {
                      const pdfFile = Object.values(qrCodesData).find(qr => qr.file_type === 'pdf');
                      if (!pdfFile) return;

                      const link = document.createElement('a');
                      link.href = pdfFile.base64_image;
                      link.download = pdfFile.file_path.split('/').pop() || 'qrcodes.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    下载 PDF
                  </Button>
                )}
              </Box>

            </Paper>
          </Fade>
        )}
      </Collapse>
    </Box>
  );
} 