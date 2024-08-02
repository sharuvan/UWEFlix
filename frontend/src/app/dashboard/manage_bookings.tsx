'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
} from '@mui/material';
import { Delete, Done } from '@mui/icons-material';
import { getAllTransactions, approveTransactionDiscount, cancelTransaction } from '../../services/api';

const ManageBookings = () => {
  const [transactions, setTransactions] = useState([]);
  const [discountAmounts, setDiscountAmounts] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchTransactions = async () => {
    try {
      const response = await getAllTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleApproveDiscount = async (transactionId) => {
    try {
      const discountAmount = discountAmounts[transactionId];
      await approveTransactionDiscount(transactionId, discountAmount);
      setSnackbarMessage('Discount approved successfully');
      setSnackbarOpen(true);
      fetchTransactions(); // refresh data
    } catch (error) {
      console.error('Error approving discount:', error);
      setSnackbarMessage('Error approving discount');
      setSnackbarOpen(true);
    }
  };

  const handleCancelTransaction = async (transactionId) => {
    try {
      await cancelTransaction(transactionId);
      setSnackbarMessage('Transaction cancelled successfully');
      setSnackbarOpen(true);
      fetchTransactions(); // refresh data
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      setSnackbarMessage('Error cancelling transaction');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDiscountChange = (transactionId, discountAmount) => {
    setDiscountAmounts({
      ...discountAmounts,
      [transactionId]: discountAmount,
    });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Bookings
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Account</TableCell>
            <TableCell>Ticket</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Cancel Requested</TableCell>
            <TableCell>Discount Requested Amount</TableCell>
            <TableCell>Discount Amount</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
              <TableCell>{transaction.account_title}</TableCell>
              <TableCell>{transaction.details}</TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>{transaction.price}</TableCell>
              <TableCell>{transaction.cancel_requested ? 'Yes' : 'No'}</TableCell>
              <TableCell>{transaction.discount_request_amount ? transaction.discount_request_amount : 'None'}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  label="Discount Amount"
                  value={discountAmounts[transaction.id] || ''}
                  onChange={(e) => handleDiscountChange(transaction.id, e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={() => handleApproveDiscount(transaction.id)}
                  disabled={!transaction.discount_request_amount}
                >
                  <Done />
                </IconButton>
                <IconButton onClick={() => handleCancelTransaction(transaction.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default ManageBookings;
