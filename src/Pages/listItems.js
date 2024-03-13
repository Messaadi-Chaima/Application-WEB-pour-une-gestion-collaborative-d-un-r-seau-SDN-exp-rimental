import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HubIcon from '@mui/icons-material/Hub';

export const MainListItems = () => (
  <React.Fragment>
    <ListItemButton component={Link} to="/Dashboard">
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItemButton>
    <ListItemButton component={Link} to="/Topology">
      <ListItemIcon>
        <HubIcon />
      </ListItemIcon>
      <ListItemText primary="Topologie" />
    </ListItemButton>
  </React.Fragment>
);

export const SecondaryListItems = () => (
  <React.Fragment>
    <ListItemButton component={Link} to="/">
      <ListItemIcon>
        <LoginIcon />
      </ListItemIcon>
      <ListItemText primary="Sign out" />
    </ListItemButton>
    
  </React.Fragment>
);
