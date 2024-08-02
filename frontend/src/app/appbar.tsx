'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Button, AppBar, Toolbar, Box } from '@mui/material';
import { logout } from '../services/api';

export default function Appbar({title}) {
  const router = useRouter();
  const handleLogin = () => router.push('/login');
  const [user_type, set_user_type] = useState<string | null>(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem('user_type');
    set_user_type(storedUserType);
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await logout({refresh: refreshToken});
    localStorage.removeItem('user_type');
    set_user_type(null);
    router.push('/');
  };
  return (
    <AppBar position="fixed">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box  sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="text"
            color="inherit"
            onClick={()=>router.push('/')}
          >
            <Typography variant="h6">UWEFlix</Typography>
          </Button>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Button
          color="inherit"
          onClick={user_type ? handleLogout : handleLogin}
        >
          {user_type ? 'Logout' : 'Login'}
        </Button>
      </Toolbar>
    </AppBar>
  )
}