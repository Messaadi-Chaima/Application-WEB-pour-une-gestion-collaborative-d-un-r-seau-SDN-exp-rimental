import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HubIcon from '@mui/icons-material/Hub';
import TuneIcon from '@mui/icons-material/Tune';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import TerminalIcon from '@mui/icons-material/Terminal';
import axios from 'axios';
import { useNavigate  } from "react-router-dom";
const itemsStyle = {
  color: "white",
  backgroundColor: "#036c9e",

  "&:hover": {
    color: "#ADD8E6",
  },
};
const textStyle = {
  fontSize: "18px",
};

export const MainListItems = () => {
  const storedUsername = localStorage.getItem('username');
  const storedRole = localStorage.getItem('role');
  console.log(storedUsername);
  console.log(storedRole);

  return (
    <React.Fragment>
    
    <ListItemButton sx={itemsStyle}  component={Link} to="/Home" >
      <ListItemIcon>
        <DashboardIcon style={{ color: "#fff" }}/>
      </ListItemIcon>
      <ListItemText sx={textStyle} primary="Home" />
    </ListItemButton>
    {storedRole === "Experimentator" && (
      <React.Fragment>
        {console.log('storedRole', storedRole)}
        <ListItemButton sx={itemsStyle} component={Link} to="/MyNetwork">
          <ListItemIcon>
            <HubIcon style={{ color: "#fff" }}/>
          </ListItemIcon>
          <ListItemText sx={textStyle} primary="Topologie" />
        </ListItemButton>
        <ListItemButton sx={itemsStyle} component={Link} to="/List_of_saved_configurations">
          <ListItemIcon>
            <SaveIcon style={{ color: "#fff" }}/>
          </ListItemIcon>
          <ListItemText sx={textStyle}
            primary="Import"
          />
        </ListItemButton>
        <ListItemButton sx={itemsStyle} component={Link} to="/Control_experimental_elements">
          <ListItemIcon>
            <TuneIcon style={{ color: "#fff" }}/>
          </ListItemIcon>
          <ListItemText sx={textStyle}
            primary="Control of "
            secondary="experimental elements"
          />
        </ListItemButton>
        <ListItemButton sx={itemsStyle} component={Link} to="/Test">
        <ListItemIcon>
          <TerminalIcon style={{ color: "#fff" }}/>
        </ListItemIcon>
        <ListItemText sx={textStyle} primary="Web Terminals" />
      </ListItemButton>
      </React.Fragment>
    )}
    {storedRole === "Administrator" && (
      <ListItemButton sx={itemsStyle} component={Link} to="/Manage_Users">
        <ListItemIcon>
          <PersonIcon style={{ color: "#fff" }}/>
        </ListItemIcon>
        <ListItemText sx={textStyle} primary="Manage Users" />
      </ListItemButton>
    )}
  </React.Fragment>
  );
};

export const SecondaryListItems = ({handleOpen}) => {
  const storedUsername = localStorage.getItem('username');
  const storedRole = localStorage.getItem('role');
  console.log(storedUsername);
  console.log(storedRole);
  const navigate = useNavigate(); 
  
  const logout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/pythonlogin/logout');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      if (response.data.message === 'Logged out successfully!') {
        navigate('/');
      }
      console.log(response.data);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <React.Fragment>
      {storedRole === "Administrator" && (
      <ListItemButton sx={itemsStyle} onClick={() => handleOpen()}>
        <ListItemIcon>
          <AddIcon style={{ color: "#fff" }}/>
        </ListItemIcon>
        <ListItemText sx={textStyle} primary="New Account" />
      </ListItemButton>
      )}
      <ListItemButton sx={itemsStyle} onClick={logout}>
        <ListItemIcon>
          <LogoutIcon style={{ color: "#fff" }}/>
        </ListItemIcon>
        <ListItemText sx={textStyle} primary="Sign out" />
      </ListItemButton>
    </React.Fragment>
  );
};
