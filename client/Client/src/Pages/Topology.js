import React, { useState } from "react";
import {Dashboard} from "./Dashboard";
import axios from 'axios';

import {
  Paper,
  Typography,
  Modal,
  Box,
  TextField,
  Fab,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import Draggable from "react-draggable";
import LabelIcon from "@mui/icons-material/Label";
import AddBoxIcon from "@mui/icons-material/AddBox";
import CancelIcon from '@mui/icons-material/Cancel';
import {ListItemIcon } from '@material-ui/core';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CreateIcon from '@mui/icons-material/Create';

// Images
import hostImage from "../Images/host.png";
import switchImage from "../Images/switch.png";
import controllerImage from "../Images/controller.png";
import portImage from "../Images/port.png";

const useStyles = makeStyles({
  root: {
    width: "100%",
    position: "fixed",
    bottom: 0,
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    background: "rgba(255, 255, 255, 0.8)",
    boxShadow: "0px -4px 8px rgba(0, 0, 0, 0.1)",
  },
  iconList: {
    display: "flex",
    gap: "2rem",
  },
  iconContainer: {
    position: "relative",
    cursor: "pointer",
    transition: "transform 0.2s ease-in-out",
    "&:hover": {
      transform: "scale(1.1)",
    },
    
  },
  icon: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    
  },
  labelText: {
    border: "1px solid black", 
    borderRadius: "30px",
    padding: "0.5rem", 
    display: "inline-block", 
    transition: "transform 0.3s ease-in-out", 
    "&:hover": {
      transform: "scale(1.05)", 
    },
  },
  Button: {
    position: "fixed",
    top: 90,
    right: 0,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    padding: "1rem",
    background: "rgba(255, 255, 255, 0.8)",
    boxShadow: "4px 0px 8px rgba(0, 0, 0, 0.1)",
  },

});

export const Topology = () => {
  const classes = useStyles();
  const [icons, setIcons] = useState([]);
  const [open, setOpen] = useState(false);
  const [labelText, setLabelText] = useState("");
  const [labelTexts, setLabelTexts] = useState([]);
  const [addedIconPositions, setAddedIconPositions] = useState([]);

  const handleAddIcon = (icon) => {
    setIcons([...icons, icon]);
    const centerX = window.innerWidth / 2;
    setAddedIconPositions([...addedIconPositions, { x: centerX, y: 100 }]);
  };

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleLabelChange = (e) => {
    setLabelText(e.target.value);
  };

  const handleLabelSubmit = () => {
    setOpen(false);
    setLabelTexts([...labelTexts, labelText]);
    setLabelText("");
  };





const createTopology = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/restapi/topologies/2', {});
    //setTopoId(response.data.id); // Mettez à jour l'ID de la topologie dans l'état
    console.log(response.data);
  } catch (error) {
    console.error('Error creating topology:', error);
  }
};

const startTopology = async () => {
  try {
    const response = await axios.post(`http://127.0.0.1:5000/restapi/topologies/2/start`, {});
    console.log(response.data);
  } catch (error) {
    console.error('Error starting topology:', error);
  }
};

