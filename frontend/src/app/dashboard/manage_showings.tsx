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
  Box
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { getShowings, createShowing, updateShowing, deleteShowing, getFilms, getScreens } from '../../services/api';

const ManageShowings = () => {
  const [showings, setShowings] = useState([]);
  const [films, setFilms] = useState([]);
  const [screens, setScreens] = useState([]);
  
  const [formValues, setFormValues] = useState({
    film: '',
    screen: '',
    show_time: '',
    ticket_price: '',
    discount: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingShowingId, setEditingShowingId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchShowings = async () => {
    const response = await getShowings();
    setShowings(response.data);
  };

  const fetchFilms = async () => {
    const response = await getFilms();
    setFilms(response.data);
  };

  const fetchScreens = async () => {
    const response = await getScreens();
    setScreens(response.data);
  };

  useEffect(() => {
    fetchShowings();
    fetchFilms();
    fetchScreens();
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
    
    if (!formValues.film || !formValues.screen) {
      setSnackbarMessage('Film and Screen are required.');
      setSnackbarOpen(true);
      return;
    }
  
    try {
      if (isEditMode) {
        await updateShowing(editingShowingId, formValues);
        setSnackbarMessage('Showing updated successfully');
      } else {
        await createShowing(formValues);
        setSnackbarMessage('Showing created successfully');
      }
      setFormValues({
        film: '',
        screen: '',
        show_time: '',
        ticket_price: '',
        discount: '',
      });
      setIsEditMode(false);
      setEditingShowingId(null);
      fetchShowings();
    } catch (error) {
      console.error('Error creating/updating showing:', error);
      setSnackbarMessage('Error creating/updating showing');
    }
    setSnackbarOpen(true);
  };

  const handleEdit = (showing) => {
    setFormValues({
      film: showing.film.id,
      screen: showing.screen.id,
      show_time: showing.show_time,
      ticket_price: showing.ticket_price,
      discount: showing.discount,
    });
    setIsEditMode(true);
    setEditingShowingId(showing.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteShowing(id);
      setSnackbarMessage('Showing deleted successfully');
      fetchShowings();
    } catch (error) {
      console.error('Error deleting showing:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbarMessage(error.response.data.error);
      } else {
        setSnackbarMessage('Error deleting showing');
      }
    }
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getFilmTitle = (id) => {
    const film = films.find(film => film.id === id);
    return film ? film.title : 'Unknown';
  };

  const getScreenNumber = (id) => {
    const screen = screens.find(screen => screen.id === id);
    return screen ? screen.number : 'Unknown';
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Showings
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Film"
          name="film"
          select
          SelectProps={{ native: true }}
          value={formValues.film}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        >
          <option value=""></option>
          {films.map((film) => (
            <option key={film.id} value={film.id}>
              {film.title}
            </option>
          ))}
        </TextField>
        <TextField
          label="Screen"
          name="screen"
          select
          SelectProps={{ native: true }}
          value={formValues.screen}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        >
          <option value=""></option>
          {screens.map((screen) => (
            <option key={screen.id} value={screen.id}>
              Screen {screen.number}
            </option>
          ))}
        </TextField>
        <TextField
          label="Show Time"
          name="show_time"
          type="datetime-local"
          value={formValues.show_time}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Ticket Price"
          name="ticket_price"
          type="number"
          value={formValues.ticket_price}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Discount"
          name="discount"
          type="number"
          value={formValues.discount}
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
          {isEditMode ? 'Update Showing' : 'Add Showing'}
        </Button>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />

      <Typography variant="h4" gutterBottom style={{ marginTop: '2rem' }}>
        Existing Showings
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Film</TableCell>
            <TableCell>Screen</TableCell>
            <TableCell>Show Time</TableCell>
            <TableCell>Ticket Price</TableCell>
            <TableCell>Discount</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {showings.map((showing) => (
            <TableRow key={showing.id}>
              <TableCell>{getFilmTitle(showing.film.id)}</TableCell>
              <TableCell>Screen {getScreenNumber(showing.screen.id)}</TableCell>
              <TableCell>{new Date(showing.show_time).toLocaleString()}</TableCell>
              <TableCell>{showing.ticket_price}</TableCell>
              <TableCell>{showing.discount}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(showing)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(showing.id)}>
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

export default ManageShowings;
