'use client';

import { useState, useTransition } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Typography,
  Fade,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import Image from 'next/image';
import { QRCodeData } from '@/app/types/api';
import { qrcodeApi } from '@/app/services/qrcode';
import { APP_CONFIG } from '@/app/config/constants';
import LoadingState from '@/app/components/LoadingState';
import FileDownload from '@mui/icons-material/FileDownload';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';

export default function MultiQRCode() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ content: string; data: QRCodeData }[] | null>(null);
  const [qrCodesData, setQrCodesData] = useState<Record<string, QRCodeData>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 将文本域内容按行分割，并过滤掉空行
    const contents = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (contents.length === 0) {
      setError('请输入至少一个有效的二维码内容');
      return;
    }

    if (contents.length > APP_CONFIG.qrcode.maxBatchSize) {
      setError(`批量生成数量不能超过 ${APP_CONFIG.qrcode.maxBatchSize} 个`);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await qrcodeApi.generate({ contents });
      
      // 使用 startTransition 来处理状态更新，使其不阻塞 UI
      startTransition(() => {
        if (!response.data) {
          throw new Error('生成二维码失败');
        }
        setQrCodesData(response.data);
        // 将内容和二维码数据组合在一起
        const qrCodes = Object.values(response.data);
        const resultsWithContent = contents.map((content, index) => ({
          content,
          data: qrCodes[index]
        }));
        setResults(resultsWithContent);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成二维码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
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
        maxWidth: 800, 
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

        <Typography 
          variant="body2" 
          color="text.secondary" 
          gutterBottom
          sx={{ mb: 2 }}
        >
          请输入要生成的二维码内容，每行一个，最多 {APP_CONFIG.qrcode.maxBatchSize} 个
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={10}
          placeholder={"例如：\nhttps://example1.com\nhttps://example2.com\nhttps://example3.com"}
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

      <Collapse in={!!results} timeout={300}>
        {results && (
          <Fade in timeout={500}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
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

              <Grid container spacing={2}>
                {results.map(({ content: qrContent, data }, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: 1,
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                      >
                        <Image
                          src={data.base64_image}
                          alt={qrContent}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{
                            objectFit: 'contain',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'background.paper',
                            borderRadius: '50%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                        >
                          <Tooltip title="下载图片">
                            <IconButton
                              size="small"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = data.base64_image;
                                link.download = data.file_path.split('/').pop() || 'qrcode.png';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <FileDownload fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mt: 2,
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.2em',
                          maxHeight: '3.6em',
                          color: 'text.secondary',
                        }}
                      >
                        {qrContent}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Fade>
        )}
      </Collapse>
    </Box>
  );
} 