import { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Paper, Grid, MenuItem, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { getShowingsByDate, bookTicket, getSeatAvailability, getShowingsForNextTwoWeeks } from '../../services/api';
import useSessionTimeout from '../../hooks/useSessionTimeout';

const TICKET_TYPE_CHOICES = [
  { value: 'student', label: 'Student' },
  { value: 'child', label: 'Child' },
  { value: 'adult', label: 'Adult' },
];

export default function Book() {
  const [date, setDate] = useState('');
  const [showings, setShowings] = useState([]);
  const [selectedShowing, setSelectedShowing] = useState(null);
  const [ticketType, setTicketType] = useState('adult');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
  });
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [twoWeeksShowings, setTwoWeeksShowings] = useState([]);

  useEffect(() => {
    if (date) {
      async function fetchShowings() {
        const data = await getShowingsByDate(date);
        setShowings(data);
      }

      fetchShowings();
    }
    const user_type = localStorage.getItem('user_type');
    if (user_type === 'student') {
      setTicketType('student');
    } else if (user_type === 'club_manager') {
      setTicketType('student');
    }
  }, [date]);

  useEffect(() => {
    async function fetchTwoWeeksShowings() {
      const data = await getShowingsForNextTwoWeeks();
      setTwoWeeksShowings(data);
    }

    fetchTwoWeeksShowings();
  }, []);

  useEffect(() => {
    if (selectedShowing) {
      fetchSeatAvailability();
    }
  }, [selectedShowing]);

  async function fetchSeatAvailability() {
    const seats = await getSeatAvailability(selectedShowing.id);
    setAvailableSeats(seats);
    setSelectedSeats([]);
  }

  const handleBook = () => {
    const user_type = localStorage.getItem('user_type');
    if (selectedShowing && selectedSeats.length > 0) {
      const totalCapacity = selectedShowing.screen.capacity;
      const remainingSeats = totalCapacity - selectedShowing.tickets_sold;

      if (selectedSeats.length > remainingSeats) {
        setSnackbarMessage('Booking declined: insufficient seats');
        setSnackbarOpen(true);
      } else {
        if (['student', 'club_manager'].includes(user_type)) {
          handleConfirmBooking();
        } else {
          setDialogOpen(true);
        }
      }
    }
  };

  const getBookButtonDisabled = () => {
    const user_type = localStorage.getItem('user_type');
    if (selectedSeats.length === 0) return true;
    if (user_type === 'club_manager') {
      if (selectedSeats.length < 10) return true; 
    }
    return false;
  }

  const handleConfirmBooking = async () => {
    const user_type = localStorage.getItem('user_type');
    if (selectedShowing && selectedSeats.length > 0) {
      try {
        const seatData = selectedSeats.map((seat) => ({ row: seat.row, column: seat.column }));
        var bookingData = {
          showing: selectedShowing.id,
          ticket_type: ticketType,
          seats: seatData,
        };

        if (!['student', 'club_manager'].includes(user_type)) {
          bookingData['cardholder_name'] = paymentInfo.cardholderName;
          bookingData['card_number'] = paymentInfo.cardNumber;
          bookingData['expiry_date'] = paymentInfo.expiryDate;
          bookingData['security_code'] = paymentInfo.securityCode;
        }

        const response = await bookTicket(bookingData);
        if ("error" in response) setSnackbarMessage(response.error);
        else {
          setSnackbarMessage('Booking successful');
          fetchSeatAvailability();
        }
      } catch (error) {
        setSnackbarMessage('Booking failed: ' + error.message);
      } finally {
        setSnackbarOpen(true);
        setDialogOpen(false);
      }
    }
  };

  const handlePaymentInfoChange = (field, value) => {
    setPaymentInfo({
      ...paymentInfo,
      [field]: value,
    });
  };

  const getTicketTypeChoices = () => {
    const user_type = localStorage.getItem('user_type');
    if (['student', 'club_manager'].includes(user_type)) {
      return [TICKET_TYPE_CHOICES[0]];
    } else return TICKET_TYPE_CHOICES;
  };

  const handleSeatClick = (row, column) => {
    const seatIndex = selectedSeats.findIndex(seat => seat.row === row && seat.column === column);
    if (seatIndex > -1) {
      const newSelectedSeats = [...selectedSeats];
      newSelectedSeats.splice(seatIndex, 1);
      setSelectedSeats(newSelectedSeats);
    } else {
      setSelectedSeats([...selectedSeats, { row, column }]);
    }
  };

  const getPrice = (showing) => {
    if (showing == null) return 0.0;
    const price = parseFloat(showing.ticket_price);
    const discount = parseFloat(showing.discount);
    const total = (price - discount);
    return (total).toFixed(2);
  };

  const getTotalPrice = () => {
    if (selectedSeats.length === 0) return 0.0;
    const total = getPrice(selectedShowing) * selectedSeats.length;
    return (total).toFixed(2);
  };

  return (
    <Container sx={{ mb: 10, mt: 3 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Book Tickets
      </Typography>

      <TextField
        label="Select Date"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => setDate(e.target.value)}
      />

<Grid container spacing={3}>
        {showings.map((showing) => (
          <Grid item xs={12} sm={6} md={4} key={showing.id}>
            <Paper
              elevation={3}
              sx={{ padding: 2, cursor: 'pointer' }}
              onClick={() => setSelectedShowing(showing)}
            >
              <Typography variant="h6">{showing.film.title}</Typography>
              <Typography variant="body2">Rating: {showing.film.age_rating}</Typography>
              <Typography variant="body2">Duration: {showing.film.duration} mins</Typography>
              <Typography variant="body2">Show Time: {new Date(showing.show_time).toUTCString()}</Typography>
              <Typography variant="body2">Price: $ {getPrice(showing)}</Typography>
              {showing.film.poster_image && (
                <img src={showing.film.poster_image} alt="Poster" style={{ width: '100%', marginTop: '10px' }} />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {twoWeeksShowings.length > 0 && (
        <Box mt={4}>
          <Typography variant="h4" align="center" gutterBottom>
            Next Two Weeks Showings
          </Typography>
          <Grid container spacing={3}>
            {twoWeeksShowings.map((showing) => (
              <Grid item xs={12} sm={6} md={4} key={showing.id}>
                <Paper
                  elevation={3}
                  sx={{ padding: 2, cursor: 'pointer' }}
                  onClick={() => setSelectedShowing(showing)}
                >
                  <Typography variant="h6">{showing.film.title}</Typography>
                  <Typography variant="body2">Rating: {showing.film.age_rating}</Typography>
                  <Typography variant="body2">Duration: {showing.film.duration} mins</Typography>
                  <Typography variant="body2">
                    Show Time: {new Date(showing.show_time).toUTCString()}
                  </Typography>
                  <Typography variant="body2">Price: $ {getPrice(showing)}</Typography>
                  {showing.film.poster_image && (
                    <img src={showing.film.poster_image} alt="Poster" style={{ width: '100%', marginTop: '10px' }} />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

    {selectedShowing && (
        <Paper elevation={3} sx={{ marginTop: 3, padding: 2 }}>
          <Typography variant="h5" gutterBottom>
            Selected Showing Details
          </Typography>
          <Typography variant="body1">Title: {selectedShowing.film.title}</Typography>
          <Typography variant="body1">Rating: {selectedShowing.film.age_rating}</Typography>
          <Typography variant="body1">Duration: {selectedShowing.film.duration} mins</Typography>
          <Typography variant="body1">Description: {selectedShowing.film.trailer_description}</Typography>
          <Typography variant="body1">
            Show Time: {new Date(selectedShowing.show_time).toUTCString()}
          </Typography>
          <Typography variant="body1">Price: $ {getPrice(selectedShowing)}</Typography>
          {selectedShowing.film.poster_image && (
            <img src={selectedShowing.film.poster_image} alt="Poster" style={{ width: '50%', marginTop: '10px' }} />
          )}
          <Typography variant="body1">Total Price: $ {getTotalPrice()}</Typography>

          <Typography variant="h6" gutterBottom>
            Select Seats
          </Typography>
          <Grid container spacing={1}>
            {availableSeats.map((seat) => (
              <Grid item sm={2} lg={1} key={`${seat.row}-${seat.column}`}>
                <Button
                  variant="outlined"
                  color={seat.status === 'unavailable' ? 'secondary' : 'primary'}
                  disabled={seat.status !== 'available' && !selectedSeats.some((s) => s.row === seat.row && s.column === seat.column)}
                  onClick={() => handleSeatClick(seat.row, seat.column)}
                  sx={{
                    minWidth: '40px',
                    backgroundColor: selectedSeats.some((s) => s.row === seat.row && s.column === seat.column) ? 'green' : 'inherit',
                  }}
                >
                  {`${seat.row}-${seat.column}`}
                </Button>
              </Grid>
            ))}
          </Grid>

          <TextField
            label="Ticket Type"
            select
            fullWidth
            margin="normal"
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value)}
          >
            {getTicketTypeChoices().map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleBook}
            disabled={getBookButtonDisabled()}
          >
            Book Tickets
          </Button>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Enter Payment Information</DialogTitle>
        <DialogContent>
          <TextField
            label="Cardholder Name"
            fullWidth
            margin="normal"
            value={paymentInfo.cardholderName}
            onChange={(e) => handlePaymentInfoChange('cardholderName', e.target.value)}
          />
          <TextField
            label="Card Number"
            fullWidth
            margin="normal"
            value={paymentInfo.cardNumber}
            onChange={(e) => handlePaymentInfoChange('cardNumber', e.target.value)}
          />
          <TextField
            label="Expiry Date"
            fullWidth
            margin="normal"
            value={paymentInfo.expiryDate}
            onChange={(e) => handlePaymentInfoChange('expiryDate', e.target.value)}
          />
          <TextField
            label="Security Code"
            fullWidth
            margin="normal"
            value={paymentInfo.securityCode}
            onChange={(e) => handlePaymentInfoChange('securityCode', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmBooking} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}