import { useEffect, useState } from 'react';
import { getUsersByType } from '../../services/api';
import { Container, TextField, Button, Grid, Typography, MenuItem, Box } from '@mui/material';

const AccountForm = ({ account, onSubmit, onCancel }) => {
  const [accountTitle, setAccountTitle] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [selectedUser, setSelectedUser] = useState('');
  const [students, setStudents] = useState([]);
  const [clubManagers, setClubManagers] = useState([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (account) {
      setAccountTitle(account.account_title);
      setCardNumber(account.card_number);
      setExpiryDate(account.expiry_date);
      setDiscountRate(account.discount_rate);
      setSelectedUser(account.user.id);
      setBalance(account.balance);
    } else {
      resetForm();
    }
  }, [account]);

  const resetForm = () => {
    setAccountTitle('');
    setCardNumber('');
    setExpiryDate('');
    setDiscountRate(0);
    setSelectedUser('');
    setBalance(0);
  };

  useEffect(() => {
    fetchUsers('student', setStudents);
    fetchUsers('club_manager', setClubManagers);
  }, []);

  const fetchUsers = async (userType, setUserList) => {
    const response = await getUsersByType(userType);
    setUserList(response.data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedAccount = {
      user_id: selectedUser,
      account_title: accountTitle,
      card_number: cardNumber,
      expiry_date: expiryDate,
      discount_rate: discountRate,
      balance: balance
    };
    onSubmit(updatedAccount);
  };

  return (
    <Container component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        {account ? 'Update Account' : 'Create Account'}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Account Title"
            value={accountTitle}
            onChange={(e) => setAccountTitle(e.target.value)}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            fullWidth
            required
            inputProps={{ maxLength: 16 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Expiry Date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            fullWidth
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Discount Rate"
            type="number"
            value={discountRate}
            onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
            fullWidth
            inputProps={{ step: "0.01", min: "0" }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            label="User"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            fullWidth
            required
          >
            <MenuItem value="">
              <em>Select a user</em>
            </MenuItem>
            {students.map(user => (
              <MenuItem key={user.id} value={user.id}>
                {user.username} (Student)
              </MenuItem>
            ))}
            {clubManagers.map(user => (
              <MenuItem key={user.id} value={user.id}>
                {user.username} (Club Manager)
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent={account ? 'space-between' : 'flex-end'}>
          {account && (
            <Button
              variant="contained"
              color="secondary"
              onClick={onCancel}
              style={{ marginRight: '10px' }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            type="submit"
          >
            {account ? 'Update' : 'Create'} Account
          </Button>
        </Box>
      </Grid>
    </Grid>
  </Container>
);
};

export default AccountForm;