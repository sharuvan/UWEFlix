'use client';
import { useState, useEffect } from 'react';
import { getMyAccount, getMyTransactions, authorizePayment, requestTransactionCancel, requestTransactionDiscount } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Container, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, Snackbar, Alert } from '@mui/material';

const Account = () => {
  const [account, setAccount] = useState({ account_number: '', balance: 0.0 });
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0.0);
  const [transactionsCumulative, setTransactionsCumulative] = useState(0.0);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const user = useAuth();

  const fetchAccountDetails = async () => {
    try {
      const accountResponse = await getMyAccount();
      const accountData = accountResponse.data;
      setAccount(accountData);
      const accountBalance = parseFloat(accountData.balance);
      setBalance(accountBalance);

      const transactionsResponse = await getMyTransactions();
      const transactionsData = transactionsResponse.data.transactions;
      setTransactions(transactionsData);

      const calculatedOutstandingBalance = transactionsData.reduce(
        (acc, transaction) => acc + parseFloat(transaction.total_amount), 0);
      setTransactionsCumulative(calculatedOutstandingBalance);

      setError('');
    } catch (err) {
      setError('Failed to fetch transactions or balance');
    }
  };

  useEffect(() => {
    // if (user) {
      fetchAccountDetails();
    // }
  }, [user]);

  const handleAuthorizePayment = async () => {
    try {
      await authorizePayment({ accountNumber: account.account_number, amount: getOutstandingBalance() });
      setSnackbarMessage('Payment Authorized Successfully');
      setSnackbarOpen(true);
      fetchAccountDetails();
    } catch (err) {
      setError('Failed to authorize payment');
    }
  };

  const handleRequestCancel = async (transactionId) => {
    try {
      await requestTransactionCancel(transactionId);
      setSnackbarMessage('Cancellation Requested Successfully');
      setSnackbarOpen(true);
      fetchAccountDetails();
    } catch (err) {
      setError('Failed to request cancellation');
    }
  };

  const handleRequestDiscount = async (transactionId, discountAmount) => {
    try {
      await requestTransactionDiscount(transactionId, discountAmount);
      setSnackbarMessage('Discount Requested Successfully');
      setSnackbarOpen(true);
      fetchAccountDetails();
    } catch (err) {
      setError('Failed to request discount');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const getOutstandingBalance = () => {
    return transactionsCumulative - balance;
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" marginTop={4} marginBottom={2}>
        Account Dashboard
      </Typography>

      {error && <Alert severity="error" style={{ marginTop: '20px' }}>{error}</Alert>}

      <Paper style={{ marginTop: '20px', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Cancel</TableCell>
              <TableCell>Discount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(transaction => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.details}</TableCell>
                <TableCell>${transaction.total_amount}</TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => handleRequestCancel(transaction.id)}
                    disabled={transaction.cancel_requested}
                  >
                    {transaction.cancel_requested ? 'Requested' : 'Request Cancel'}
                  </Button>
                </TableCell>
                <TableCell>
                  <TextField 
                    variant="outlined" 
                    label="Discount Amount" 
                    type="number"
                    onChange={(e) => transaction.discount_request_amount = parseFloat(e.target.value)} 
                    disabled={transaction.discount_request_status === 'requested' || transaction.discount_request_status === 'approved'}
                  />
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleRequestDiscount(transaction.id, transaction.discount_request_amount)}
                    disabled={transaction.discount_request_status === 'requested' || transaction.discount_request_status === 'approved'}
                  >
                    {transaction.discount_request_status === 'requested' || transaction.discount_request_status === 'approved' ? 'Requested' : 'Request Discount'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="h6" marginTop={2}>
        Outstanding Balance: ${getOutstandingBalance().toFixed(2)}
      </Typography>

      <Button variant="contained" color="secondary" onClick={handleAuthorizePayment} style={{ marginTop: '10px' }}>
        Authorize Payment
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Account;
