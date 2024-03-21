import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HubIcon from '@mui/icons-material/Hub';
import TuneIcon from '@mui/icons-material/Tune';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';

export const MainListItems = () => (
  <React.Fragment>
    <ListItemButton component={Link} to="/Dashboard">
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItemButton>
    <ListItemButton component={Link} to="/MyNetwork">
      <ListItemIcon>
        <HubIcon />
      </ListItemIcon>
      <ListItemText primary="Topologie" />
    </ListItemButton>
    <ListItemButton component={Link} to="/Control_experimental_elements">
      <ListItemIcon>
        <TuneIcon />
      </ListItemIcon>
      <ListItemText
        primary="Control of "
        secondary="experimental elements"
      />
    </ListItemButton>
    <ListItemButton component={Link} to="/Manage_Users">
      <ListItemIcon>
        <PersonIcon />
      </ListItemIcon>
      <ListItemText primary="Manage Users" />
    </ListItemButton>
  </React.Fragment>
);

export const SecondaryListItems = ({ handleOpen }) => (
  <React.Fragment>
    <ListItemButton onClick={() => handleOpen()}>
      <ListItemIcon>
        <AddIcon />
      </ListItemIcon>
      <ListItemText primary="New Account" />
    </ListItemButton>
    <ListItemButton component={Link} to="/">
      <ListItemIcon>
        <LoginIcon />
      </ListItemIcon>
      <ListItemText primary="Sign out" />
    </ListItemButton>
    
  </React.Fragment>
);