const stopTopology = async () => {
  try {
    const response = await axios.post(`http://127.0.0.1:5000/restapi/topologies/2/stop`, {});
    console.log(response.data);
  } catch (error) {
    console.error('Error stopping topology:', error);
  }
};


  
  return (
    <div>
      <Dashboard />
      <div className={classes.Button}>
        <Tooltip title="create Topology">
        <Paper onClick={createTopology} sx={{ display: 'flex', alignItems: 'center', cursor: "pointer" }} >
          <CreateIcon  />
          <Typography>create Topology</Typography>
        </Paper>
      </Tooltip>

      <Tooltip title="Start Topology">
        <Paper onClick={startTopology} sx={{ display: 'flex', alignItems: 'center', cursor: "pointer" }}>
          <PlayArrowIcon  />
          <Typography>Start Topology</Typography>
        </Paper>
      </Tooltip>

      <Tooltip title="Stop Topology">
        <Paper onClick={stopTopology} sx={{ display: 'flex', alignItems: 'center', cursor: "pointer" }}>
          <StopIcon  />
          <Typography>Stop Topology</Typography>
        </Paper>
      </Tooltip>
      </div>
      
      <div className={classes.root}>
        <div className={classes.iconList}>
          
          <HostImageIcon onAdd={handleAddIcon}  />
          <SwitchImageIcon onAdd={handleAddIcon} />
          <ControllerImageIcon onAdd={handleAddIcon} />
          <PortImageIcon onAdd={handleAddIcon} />
          <HorizontalRuleImageIcon />

          <Tooltip title="Delete" >
            <Paper className={classes.iconContainer} elevation={3}>
              <DeleteIcon fontSize="large" className={classes.icon} />
              <Typography>Delete</Typography>
            </Paper>
          </Tooltip>

          <Tooltip title="Label" onClick={handleOpenModal}>
            <Paper className={classes.iconContainer} elevation={3}>
              <LabelIcon fontSize="large" className={classes.icon} />
              <Typography>Label</Typography>
            </Paper>
          </Tooltip>
        </div>
      </div>

      <Modal open={open} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <ListItemIcon>
           <LabelIcon sx={{ fontSize: 35 }} />
          </ListItemIcon>
            Enter Label Text
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="label"
            label="Label"
            type="text"
            fullWidth
            value={labelText}
            onChange={handleLabelChange}
          />
          <Fab
            variant="extended"
            onClick={handleLabelSubmit}
            style={{ marginTop: "1rem" }}
          >
            <AddBoxIcon />
            &nbsp;
            Add new label
          </Fab>

          <Fab
            variant="extended"
            onClick={handleCloseModal}
             style={{ marginTop: "1rem", marginLeft: "1rem" }} 
           >
            <CancelIcon />
            &nbsp;
            Cancel
          </Fab>

        </Box>
      </Modal>

      {labelTexts.map((text, index) => (
        <Draggable key={index}>
          <div
            style={{
              position: "fixed",
              top: 100, // Positionner les labels en haut
              left: addedIconPositions[index]?.x || 0,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Typography variant="button" className={classes.labelText}>{text}</Typography>
          </div>
        </Draggable>
      ))}

      {icons.map((icon, index) => (
        <Draggable key={index}>
          <div
            style={{
              position: "fixed",
              top: addedIconPositions[index]?.y || 0,
              left: addedIconPositions[index]?.x || 0,
              transform: "translate(-50%, -50%)",
            }}
          >
            <img src={icon} alt={`Icon ${index}`} className={classes.icon} />
          </div>
        </Draggable>
      ))}
    </div>
  );
};

const HorizontalRuleImageIcon = () => {
  const classes = useStyles();
  return (
    <Tooltip title="Link">
      <Paper className={classes.iconContainer} elevation={3} >
        <HorizontalRuleIcon  />
        <Typography>Link</Typography>
      </Paper>
    </Tooltip>
  );
};

const HostImageIcon = ({ onAdd }) => {
  const classes = useStyles();

  const createHost = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:5000/restapi/topologies/2/hosts`, {
        host_id: '1', 
        switch_id: '1', 
  
      });
      console.log(response.data);
      // Mettez à jour l'état avec les détails de l'hôte créé
      // setState(...);
    } catch (error) {
      console.error('Error creating host:', error);
    }
  };

  const handleIconClick = () => {
    onAdd(hostImage); 
    createHost(); 
  };
  
  return (
    <Tooltip title="Host" >
      <Paper className={classes.iconContainer} elevation={3}
       onClick={handleIconClick}
      >
        <img src={hostImage} alt="Host" className={classes.icon} />
        <Typography>Host</Typography>
      </Paper>
    </Tooltip>
  );
};

const SwitchImageIcon = ({ onAdd }) => {
  const classes = useStyles();
  const createSwitch = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/restapi/topologies/2/switches', {
        switch_id: '1', // Remplacez 'new_switch_id' par l'ID réel du commutateur
      });
      console.log(response.data);
      // Mettre à jour l'état ou effectuer d'autres actions si nécessaire
    } catch (error) {
      console.error('Error creating switch:', error);
    }
  };

  const handleIconClick = () => {
    onAdd(switchImage); 
    createSwitch(); 
  };

  return (
    <Tooltip title="Switch">
      <Paper className={classes.iconContainer} elevation={3}
       onClick={handleIconClick}>
        <img src={switchImage} alt="Switch" className={classes.icon} />
        <Typography>Switch</Typography>
      </Paper>
    </Tooltip>
  );
};

const ControllerImageIcon = ({ onAdd }) => {
  const classes = useStyles();
  return (
    <Tooltip title="Controller">
      <Paper className={classes.iconContainer} elevation={3} onClick={() => onAdd(controllerImage)}>
        <img src={controllerImage} alt="Controller" className={classes.icon} />
        <Typography>Controller</Typography>
      </Paper>
    </Tooltip>
  );
};

const PortImageIcon = ({ onAdd }) => {
  const classes = useStyles();
  return (
    <Tooltip title="Port">
      <Paper className={classes.iconContainer} elevation={3} onClick={() => onAdd(portImage)} >
        <img src={portImage} alt="Port" className={classes.icon} />
        <Typography>Port</Typography>
      </Paper>
    </Tooltip>
  );
};

export default Topology;