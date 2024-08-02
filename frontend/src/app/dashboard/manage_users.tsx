'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  MenuItem,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [formValues, setFormValues] = useState({
    user_type: '',
    landline_phone: '',
    mobile_phone: '',
    email_address: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    street_number: '',
    street: '',
    city: '',
    post_code: '',
  });
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchUsers = async () => {
    const response = await getUsers();
    setUsers(response.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateUser(editingUserId, formValues);
        setSnackbarMessage('User updated successfully');
      } else {
        const response = await createUser(formValues);
        setGeneratedCredentials(response.data);
        setDialogOpen(true);
        setSnackbarMessage('User created successfully');
      }
      setFormValues({
        user_type: '',
        landline_phone: '',
        mobile_phone: '',
        email_address: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        street_number: '',
        street: '',
        city: '',
        post_code: '',
      });
      setIsEditMode(false);
      setEditingUserId(null);
      fetchUsers();
    } catch (error) {
      console.error('Error creating/updating user:', error);
      setSnackbarMessage('Error creating/updating user');
    }
    setSnackbarOpen(true);
  };

  const handleEdit = (user) => {
    setFormValues({
      user_type: user.user_type,
      landline_phone: user.landline_phone,
      mobile_phone: user.mobile_phone,
      email_address: user.email_address,
      first_name: user.first_name,
      last_name: user.last_name,
      date_of_birth: user.date_of_birth,
      street_number: user.street_number,
      street: user.street,
      city: user.city,
      post_code: user.post_code,
    });
    setIsEditMode(true);
    setEditingUserId(user.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setSnackbarMessage('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbarMessage('Error deleting user');
    }
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="User Type"
          name="user_type"
          value={formValues.user_type}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value="student">Student</MenuItem>
          <MenuItem value="club_manager">Club Manager</MenuItem>
        </TextField>

        <Box mt={2} mb={2}>
          <Typography variant="h6" gutterBottom>
            Contact Details
          </Typography>
          <TextField
            label="Landline Phone"
            name="landline_phone"
            value={formValues.landline_phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Mobile Phone"
            name="mobile_phone"
            value={formValues.mobile_phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email Address"
            name="email_address"
            value={formValues.email_address}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="First Name"
            name="first_name"
            value={formValues.first_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={formValues.last_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
          label="Date of Birth"
          name="date_of_birth"
          type="date"
          value={formValues.date_of_birth}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        </Box>

        <Box mt={2} mb={2}>
          <Typography variant="h6" gutterBottom>
            Address Details
          </Typography>
          <TextField
            label="Street Number"
            name="street_number"
            value={formValues.street_number}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Street"
            name="street"
            value={formValues.street}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="City"
            name="city"
            value={formValues.city}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Post Code"
            name="post_code"
            value={formValues.post_code}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          style={{ marginTop: '1rem' }}
        >
          {isEditMode ? 'Update User' : 'Add User'}
        </Button>
      </form>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>User Created</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography>Username: {generatedCredentials && generatedCredentials.username}</Typography>
            <Typography>Password: {generatedCredentials && generatedCredentials.password}</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />

      <Typography variant="h4" gutterBottom style={{ marginTop: '2rem' }}>
        Existing Users
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>User Type</TableCell>
            <TableCell>Landline Phone</TableCell>
            <TableCell>Mobile Phone</TableCell>
            <TableCell>Email Address</TableCell>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Date of Birth</TableCell>
            <TableCell>Street Number</TableCell>
            <TableCell>Street</TableCell>
            <TableCell>City</TableCell>
            <TableCell>Post Code</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.user_type}</TableCell>
              <TableCell>{user.landline_phone}</TableCell>
              <TableCell>{user.mobile_phone}</TableCell>
              <TableCell>{user.email_address}</TableCell>
              <TableCell>{user.first_name}</TableCell>
              <TableCell>{user.last_name}</TableCell>
              <TableCell>{user.date_of_birth}</TableCell>
              <TableCell>{user.street_number}</TableCell>
              <TableCell>{user.street}</TableCell>
              <TableCell>{user.city}</TableCell>
              <TableCell>{user.post_code}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(user)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(user.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default ManageUsers;