import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon  } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home';
import HubIcon from '@mui/icons-material/Hub';
import { makeStyles } from "@mui/styles";


const useStyles = makeStyles((theme) => ({
  appBar: {
    background: '#1A3867', // Change the background color here
  },
}));


export const Menu = () => {
    const classes = useStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    return (
      <div>
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div">Mininet Editor</Typography>
          </Toolbar>
        </AppBar>
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }}>
          <List>
            <ListItem button onClick={() => navigate('/Home')}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button onClick={() => navigate('/Topology')}>
             <ListItemIcon>
                <HubIcon />
              </ListItemIcon>
              <ListItemText primary="Topology" />
            </ListItem>
          </List>
          </Box>
        </Drawer>
      </div>
    );
  };
