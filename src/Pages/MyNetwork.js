import React, { useState, useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";
import "./MyNetwork.css";

import hostIcon from "../Images/host.png";
import switchIcon from "../Images/switch.png";
import controllerIcon from "../Images/controller.png";
import portIcon from "../Images/port.png";
import AddEdge from "../Images/add_edge.png";
import EditEdge from "../Images/edit_edge.png";
import Delete from "../Images/Delete.png";
import AddLabel from "../Images/add_label.png";

import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import {
  Typography,
  Modal,
  Box,
  TextField,
  Grid,
} from "@mui/material";
import Button from '@mui/material/Button';
import {ListItemIcon } from '@material-ui/core';
import LaptopIcon from '@mui/icons-material/Laptop';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FlashlightOnIcon from '@mui/icons-material/FlashlightOn';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Tooltip from '@mui/material/Tooltip'; 

import { Dashboard } from "./Dashboard";

import {addSave} from '../Pages/Redux/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid'; 

export const MyNetwork = () => {
  const [network, setNetwork] = useState(null);
  const visJsRef = useRef(null);
  const dataRef = useRef({
    nodes: new DataSet([]),
    edges: new DataSet([]),
  });

  const [selectedNodeType, setSelectedNodeType] = useState(null);
  const [editNodeId, setEditNodeId] = useState(null);
  const [editNodeLabel, setEditNodeLabel] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogcontroller, setOpenDialogcontroller] = useState(false);
  const [openDialogEdge, setOpenDialogopenDialogEdge] = useState(false);
  const [openDialogPort, setOpenDialogopenDialogPort] = useState(false);
  const [openDialogSave, setOpenDialogopenDialogSave] = useState(false);
  const [openDialogSwitch, setOpenDialogopenDialogSwitch] = useState(false);

  const [editHost, setEditHost] = useState({
    Hostname: '',
    defaultRoute: '',
    AmountCPU: '',
    host: '',
    Cores: '',
    StartCommand: '',
    StopCommand: '',
  });

  const [editController, setEditController] = useState({
    Controllername: '',
    ControllerPort: '',
    ControllerType: '',
    Protocol: '',
    IPAddress: '',
  });

  const [editLink, setEditLink] = useState({
    Linkname: '',
    Bandwidth: '',
    Delay: '',
    Loss: '',
  });

  const [editPort, setEditPort] = useState({
    Portname: '',
    IP_Address: '',
  });

  const [editSwitch, setEditSwitch] = useState({
    Hostname: '',
    DPID: '',
    SwitchType: '',
    IPAddressSwitch: '',
    DPCTLPort: '',
    Protocol: '',
    Start_Command: '',
    Stop_Command: '',
  });

  const onAddEdge = (data, callback) => {
    console.log("Adding edge:", data);
  
    const newData = {
     ...data,
      label: editLink.Linkname, 
    };
  
    dataRef.current.edges.add(newData);
  
    callback(newData);
  };

  const onDeleteSelected = () => {
    const selectedNodes = network.getSelectedNodes();
    const selectedEdges = network.getSelectedEdges();
    dataRef.current.nodes.remove(selectedNodes);
    dataRef.current.edges.remove(selectedEdges);
    network.setData(dataRef.current);
  };

  const onEditNode = (data, callback) => {
    console.log("Editing node:", data);
    dataRef.current.nodes.update(data);
    callback(data);
  };

  const options = {
    physics: {
      enabled: false,
    },
    manipulation: {
      enabled: true,
      addEdge: onAddEdge,
      editNode: onEditNode,
      deleteNode: false,
    },
    nodes: {
      shape: "image",
      chosen: true,
    },
    groups: {
      host: {
        shape: "image",
        image: hostIcon,
      },
      switch: {
        shape: "image",
        image: switchIcon,
      },
      controller: {
        shape: "image",
        image: controllerIcon,
      },
      port: {
        shape: "image",
        image: portIcon,
        size: 10,
      },
    },
    edges: {
      smooth: false,
      font: {
        align: "top", // Pour aligner le texte au-dessus des arêtes
      },
      edgeLabel: function (edge) {
        return edge.label;
      },
    },
    interaction: { hover: true },
  };

  const onNetworkClick = (event) => {
    if (selectedNodeType && network) {
      const { offsetX, offsetY } = event.nativeEvent;
      const position = network.DOMtoCanvas({ x: offsetX, y: offsetY });
      const { x, y } = position;
      addNode(x, y, selectedNodeType);
      setSelectedNodeType(null);
    }
  };

  const getFirstSwitchId = () => {
    const nodes = dataRef.current.nodes.get(); // Obtenez tous les nœuds actuels
    for (const node of nodes) {
      if (node.group === 'switch') {
        return node.id; // Retournez l'ID du premier switch trouvé
      }
    }
    return null; // Retournez null s'il n'y a pas de switch dans le réseau
  };
  

  const addNode = (x, y, group) => {
    if (group !== 'host' && group !== 'switch' && group !== 'port') {
      const newId = generateUniqueId();
      const newNode = {
        id: newId,
        label: `${group} ${newId}`,
        group: group,
        x: x,
        y: y,
      };
      dataRef.current.nodes.add(newNode);
      if (network) {
        network.setData(dataRef.current);
      }
      console.log(dataRef.current.nodes);
    } else if(group == 'host') {
      const newId = generateUniqueId();
      const newNode = {
        id: newId,
        label: `${group} ${newId}`,
        group: group,
        x: x,
        y: y,
      };
  
      // Add a new host node
      dataRef.current.nodes.add(newNode);
  
      // Add a new port node connected to the host node
      const newPort1Id = generateUniqueId();
      const newPort1 = {
        id: newPort1Id,
        label: `eth0`,
        group: "port",
        x: x - 20,
        y: y + 90,
      };
      dataRef.current.nodes.add(newPort1);
  
      const newPort2Id = generateUniqueId();
      const newPort2 = {
        id: newPort2Id,
        label: `eth1`,
        group: "port",
        x: x + 30,
        y: y + 90,
      };
      dataRef.current.nodes.add(newPort2);
  
      dataRef.current.edges.add({ from: newId, to: newPort1Id });
      dataRef.current.edges.add({ from: newId, to: newPort2Id });
      
      setEditNodeId(newId);
      setEditNodeLabel(newNode.label);
      setOpenDialog(true)  ;

      if (network) {
        network.setData(dataRef.current);
      }
      console.log(dataRef.current.nodes);
    } else if(group == 'switch'){
        const newId = generateUniqueId();
        const newNode = {
          id: newId,
          label: `${group} ${newId}`,
          group: group,
          x: x,
          y: y,
        };
        dataRef.current.nodes.add(newNode);
        // Add 6 new port nodes connected to the switch node
        for (let i = 0; i < 6; i++) {
          const newPortId = generateUniqueId();
          const newPort = {
            id: newPortId,
            label: `eth${i}`,
            group: "port",
            x: x - 50 + i * 30,
            y: y + 90,
          };
          dataRef.current.nodes.add(newPort);

          dataRef.current.edges.add({ from: newId, to: newPortId });
        }
        setEditNodeId(newId);
        setEditNodeLabel(newNode.label);
        setOpenDialogopenDialogSwitch(true)  ;

        if (network) {
          network.setData(dataRef.current);
        }
        console.log(dataRef.current.nodes);
        } else if (group === 'port') {
          const newId = generateUniqueId();
    const newNode = {
      id: newId,
      label: `${group} ${newId}`,
      group: group,
      x: x,
      y: y,
    };
    dataRef.current.nodes.add(newNode);

    const firstSwitchId = getFirstSwitchId(); // Obtenez l'ID du premier switch créé
    if (firstSwitchId) {
      const newEdge = {
        from: newId,
        to: firstSwitchId,
      };
      dataRef.current.edges.add(newEdge);
    }

    if (network) {
      network.setData(dataRef.current);
    }
    console.log(dataRef.current.nodes);
  }
  };

  const generateUniqueId = () => {
    let newId;
    do {
      newId = Math.floor(Math.random() * 10000000) + 1;
    } while (dataRef.current.nodes.get(newId));
    return newId;
  };

  useEffect(() => {
    if (visJsRef.current && !network) {
      setNetwork(new Network(visJsRef.current, dataRef.current, options));
    }
  }, [visJsRef, network, options]);

  const addEdge = () => {
    network.addEdgeMode();
  };

  const editEdge = () => {
    network.editEdgeMode();
  };

  const deleteSelected = () => {
    onDeleteSelected();
  };

  const handleEditNode = () => {
    onEditNode({ id: editNodeId, label: editNodeLabel }, () => {});
    setOpenDialog(false);
    console.log(editHost);
    console.log('host',editNodeLabel);
  };

  const handleEditHost = () => {
    onEditNode({ id: editNodeId, label: editHost.Hostname }, () => {});
    setOpenDialog(false);
    console.log(editHost);
    console.log('host',editNodeLabel);
  };

  const handleEditController = () => {
    onEditNode({ id: editNodeId, label: editController.Controllername }, () => {});
    setOpenDialogcontroller(false);
    console.log(editController);
  };

  const handleEditLink = () => {
    console.log("Link details saved:", editLink);
  
    const selectedEdges = network.getSelectedEdges();
  
    if (selectedEdges.length > 0) {
      const selectedEdge = dataRef.current.edges.get(selectedEdges[0]);
      selectedEdge.label = editLink.Linkname;
      dataRef.current.edges.update(selectedEdge);
    }
  
    handleCloseDialogEdge();
  };

  const handleEditPort = () => {
    onEditNode({ id: editNodeId, label: editPort.Portname }, () => {});
    setOpenDialogopenDialogPort(false);
    console.log(editPort);
  };

  const handleEditSwitch = () => {
    onEditNode({ id: editNodeId, label: editSwitch.Hostname }, () => {});
    setOpenDialogopenDialogSwitch(false);
    console.log(editSwitch);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseDialogcontroller = () => {
    setOpenDialogcontroller(false);
  };
  const handleEditNodeEdge = () => {
    onEditNode({ id: editNodeId, label: editNodeLabel }, () => {});
    setOpenDialogopenDialogEdge(false);
  };

  const handleCloseDialogEdge = () => {
    setOpenDialogopenDialogEdge(false);
  };
  const handleEditNodePort = () => {
    onEditNode({ id: editNodeId, label: editNodeLabel }, () => {});
    setOpenDialogopenDialogPort(false);
  };

  const handleCloseDialogPort = () => {
    setOpenDialogopenDialogPort(false);
  };
  const handleSaveClick= () => {
    setOpenDialogopenDialogSave(true);
  };

  const handleCloseDialogSave = () => {
    setOpenDialogopenDialogSave(false);
  };

  const handleCloseDialogSwitch = () => {
    setOpenDialogopenDialogSwitch(false);
  };

  useEffect(() => {
    const handleDoubleClick = (params) => {
      const { nodes, edges } = params;
  
      setOpenDialog(false);
      setOpenDialogcontroller(false);
      setOpenDialogopenDialogEdge(false);
      setOpenDialogopenDialogPort(false);
      setOpenDialogopenDialogSwitch(false);
  
      if (nodes.length > 0) {
        const nodeId = nodes[0];
        const node = dataRef.current.nodes.get(nodeId);
        
        if (node) {
          if (node.group === 'host') { 
            setEditNodeId(nodeId);
            setEditNodeLabel(node.label);
            setOpenDialog(true);
          } else if (node.group === 'controller') { 
            setEditNodeId(nodeId);
            setEditNodeLabel(node.label);
            setOpenDialogcontroller(true);
          } else if (node.group === 'port') { 
            setEditNodeId(nodeId);
            setEditNodeLabel(node.label);
            setOpenDialogopenDialogPort(true);
          }
          else if (node.group === 'switch') { 
            setEditNodeId(nodeId);
            setEditNodeLabel(node.label);
            setOpenDialogopenDialogSwitch(true);
          }
        }
      }
      
      if (edges.length > 0 && nodes.length === 0) {
        setOpenDialogopenDialogEdge(true);
      }
    };
  
    if (network) {
      network.on("doubleClick", handleDoubleClick);
    }
  
    return () => {
      if (network) {
        network.off("doubleClick", handleDoubleClick);
      }
    };
  }, [network]);

 
  
  

  const actions = [
    { icon: <img src={hostIcon} alt="Host" />, name: 'Add Host', onClick: () => setSelectedNodeType('host') },
    { icon: <img src={switchIcon} alt="Switch" />, name: 'Add Switch', onClick: () => setSelectedNodeType('switch') },
    { icon: <img src={controllerIcon} alt="Controller" />, name: 'Add Controller', onClick: () => setSelectedNodeType('controller') },
    { icon: <img src={portIcon} alt="Port" />, name: 'Add Port', onClick: () => setSelectedNodeType('port') },
    { icon: <img src={AddEdge} alt="AddEdge" className="icon" />, name: 'Add Edge', onClick: addEdge },
    { icon: <img src={EditEdge} alt="EditEdge" className="icon" />, name: 'Edit Edge', onClick: editEdge },
    { icon: <img src={Delete} alt="Delete" className="icon" />, name: 'Delete Selected', onClick: deleteSelected },
    { icon: <img src={AddLabel} alt="AddLabel" className="icon" />, name: 'Add Label' },
  ];

  const dispatch = useDispatch();
  const savedItems = useSelector((state) => state.users);
  const [values, setValues] = useState({
    name: '',
  });
  const handleSave = () => {
    setValues({ name: ''});
    dispatch(addSave({
      id: uuidv4(),
      name: values.name,
    }));
    console.log(values.name);
    console.log(savedItems); 

    setOpenDialogopenDialogSave(false);
  }

  return (
    <div>
      <div
        id="mynetwork"
        ref={visJsRef}
        onClick={onNetworkClick}
      ></div>

<Modal open={openDialog} onClose={handleCloseDialog}>
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
              <LaptopIcon sx={{ fontSize: 35 }} />
            </ListItemIcon>
            Host
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="host"
                label="Host name"
                type="text"
                fullWidth
                variant="standard"
                value={editHost.Hostname}
                onChange={(e) =>
                  setEditHost({ ...editHost, Hostname: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
            <TextField
                autoFocus
                margin="dense"
                id="DefaultRoute"
                label="Default Route"
                type="text"
                fullWidth
                variant="standard"
                value={editHost.defaultRoute}
                onChange={(e) =>
                  setEditHost({ ...editHost, defaultRoute: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}> 
           <Grid container spacing={3} alignItems="center">
            <Grid item xs={6}>
            <TextField
                autoFocus
                margin="dense"
                id="AmountCPU"
                label="Amount CPU"
                type="text"
                variant="standard"
                value={editHost.AmountCPU}
                onChange={(e) =>
                  setEditHost({ ...editHost, AmountCPU: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
            <FormControl fullWidth variant="standard">
            <InputLabel >host</InputLabel>
            <Select
             label="host"
             value={editHost.host}
                onChange={(e) =>
                  setEditHost({ ...editHost, host: e.target.value })
                }
             >
            <MenuItem value={'CFS'}>CFS</MenuItem>
            <MenuItem value={'RTS'}>RTS</MenuItem>
            </Select>
            </FormControl>
            </Grid>
            </Grid>
            </Grid>
            <Grid item xs={12}>
            <TextField
                autoFocus
                margin="dense"
                id="Cores"
                label="Cores"
                type="text"
                fullWidth
                variant="standard"
                value={editHost.Cores}
                onChange={(e) =>
                  setEditHost({ ...editHost, Cores: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
            <TextField
                autoFocus
                margin="dense"
                id="StartCommand"
                label="Start Command"
                type="text"
                fullWidth
                variant="standard"
                multiline
                rows={2}
                value={editHost.StartCommand}
                onChange={(e) =>
                  setEditHost({ ...editHost, StartCommand: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
            <TextField
                autoFocus
                margin="dense"
                id="StopCommand"
                label="Stop Command"
                type="text"
                fullWidth
                variant="standard"
                multiline
                rows={2}
                value={editHost.StopCommand}
                onChange={(e) =>
                  setEditHost({ ...editHost, StopCommand: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <Button onClick={handleCloseDialog} fullWidth>Cancel</Button>
            </Grid>
            <Grid item xs={6}>
              <Button onClick={handleEditHost} fullWidth>Save</Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      <Modal open={openDialogcontroller} onClose={handleCloseDialogcontroller}>
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
          <img src={controllerIcon} alt="Controller" style={{ width: 35, marginRight: 8 }} />
          controller Details
         </Typography>
         <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="controller"
                label="controller name"
                type="text"
                fullWidth
                variant="standard"
                value={editController.Controllername}
                onChange={(e) =>
                  setEditController({ ...editController, Controllername: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
            <TextField
                autoFocus
                margin="dense"
                id="controllerPort"
                label="controller Port"
                type="text"
                variant="standard"
                fullWidth
               
                value={editController.ControllerPort}
                onChange={(e) =>
                  setEditController({ ...editController, ControllerPort: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
            <FormControl fullWidth variant="standard">
            <InputLabel >controller Type</InputLabel>
            <Select
             label="controller Type"
            
             value={editController.ControllerType}
                onChange={(e) =>
                  setEditController({ ...editController, ControllerType: e.target.value })
                }
             >
            <MenuItem value={'Remote Controller'}>Remote Controller</MenuItem>
            <MenuItem value={'In-Band Controller'}>In-Band Controller</MenuItem>
            <MenuItem value={'OpenFlow Reference'}>OpenFlow Reference</MenuItem>
            <MenuItem value={'OVS Controller'}>OVS Controller</MenuItem>
            </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12}>
            <FormControl fullWidth variant="standard">
            <InputLabel >Protocol</InputLabel>
            <Select
             label="Protocol"
           
             value={editController.Protocol}
                onChange={(e) =>
                  setEditController({ ...editController, Protocol: e.target.value })
                }
             >
            <MenuItem value={'TCP'}>TCP</MenuItem>
            <MenuItem value={'SSL'}>SSL</MenuItem>
            </Select>
            </FormControl>
            </Grid>
            <Box component="fieldset"
            sx={{
              width: 400,
              marginTop: 3, 
              paddingBottom: 4,
            }}>
            <legend>Remote/In-Band Controller</legend>
            <Grid item xs={12}>
            <TextField
                autoFocus
                margin="dense"
                id="IPAddress"
                label="IP Address"
                type="text"
                variant="standard"
                fullWidth
                
                value={editController.IPAddress}
                onChange={(e) =>
                  setEditController({ ...editController, IPAddress: e.target.value })
                }
              />
            </Grid>
            </Box>

            <Grid item xs={6}>
              <Button onClick={handleCloseDialogcontroller} fullWidth>Cancel</Button>
            </Grid>
            <Grid item xs={6}>
              <Button onClick={handleEditController} fullWidth>Save</Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>


      <Modal open={openDialogEdge} onClose={handleCloseDialogEdge}>
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
              <FlashlightOnIcon sx={{ fontSize: 35 }} />
            </ListItemIcon>
            Link Details
          </Typography>
         <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="Link"
                label="Link name"
                type="text"
                fullWidth
                variant="standard"
                value={editLink.Linkname}
                onChange={(e) =>
                  setEditLink({ ...editLink, Linkname: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="Bandwidth"
                label="Bandwidth"
                type="text"
                fullWidth
                variant="standard"
                value={editLink.Bandwidth}
                onChange={(e) =>
                  setEditLink({ ...editLink, Bandwidth: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="Delay"
                label="Delay"
                type="text"
                fullWidth
                variant="standard"
                value={editLink.Delay}
                onChange={(e) =>
                  setEditLink({ ...editLink, Delay: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="Loss"
                label="Loss"
                type="text"
                fullWidth
                variant="standard"
                value={editLink.Loss}
                onChange={(e) =>
                  setEditLink({ ...editLink, Loss: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={6}>
              <Button onClick={handleCloseDialogEdge} fullWidth>Cancel</Button>
            </Grid>
            <Grid item xs={6}>
              <Button onClick={handleEditLink} fullWidth>Save</Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>


      <Modal open={openDialogPort} onClose={handleCloseDialogPort}>
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
              <FlashlightOnIcon sx={{ fontSize: 35 }} />
            </ListItemIcon>
            Port
          </Typography>
          <Grid container spacing={2}>
          <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="Port"
                label="Port name"
                type="text"
                fullWidth
                variant="standard"
                value={editPort.Portname}
                onChange={(e) => setEditPort({ ...editPort, Portname: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="IP"
                label="IP Address"
                type="text"
                fullWidth
                variant="standard"
                value={editPort.IP_Address}
                onChange={(e) => setEditPort({ ...editPort, IP_Address: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <Button onClick={handleCloseDialogPort} fullWidth>Cancel</Button>
            </Grid>
            <Grid item xs={6}>
              <Button onClick={handleEditPort} fullWidth>Save</Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>





      <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <SpeedDial
          ariaLabel="SpeedDial basic example"
          icon={<SpeedDialIcon />}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
            />
          ))}
        </SpeedDial>
      </Box>

      <ToggleButtonGroup
        aria-label="device"
        sx={{ position: 'fixed', top: 80, left: "50%", }}
        >
          
      <Tooltip title="Save an Experience Configuration ">
        <ToggleButton value="save" aria-label="save">
          <SaveIcon onClick={handleSaveClick}/>
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Run ">
        <ToggleButton value="run" aria-label="run">
          <PlayArrowIcon />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Stop ">
        <ToggleButton value="stop" aria-label="stop">
          <StopIcon />
        </ToggleButton>
        </Tooltip>

      </ToggleButtonGroup>

      <Modal open={openDialogSave} onClose={handleCloseDialogSave}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItemIcon>
              <SaveIcon sx={{ fontSize: 35 }} />
            </ListItemIcon>
            Save an Experience Configuration 
          </Typography>
          <Grid container spacing={2}>
          <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="Save"
                label="Enter a name for the configuration"
                type="text"
                fullWidth
                variant="standard"
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <Button onClick={handleCloseDialogSave} fullWidth>Cancel</Button>
            </Grid>
            <Grid item xs={6}>
              <Button onClick={handleSave} fullWidth>Save</Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      <Modal open={openDialogSwitch} onClose={handleCloseDialogSwitch}>
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
            maxHeight: "95vh",
            overflow: "auto",
          }}
        >
          <Grid container spacing={2}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={switchIcon} alt="Switch" style={{ width: 35, marginRight: 8 }} />
            Switch 
          </Typography>

          <Grid item xs={12}>
              <TextField
                
                margin="dense"
                id="Hostname"
                label="Hostname"
                type="text"
                fullWidth
                variant="standard"
                value={editSwitch.Hostname}
                onChange={(e) =>
                  setEditSwitch({ ...editSwitch, Hostname: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                
                margin="dense"
                id="DPID"
                label="DPID"
                type="text"
                fullWidth
                variant="standard"
                value={editSwitch.DPID}
                onChange={(e) =>
                  setEditSwitch({ ...editSwitch, DPID: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
            <FormControl fullWidth variant="standard">
            <InputLabel >Switch Type</InputLabel>
            <Select
             label="Switch Type"
             value={editSwitch.SwitchType}
                onChange={(e) =>
                  setEditSwitch({ ...editSwitch, SwitchType: e.target.value })
                }
             >
            <MenuItem value={'Default'}>Default</MenuItem>
            <MenuItem value={'P4Switch'}>P4Switch</MenuItem>
            <MenuItem value={'Open vSwitch Kernel Mode'}>Open vSwitch Kernel Mode</MenuItem>
            <MenuItem value={'Userspace'}>Userspace</MenuItem>
            <MenuItem value={'Userspace inNamespace'}>Userspace inNamespace</MenuItem>
            </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                
                margin="dense"
                id="IPAddressSwitch"
                label="IP Address"
                type="text"
                fullWidth
                variant="standard"
                value={editSwitch.IPAddressSwitch}
                onChange={(e) =>
                  setEditSwitch({ ...editSwitch, IPAddressSwitch: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                
                margin="dense"
                id="DPCTLPort"
                label="DPCTL Port"
                type="text"
                fullWidth
                variant="standard"
                value={editSwitch.DPCTLPort}
                onChange={(e) =>
                  setEditSwitch({ ...editSwitch, DPCTLPort: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
            <FormControl fullWidth variant="standard">
            <InputLabel >Protocol</InputLabel>
            <Select
             label="Protocol Switch"
             value={editSwitch.Protocol}
                onChange={(e) =>
                  setEditSwitch({ ...editSwitch, Protocol: e.target.value })
                }
             >
            <MenuItem value={'OpenFlow 1.2'}>OpenFlow 1.2</MenuItem>
            <MenuItem value={'OpenFlow 1.3'}>OpenFlow 1.3</MenuItem>
            <MenuItem value={'OpenFlow 1.4'}>OpenFlow 1.4</MenuItem>
            <MenuItem value={'OpenFlow 1.5'}>OpenFlow 1.5</MenuItem>
            </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12}>
            <TextField
                
                margin="dense"
                id="StartCommandSwitch"
                label="Start Command"
                type="text"
                fullWidth
                variant="standard"
                multiline
                rows={2}
                value={editSwitch.Start_Command}
                onChange={(e) =>
                  setEditSwitch({ ...editSwitch, Start_Command: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
            <TextField
                
                margin="dense"
                id="StopCommandSwitch"
                label="Stop Command"
                type="text"
                fullWidth
                variant="standard"
                multiline
                rows={2}
                value={editSwitch.Stop_Command}
                onChange={(e) =>
                  setEditSwitch({ ...editSwitch, Stop_Command: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <Button onClick={handleCloseDialogSwitch} fullWidth>Cancel</Button>
            </Grid>
            <Grid item xs={6}>
              <Button onClick={handleEditSwitch} fullWidth>Save</Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

 
      <Dashboard />
    </div>
  );
};

export default MyNetwork;
