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
  MenuItem
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { getScreens, createScreen, updateScreen, deleteScreen } from '../../services/api';

const ManageScreens = () => {
  const [screens, setScreens] = useState([]);
  const [formValues, setFormValues] = useState({
    number: '',
    is_social_distancing_on: false,
    seat_rows: '',
    seat_columns: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingScreenId, setEditingScreenId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchScreens = async () => {
    const response = await getScreens();
    setScreens(response.data);
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateScreen(editingScreenId, formValues);
        setSnackbarMessage('Screen updated successfully');
      } else {
        await createScreen(formValues);
        setSnackbarMessage('Screen created successfully');
      }
      setFormValues({
        number: '',
        is_social_distancing_on: false,
        seat_rows: '',
        seat_columns: ''
      });
      setIsEditMode(false);
      setEditingScreenId(null);
      fetchScreens();
    } catch (error) {
      console.error('Error creating/updating screen:', error);
      setSnackbarMessage('Error creating/updating screen');
    }
    setSnackbarOpen(true);
  };

  const handleEdit = (screen) => {
    setFormValues({
      number: screen.number,
      is_social_distancing_on: screen.is_social_distancing_on,
      seat_rows: screen.seat_rows,
      seat_columns: screen.seat_columns
    });
    setIsEditMode(true);
    setEditingScreenId(screen.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteScreen(id);
      setSnackbarMessage('Screen deleted successfully');
      fetchScreens();
    } catch (error) {
      console.error('Error deleting screen:', error);
      setSnackbarMessage('Error deleting screen');
    }
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Screens
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Number"
          name="number"
          value={formValues.number}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <Typography variant="subtitle1" style={{ marginTop: '1rem' }}>
          Social Distancing:
        </Typography>
        <TextField
          select
          name="is_social_distancing_on"
          value={formValues.is_social_distancing_on ? 'yes' : 'no'}
          onChange={(e) =>
            setFormValues({
              ...formValues,
              is_social_distancing_on: e.target.value === 'yes',
            })
          }
          fullWidth
          margin="normal"
        >
          <MenuItem value="yes">Yes</MenuItem>
          <MenuItem value="no">No</MenuItem>
        </TextField>
        <TextField
          label="Seat Rows"
          name="seat_rows"
          type="number"
          value={formValues.seat_rows}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Seat Columns"
          name="seat_columns"
          type="number"
          value={formValues.seat_columns}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          style={{ marginTop: '1rem' }}
        >
          {isEditMode ? 'Update Screen' : 'Add Screen'}
        </Button>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />

      <Typography variant="h4" gutterBottom style={{ marginTop: '2rem' }}>
        Existing Screens
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Number</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Social Distancing</TableCell>
            <TableCell>Seat Rows</TableCell>
            <TableCell>Seat Columns</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {screens.map((screen) => (
            <TableRow key={screen.id}>
              <TableCell>{screen.number}</TableCell>
              <TableCell>{screen.capacity}</TableCell>
              <TableCell>{screen.is_social_distancing_on ? 'Yes' : 'No'}</TableCell>
              <TableCell>{screen.seat_rows}</TableCell>
              <TableCell>{screen.seat_columns}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(screen)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(screen.id)}>
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

export default ManageScreens;