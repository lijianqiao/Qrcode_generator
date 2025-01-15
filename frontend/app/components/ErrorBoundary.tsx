'use client';

import React from 'react';
import { Box, Button, Alert, AlertTitle } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Alert 
            severity="error"
            variant="outlined"
            sx={{ width: '100%', maxWidth: 600 }}
          >
            <AlertTitle>发生错误</AlertTitle>
            {this.state.error?.message || '应用程序出现了一个错误'}
          </Alert>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            startIcon={<ErrorIcon />}
          >
            刷新页面
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
} 