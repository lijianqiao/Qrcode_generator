'use client';

import { AppBar, Toolbar, Typography, Container, useTheme } from '@mui/material';
import Link from 'next/link';
import QrCodeIcon from '@mui/icons-material/QrCode';

export default function Navbar() {
  const theme = useTheme();
  
  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 64 }}>
          <QrCodeIcon 
            sx={{ 
              mr: 1.5, 
              color: 'primary.main',
              fontSize: 28,
            }} 
          />
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
              fontWeight: 600,
              letterSpacing: -0.5,
              flexGrow: 1,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            二维码生成器
          </Typography>

        </Toolbar>
      </Container>
    </AppBar>
  );
} 