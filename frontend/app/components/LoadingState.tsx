'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
}

export default function LoadingState({ 
  message = '加载中...', 
  fullHeight = true 
}: LoadingStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: fullHeight ? '100%' : 'auto',
        minHeight: fullHeight ? 400 : 200,
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ 
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          '@keyframes pulse': {
            '0%, 100%': {
              opacity: 1,
            },
            '50%': {
              opacity: 0.5,
            },
          },
        }}
      >
        {message}
      </Typography>
    </Box>
  );
} 