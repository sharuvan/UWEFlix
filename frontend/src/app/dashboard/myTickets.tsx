'use client';
import { useState, useEffect } from 'react';
import { getMyTickets } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Container, Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, Alert } from '@mui/material';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const user = useAuth();

  const fetchTickets = async () => {
    try {
      const ticketsResponse = await getMyTickets();
      const ticketsData = ticketsResponse.data.tickets;
      setTickets(ticketsData);
      setError('');
    } catch (err) {
      setError('Failed to fetch tickets');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" marginTop={4} marginBottom={2}>
        My Tickets
      </Typography>

      {error && <Alert severity="error" style={{ marginTop: '20px' }}>{error}</Alert>}

      <Paper style={{ marginTop: '20px', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Film</TableCell>
              <TableCell>Show Time</TableCell>
              <TableCell>Seats</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.date}</TableCell>
                <TableCell>{ticket.details.film_title}</TableCell>
                <TableCell>{ticket.details.show_time}</TableCell>
                <TableCell>{ticket.details.seats.join(', ')}</TableCell>
                <TableCell>${ticket.total_amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default MyTickets;