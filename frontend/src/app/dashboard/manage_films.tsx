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
import { getFilms, createFilm, updateFilm, deleteFilm } from '../../services/api';

const ManageFilms = () => {
  const [films, setFilms] = useState([]);
  const [formValues, setFormValues] = useState({
    title: '',
    age_rating: '',
    duration: '',
    trailer_description: '',
    poster_image: null,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFilmId, setEditingFilmId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchFilms = async () => {
    const response = await getFilms();
    setFilms(response.data);
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormValues({
      ...formValues,
      poster_image: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateFilm(editingFilmId, formValues);
        setSnackbarMessage('Film updated successfully');
      } else {
        await createFilm(formValues);
        setSnackbarMessage('Film created successfully');
      }
      setFormValues({
        title: '',
        age_rating: '',
        duration: '',
        trailer_description: '',
        poster_image: null,
      });
      setIsEditMode(false);
      setEditingFilmId(null);
      fetchFilms();
    } catch (error) {
      console.error('Error creating/updating film:', error);
      setSnackbarMessage('Error creating/updating film');
    }
    setSnackbarOpen(true);
  };

  const handleEdit = (film) => {
    setFormValues({
      title: film.title,
      age_rating: film.age_rating,
      duration: film.duration,
      trailer_description: film.trailer_description,
      poster_image: null,
    });
    setIsEditMode(true);
    setEditingFilmId(film.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteFilm(id);
      setSnackbarMessage('Film deleted successfully');
      fetchFilms();
    } catch (error) {
      console.error('Error deleting film:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbarMessage(error.response.data.error);
      } else {
        setSnackbarMessage('Error deleting film');
      }
    }
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Films
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          name="title"
          value={formValues.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Age Rating"
          name="age_rating"
          value={formValues.age_rating}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Duration (in minutes)"
          name="duration"
          type="number"
          value={formValues.duration}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Trailer Description"
          name="trailer_description"
          value={formValues.trailer_description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          required
        />
        <Typography variant="subtitle1">
          Select Poster
        </Typography>
        <input
          accept="image/*"
          type="file"
          onChange={handleFileChange}
          style={{ margin: '20px 0' }}
        />

        <Button
          variant="contained"
          color="primary"
          type="submit"
          style={{ marginTop: '1rem' }}
        >
          {isEditMode ? 'Update Film' : 'Add Film'}
        </Button>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />

      <Typography variant="h4" gutterBottom style={{ marginTop: '2rem' }}>
        Existing Films
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Age Rating</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Trailer Description</TableCell>
            <TableCell>Poster</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {films.map((film) => (
            <TableRow key={film.id}>
              <TableCell>{film.title}</TableCell>
              <TableCell>{film.age_rating}</TableCell>
              <TableCell>{film.duration}</TableCell>
              <TableCell>{film.trailer_description}</TableCell>
              <TableCell>
                {film.poster_image && (
                  <img src={film.poster_image} alt={film.title} width="50" />
                )}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(film)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(film.id)}>
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

export default ManageFilms;
         
