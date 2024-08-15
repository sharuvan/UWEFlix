'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Button, AppBar, Toolbar, Box, Paper, Grid, CssBaseline } from '@mui/material';
import Appbar from './appbar';

export default function Home() {
  const router = useRouter();
  const handleLogin = () => router.push('/login');
  const handleBookTickets = () => router.push('/book');
  const [user_type, set_user_type] = useState<string | null>(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem('user_type');
    console.log('user_type', storedUserType);
    set_user_type(storedUserType);
  }, []);

  const getUserButton = () => {
    if (user_type?.length) return (
      <Button
        variant="contained"
        color="secondary"
        onClick={() => router.push('/dashboard')}>
        Go To Dashboard
      </Button>
    );
    else return (
      <Button
        variant="contained"
        color="secondary"
        onClick={handleLogin}>
        Login
      </Button>
    );
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <CssBaseline />
      <Appbar />
      
      <Box sx={{ mt: 15 }}>
        <Typography variant="h3" gutterBottom>
          UWEFlix Cinema Booking System
        </Typography>
        <Typography variant="h6" gutterBottom>
          Conveniently make bookings and manage all things related to UWEFlix, online.
        </Typography>
        <Typography variant="body1">
          {!user_type?.length && 'Student, Club Manager, Account Manager or Cinema Manager?'}
          {user_type?.length && "You're logged in"}
        </Typography>
      </Box>

      <Grid container justifyContent="center" spacing={3} sx={{ my: 0 }}>
        <Grid item>
          {getUserButton()}
        </Grid>
      </Grid>

      <Paper sx={{ m:10, p: 3 }} elevation={3}>
        <Typography variant="h5" gutterBottom>Book Tickets Now</Typography>
        <Typography variant="body1" gutterBottom>No login required for customers</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBookTickets}>
          Book Tickets
        </Button>
      </Paper>
    </Box>
  );
}
