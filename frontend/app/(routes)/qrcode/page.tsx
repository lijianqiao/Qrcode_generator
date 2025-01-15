'use client';

import { Box, Paper, Tab, Tabs } from '@mui/material';
import { Suspense, lazy, useState } from 'react';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import LoadingState from '@/app/components/LoadingState';

// 使用 lazy 进行代码分割
const SingleQRCode = lazy(() => import('@/app/components/qrcode/SingleQRCode'));
const MultiQRCode = lazy(() => import('@/app/components/qrcode/MultiQRCode'));
const BatchQRCode = lazy(() => import('@/app/components/qrcode/BatchQRCode'));
const PasteQRCode = lazy(() => import('@/app/components/qrcode/PasteQRCode'));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`qrcode-tabpanel-${index}`}
      aria-labelledby={`qrcode-tab-${index}`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && (
        <Box 
          sx={{ 
            height: '100%',
            p: { xs: 2, sm: 3 },
            overflow: 'auto'
          }}
        >
          <ErrorBoundary>
            <Suspense fallback={<LoadingState message="加载组件中..." />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </Box>
      )}
    </div>
  );
}

export default function QRCodePage() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 180px)',
        minHeight: 600,
      }}
    >
      {/* 主要内容区域 */}
      <Paper 
        elevation={0}
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="二维码生成选项"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                minHeight: 56,
                fontSize: '0.95rem',
                fontWeight: 600,
              },
            }}
          >
            <Tab 
              icon={<QrCodeIcon />} 
              iconPosition="start" 
              label="单个二维码" 
            />
            <Tab 
              icon={<QrCodeIcon />} 
              iconPosition="start" 
              label="多个二维码" 
            />
            <Tab 
              icon={<QrCodeIcon />} 
              iconPosition="start" 
              label="带标签二维码" 
            />
            <Tab 
              icon={<QrCodeIcon />} 
              iconPosition="start" 
              label="批量二维码" 
            />
          </Tabs>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <TabPanel value={value} index={0}>
            <SingleQRCode />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <MultiQRCode />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <BatchQRCode />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <PasteQRCode />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
} 