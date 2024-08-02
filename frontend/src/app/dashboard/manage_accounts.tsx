'use client';
import { useEffect, useState } from 'react';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AccountForm from './AccountForm';
import { Container, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper, CircularProgress, ListItemButton, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ManageAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await getAccounts();
      if (response && response.data) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateAccount = async (account) => {
    try {
      if (selectedAccount) {
        await updateAccount(selectedAccount.account_number, account);
        setSnackbarMessage('Account updated successfully');
      } else {
        await createAccount(account);
        setSnackbarMessage('Account created successfully');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchAccounts();
      setSelectedAccount(null);
    } catch (error) {
      setSnackbarMessage('Error creating/updating account');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error("Error creating/updating account:", error);
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await deleteAccount(id);
      setSnackbarMessage('Account deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchAccounts();
    } catch (error) {
      setSnackbarMessage('Error deleting account');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error("Error deleting account:", error);
    }
  };

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" marginTop={4} marginBottom={2}>
        Manage Accounts
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <AccountForm
          account={selectedAccount}
          onSubmit={handleCreateOrUpdateAccount}
          onCancel={() => setSelectedAccount(null)}
        />
      </Paper>
      {loading ? (
        <CircularProgress />
      ) : accounts.length > 0 ? (
        <List>
          {accounts.map((account) => (
            <ListItem key={account.id} divider>
              <ListItemButton onClick={() => handleSelectAccount(account)}>
                <ListItemText
                  primary={account.account_title}
                />
              </ListItemButton>
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="edit" onClick={() => setSelectedAccount(account)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" edge="end" aria-label="delete" onClick={() => handleDeleteAccount(account.account_number)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No accounts available.</Typography>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageAccounts;