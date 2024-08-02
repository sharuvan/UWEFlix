'use client'
import { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { getShowingsByDate, bookTicket, getSeatAvailability } from '../../services/api';
import useSessionTimeout from '../../hooks/useSessionTimeout';
import Appbar from '../appbar';
import Book from './book';

export default function BookPage() {
  return (
    <Container sx={{mb:10, mt:15}}>
      <Appbar />
      <Book />
    </Container>
  );
}