'use client';
import { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, CssBaseline, Box, AppBar, Toolbar, Divider, IconButton, ListItemIcon, Paper } from '@mui/material';
import BookOnline from '@mui/icons-material/BookOnline';
import Book from '../book/book';
import { getUserExtendedName } from '../utils';
import ManageAccounts from './manage_accounts';
import Account from './account';
import AccountStatements from './account_statements';
import Reports from './reports';
import ManageUsers from './manage_users';
import ManageClubs from './manage_clubs';
import ManageFilms from './manage_films';
import ManageScreens from './manage_screens';
import ManageShowings from './manage_showings';
import ManageBookings from './manage_bookings';
import MyTickets from './myTickets';
import Appbar from '../appbar';

const drawerWidth = 240;

export default function Dashboard() {
  const [selectedView, setSelectedView] = useState("Welcome");
  const [user_type, set_user_type] = useState('');

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    console.log("refreshToken", refreshToken);
    console.log('user_type', localStorage.getItem('user_type'));
    set_user_type(localStorage.getItem('user_type'));
  }, []);

  const menuEntryWelcome = { text: "Welcome", view: <Welcome user_type={user_type} /> };
  const menuItemsStudent = [
    menuEntryWelcome,
    { text: "Book Tickets", view: <Book /> },
    { text: "My Tickets", view: <MyTickets /> },
    { text: "Account", view: <Account /> },
  ];

  const getMenuItems = () => {
    switch (user_type) {
      case "student": return menuItemsStudent;
      case "club_manager": return menuItemsStudent;
      case "account_manager":
        return [
          menuEntryWelcome,
          { text: "Manage Accounts", view: <ManageAccounts /> },
          { text: "Account Statements", view: <AccountStatements /> },
          { text: "Reports", view: <Reports /> },
        ];
      case "cinema_manager":
        return [
          menuEntryWelcome,
          { text: "Manage Users", view: <ManageUsers /> },
          { text: "Manage Clubs", view: <ManageClubs /> },
          { text: "Manage Films", view: <ManageFilms /> },
          { text: "Manage Screens", view: <ManageScreens /> },
          { text: "Manage Showings", view: <ManageShowings /> },
          { text: "Manage Bookings", view: <ManageBookings /> },
        ];
      default: return [menuEntryWelcome];
    }
  }

  const renderSelectedView = () => {
    const currentItem = getMenuItems().find(item => item.text === selectedView);
    return currentItem.view;
  };

  return (
    <Box sx={{ display: 'flex', mb:3}}>
      <CssBaseline />
      <Appbar title="Dashboard" />

      <Box
        component={Paper}
        elevation={3}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiBox-root`]: { boxSizing: 'border-box' },
        }}
        aria-label="mailbox folders"
      >
        <Toolbar />
        <Divider />
        <List>
          {getMenuItems().map((item, index) => (
            <ListItem button key={item.text} selected={(item.text === selectedView)}
              onClick={() => setSelectedView(item.text)}>
              {/* <ListItemIcon>{ <BookOnline /> }</ListItemIcon> */}
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3 }}
      >
        <Toolbar />
        {renderSelectedView()}
      </Box>
    </Box>
  );
}

function Welcome({user_type}) {
  return (
    <Container>
      <Typography variant="h3" align="center" gutterBottom>
        Welcome to the Dashboard
      </Typography>
      <Paper sx={{p:5}}>
        <Typography variant="body1" align="center" component="div">
          You're logged in as a {getUserExtendedName(user_type)}.
          Find the available operations from the menu on the left.
        </Typography>
      </Paper>
      </Container>
    );
}