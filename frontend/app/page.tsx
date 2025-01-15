'use client';

import { useState } from 'react';
import { Box, Container, Typography, Button, Stack, Paper } from '@mui/material';
import Link from 'next/link';
import QrCodeIcon from '@mui/icons-material/QrCode';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { APP_CONFIG } from '@/app/config/constants';
import GuideDialog from '@/app/components/GuideDialog';

export default function Home() {
  const [openGuide, setOpenGuide] = useState(false);

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        py: 8,
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box 
            sx={{ 
              display: 'inline-flex',
              p: 2,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'white',
              mb: 4,
            }}
          >
            <QrCodeIcon sx={{ fontSize: 48 }} />
          </Box>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              letterSpacing: -1,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {APP_CONFIG.name}
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            快速生成高质量二维码，支持批量处理和自定义标签
          </Typography>
        </Box>
        
        <Paper 
          elevation={0}
          sx={{ 
            width: '100%', 
            maxWidth: 600,
            p: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={2}>
            <Button
              component={Link}
              href="/qrcode"
              variant="contained"
              size="large"
              startIcon={<QrCodeIcon />}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              开始使用
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<MenuBookIcon />}
              onClick={() => setOpenGuide(true)}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              使用说明
            </Button>
          </Stack>
        </Paper>
      </Box>

      <GuideDialog 
        open={openGuide}
        onClose={() => setOpenGuide(false)}
      />
    </Container>
  );
}
