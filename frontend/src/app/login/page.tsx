'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Container, Typography, TextField, Button, Snackbar } from '@mui/material';
import { login } from '../../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await login({ username, password });
      const { access, refresh, user_type } = response;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user_type', user_type);

      router.push('/');
    } catch (error) {
      setSnackbarMessage('Invalid Credentials');
      setSnackbarOpen(true);
    }
  };

  return (
    <Container sx={{mt:5}}>
      <Typography variant="h3" align="center" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Username"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
     <TextField
       label="Password"
       type="password"
       fullWidth
       margin="normal"
       value={password}
       onChange={(e) => setPassword(e.target.value)}
     />
     <Button
       variant="contained"
       color="primary"
       fullWidth
       onClick={handleLogin}
       sx={{ mt: 2 }}
     >
       Login
     </Button>

     <Snackbar
       open={snackbarOpen}
       autoHideDuration={3000}
       onClose={() => setSnackbarOpen(false)}
       message={snackbarMessage}
     />
   </Container>
 );
}
