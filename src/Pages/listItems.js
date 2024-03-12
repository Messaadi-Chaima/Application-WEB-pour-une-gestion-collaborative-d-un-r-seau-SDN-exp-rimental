import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
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
    <ListItemButton>
      <ListItemIcon>
        <LoginIcon />
      </ListItemIcon>
      <ListItemText primary="Sign in" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Sign Up" />
    </ListItemButton>
  </React.Fragment>
);
