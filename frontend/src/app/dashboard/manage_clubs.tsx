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
import { getClubs, createClub, updateClub, deleteClub, getUsersByType } from '../../services/api';

const ManageClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [clubManagers, setClubManagers] = useState([]);
  const [formValues, setFormValues] = useState({
    name: '',
    club_manager: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClubId, setEditingClubId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchClubs = async () => {
    const response = await getClubs();
    setClubs(response.data);
  };

  const fetchClubManagers = async () => {
    const response = await getUsersByType('club_manager');
    setClubManagers(response.data);
  };

  useEffect(() => {
    fetchClubs();
    fetchClubManagers();
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
        await updateClub(editingClubId, formValues);
        setSnackbarMessage('Club updated successfully');
      } else {
        await createClub(formValues);
        setSnackbarMessage('Club created successfully');
      }
      setFormValues({
        name: '',
        club_manager: '',
      });
      setIsEditMode(false);
      setEditingClubId(null);
      fetchClubs();
    } catch (error) {
      console.error('Error creating/updating club:', error);
      setSnackbarMessage('Error creating/updating club');
    }
    setSnackbarOpen(true);
  };

  const handleEdit = (club) => {
    setFormValues({
      name: club.name,
      club_manager: club.club_manager,
    });
    setIsEditMode(true);
    setEditingClubId(club.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteClub(id);
      setSnackbarMessage('Club deleted successfully');
      fetchClubs();
    } catch (error) {
      console.error('Error deleting club:', error);
      setSnackbarMessage('Error deleting club');
    }
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getClubManagerUsername = (id) => {
    let username = "";
    clubManagers.forEach(manager => {if (manager.id === id) username = manager.username});
    return username;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Clubs
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Club Name"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          select
          label="Club Manager"
          name="club_manager"
          value={formValues.club_manager}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        >
          {clubManagers.map((manager) => (
            <MenuItem key={manager.id} value={manager.id}>
              {manager.username}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          style={{ marginTop: '1rem' }}
        >
          {isEditMode ? 'Update Club' : 'Add Club'}
        </Button>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />

      <Typography variant="h4" gutterBottom style={{ marginTop: '2rem' }}>
        Existing Clubs
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Club Manager</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clubs.map((club) => (
            <TableRow key={club.id}>
              <TableCell>{club.name}</TableCell>
              <TableCell>{getClubManagerUsername(club.club_manager)}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(club)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(club.id)}>
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

export default ManageClubs;
