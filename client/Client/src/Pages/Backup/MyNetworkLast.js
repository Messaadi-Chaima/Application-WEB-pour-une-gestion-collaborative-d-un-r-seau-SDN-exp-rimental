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
  FormControl,
  InputLabel ,
  Select,
  MenuItem,
} from "@mui/material";
import Button from '@mui/material/Button';
import {ListItemIcon } from '@material-ui/core';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Tooltip from '@mui/material/Tooltip'; 
import ClearIcon from '@mui/icons-material/Clear';


import {addSave} from '../Pages/Redux/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid'; 
import IosShareIcon from '@mui/icons-material/IosShare';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';

import axios from 'axios';

export const MyNetwork = () => {
  const [network, setNetwork] = useState(null);
  const visJsRef = useRef(null);
  const dataRef = useRef({
    nodes: new DataSet([]),
    edges: new DataSet([]),
  });
  const [nodesData, setNodesData] = useState([]);
  const [edgeDataArray, setEdgeData] = useState([]);
  const [edgeDataArray2, setEdgeData2] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [selectedTopologyId, setSelectedTopologyId] = useState('1'); // New state for selected topology ID

  useEffect(() => {
    const checkConnection = async () => {
        try {
            const response = await axios.get('http://41.111.146.70:5000/check-connection');
            if (response.status === 200) {
                setIsBackendConnected(true);
                //initializeTopology(); // Si la connexion est réussie, initialisez la topologie
            } else {
                setIsBackendConnected(false);
            }
        } catch (error) {
            setIsBackendConnected(false);
        }
    };

    checkConnection(); // Appel initial pour vérifier la connexion au montage du composant
    
}, []);
  


  const [selectedNodeType, setSelectedNodeType] = useState(null);
  const [openDialogSave, setOpenDialogopenDialogSave] = useState(false);

 
  
  

  /*const onDeleteSelected = () => {
  const selectedNodes = network.getSelectedNodes();
  const selectedEdges = network.getSelectedEdges();
  dataRef.current.nodes.remove(selectedNodes);
  dataRef.current.edges.remove(selectedEdges);
  network.setData(dataRef.current);
};
  */
  
  const onDeleteSelected = () => {
    const selectedNodes = network.getSelectedNodes();
    const selectedEdges = network.getSelectedEdges();

    const nodesToRemove = [];
    const edgesToRemove = [];

    selectedNodes.forEach(nodeId => {
        const node = dataRef.current.nodes.get(nodeId);
        if (node.group === 'host') {
            const connectedEdgesIds = network.getConnectedEdges(nodeId);
            connectedEdgesIds.forEach(edgeId => {
                const edge = dataRef.current.edges.get(edgeId);
                nodesToRemove.push(edge.to); // Ajoute le nœud de port connecté à l'arête
            });
            nodesToRemove.push(nodeId); // Ajoute le nœud hôte lui-même
            
            console.log("nodeId:    "+nodeId);
            removeNodeById(nodeId);
        }
        else if (node.group === 'switch') {
          const connectedEdgesIds = network.getConnectedEdges(nodeId);
          connectedEdgesIds.forEach(edgeId => {
              const edge = dataRef.current.edges.get(edgeId);
              edgesToRemove.push(edgeId);
              nodesToRemove.push(edge.to); // Ajoute le nœud de port connecté à l'arête
          });
          nodesToRemove.push(nodeId); // Ajoute le nœud commutateur lui-même
          removeNodeById(nodeId);
      }

    });


    selectedEdges.forEach(edgeId => {
      const edge = dataRef.current.edges.get(edgeId);
      const fromNode = dataRef.current.nodes.get(edge.from);
      const toNode = dataRef.current.nodes.get(edge.to);
      const previousNodesFrom = dataRef.current.edges
          .get({ filter: edge => edge.to === fromNode.id })
          .map(edge => dataRef.current.nodes.get(edge.from));
      const previousNodesTo = dataRef.current.edges
          .get({ filter: edge => edge.to === toNode.id })
          .map(edge => dataRef.current.nodes.get(edge.from));
      const isSwitchToHostEdge =
          fromNode.group === 'port' &&
          toNode.group === 'port' &&
          previousNodesFrom[0]?.group === 'switch' &&
          previousNodesTo[0]?.group === 'host';
      const isHostToSwitchEdge =
          fromNode.group === 'port' &&
          toNode.group === 'port' &&
          previousNodesFrom[0]?.group === 'host' &&
          previousNodesTo[0]?.group === 'switch';
      const isSwitchToSwitchEdge =
          fromNode.group === 'port' &&
          toNode.group === 'port' &&
          previousNodesFrom[0]?.group === 'switch' &&
          previousNodesTo[0]?.group === 'switch' &&
          previousNodesFrom[0]?.id !== previousNodesTo[0]?.id; // Vérifie que les switch sont différents
      if (isSwitchToHostEdge || isHostToSwitchEdge) {
          edgesToRemove.push(edgeId);
          const switchId = previousNodesFrom[0]?.id;
          const hostId = previousNodesTo[0]?.id;
          console.log("switchId : "+switchId);
          console.log("hostId : "+hostId);
          removeEdgeByNodeIds(switchId, hostId);
      }
      if (isSwitchToSwitchEdge) {
        edgesToRemove.push(edgeId);
        const switchId1 = previousNodesFrom[0]?.id;
        const switchId2 = previousNodesTo[0]?.id;
        console.log("switchId1 : "+switchId1);
        console.log("switchId2 : "+switchId2);
        removeEdgeByNodeIds2(switchId1, switchId2);

      }
  });

  
    dataRef.current.nodes.remove(nodesToRemove);
    dataRef.current.edges.remove(edgesToRemove);
    network.setData(dataRef.current);
};


// Recherche et suppression de l'élément correspondant dans edgeDataArray
const removeEdgeByNodeIds2 = (switchId1, switchId2) => {
  // Recherche de l'index de l'élément à supprimer dans edgeDataArray
  const edgeIndex = edgeDataArray2.findIndex((edge) => {
    return (
      (edge.switch_id1 === String(switchId1) && edge.switch_id2 === String(switchId2)) ||
      (edge.switch_id1 === String(switchId2) && edge.switch_id2 === String(switchId1))
    );
  });

  // Vérification si l'élément a été trouvé
  if (edgeIndex !== -1) {
    // Suppression de l'élément du tableau edgeDataArray
    edgeDataArray2.splice(edgeIndex, 1);
    console.log("Edge removed:", edgeDataArray2[edgeIndex]);
  } else {
    console.log("No matching edge found.");
  }
};


// Recherche et suppression de l'élément correspondant dans edgeDataArray
const removeEdgeByNodeIds = (switchId, hostId) => {
  // Recherche de l'index de l'élément à supprimer dans edgeDataArray
  const edgeIndex = edgeDataArray.findIndex((edge) => {
    return (
      (edge.switch_id === String(switchId) && edge.host_id === String(hostId)) ||
      (edge.switch_id === String(hostId) && edge.host_id === String(switchId))
    );
  });

  // Vérification si l'élément a été trouvé
  if (edgeIndex !== -1) {
    // Suppression de l'élément du tableau edgeDataArray
    edgeDataArray.splice(edgeIndex, 1);
    console.log("Edge removed:", edgeDataArray[edgeIndex]);
  } else {
    console.log("No matching edge found.");
  }
};


// Affichage des éléments de edgeDataArray correspondant aux IDs de commutateur et d'hôte spécifiés
const displayMatchingEdges = () => {
  // Parcourir edgeDataArray
  edgeDataArray.forEach((edge) => {
    
      // Afficher les informations de l'élément correspondant
      console.log("Edge Data:");
      console.log("Switch ID:", edge.switch_id);
      console.log("Host ID:", edge.host_id);
      console.log("Switch Label:", edge.switch_label);
      console.log("Host Label:", edge.host_label);
      console.log("Switch Port:", edge.switch_port);
      console.log("Host Port:", edge.host_port);

  });
};


const removeNodeById = (nodeId) => {
  // Recherche de l'index du nœud correspondant dans nodesData
  const nodeIndex = nodesData.findIndex((node) => node.id === nodeId);

  // Vérification si le nœud est trouvé
  if (nodeIndex !== -1) {
    // Suppression de l'élément du tableau nodesData
    nodesData.splice(nodeIndex, 1);
    console.log("Node removed with ID:", nodeId);
  } else {
    console.log("Node not found with ID:", nodeId);
  }
};
  
const getNodeInfoById = (nodeId) => {
  // Rechercher le nœud correspondant dans nodesData
  const node = nodesData.find((node) => node.id === nodeId);
  
  // Vérifier si le nœud est trouvé
  if (node) {
    // Afficher les informations du nœud
    console.log("Node ID:", node.id);
    console.log("Node Label:", node.label);
    console.log("Node Group:", node.group);
    console.log("Node X Coordinate:", node.x);
    console.log("Node Y Coordinate:", node.y);
    console.log("Node Ports:", node.ports);
  } else {
    console.log("Node not found with ID:", nodeId);
  }
};
  

  const onEditNode = (data, callback) => {
    console.log("Editing node:", data);
    dataRef.current.nodes.update(data);
    callback(data);
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



  useEffect(() => {
    if (selectedTopologyId !== null) {
      clearData(dataRef);
      cleanupResources()
      initializeTopology(selectedTopologyId);
      
    }
  }, [selectedTopologyId]);



  const cleanupResources = () => {
    dataRef.current.nodes.clear();
    dataRef.current.edges.clear();
   
    nodesData.length = 0;
    edgeDataArray.length = 0;
    edgeDataArray2.length = 0;
  };
  


  const generateUniqueId = () => {
    let newId;
    do {
      newId = Math.floor(Math.random() * 2000) + 1;
    } while (dataRef.current.nodes.get(newId));
    return newId;
  };

  const options = {
    physics: {
      enabled: false,
    },
    manipulation: {
      enabled: false,
      addEdge: onAddEdge,
      editNode: onEditNode,
      deleteNode: false,
    },
    layout: {
      hierarchical: {
          direction: "UD", // Direction haut vers bas (Up-Down)
          sortMethod: "directed" // Trie les nœuds selon la direction des arêtes
      }
  },
    nodes: {
      shape: "image",
      chosen: true,
      // Invisible border, 0 makes selected border dissapear
      borderWidth: 2,
      borderWidthSelected: 2,
      font: {
        align: "center",
        color: '#240747',
        face: "Source Sans Pro",
        strokeWidth: 0,
      },
      shapeProperties: {
        borderRadius: 6,
        useBorderWithImage: true,
      },
      scaling: {
        label: {
          // Don't hide labels while zooming in too much (useful for image export)
          maxVisible: Number.MAX_SAFE_INTEGER,
        },
      },
    },
    groups: {
      host: {
        shape: "image",
        image: hostIcon,
        size: 20,
        color: {
          background: 'white',
          border: 'white',
          highlight: {
            background: 'white',
            border: 'green'
          },
          hover: {
            background: "white",
            border: "blue",
          },
        },
      },
      switch: {
        shape: "image",
        image: switchIcon,
        size: 20,
        color: {
          background: 'white',
          border: 'white',
          highlight: {
            background: 'white',
            border: '#FFC300'
          },
          hover: {
            background: "white",
            border: "blue",
          },
        },
      },
      controller: {
        shape: "image",
        image: controllerIcon,
        size: 20,
        color: {
          background: 'white',
          border: 'white',
          highlight: {
            background: 'white',
            border: '#C70039'
          },
          hover: {
            background: "white",
            border: "blue",
          },
        },
      },
      port: {
        shape: "image",
        image: portIcon,
        size: 8,
        color: {
          background: 'white',
          border: 'white',
          highlight: {
            background: 'white',
            border: '#f70776'
          },
          hover: {
            background: "white",
            border: "blue",
          },
        },
      },
    },
    edges: {
      smooth: false,
      color: 'red',
      font: {
        align: "top", // Pour aligner le texte au-dessus des arêtes
      },
      edgeLabel: function (edge) {
        return edge.label;
      },
    },
    interaction: { hover: true },
  };

  useEffect(() => {
    if (visJsRef.current && !network) {
      const container = visJsRef.current;
      const newNetwork = new Network(container, dataRef.current, options);
      setNetwork(newNetwork);
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

 
  const handleCloseDialogEdge = () => {
    setOpenDialogopenDialogEdge(false);
  };

 /* const handleFileReset = async () => {
    try {
      const response = await axios.post(`http://41.111.146.70:5000/restapi/topologies/1/reset-topology`);
      console.log('Topology reset successfully',response);
      clearData()
      initializeTopology()
    } catch (error) {
      console.log('Failed to reset configuration file.');
    }
  };*/

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

 useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'H') {
        setSelectedNodeType('host');
      }
      if (event.key === 'S') {
        setSelectedNodeType('switch');
      }
      if (event.key === 'P') {
        setSelectedNodeType('port');
      }
      if (event.key === 'C') {
        setSelectedNodeType('controller');
      }
      if (event.key === 'E') {
        if (network) {
          network.addEdgeMode();
        } 
      }
        if (event.key === 'D') {
          deleteSelected();
        }
        if (event.key === 'A') {
          selectAll();
        }
        if (event.key === 'Z') {
          resetZoom();
        }    
        };
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [network]);

  const selectAll = () => {
    if (network) {
      const allNodes = dataRef.current.nodes.getIds();
      const allEdges = dataRef.current.edges.getIds();
      network.setSelection({ nodes: allNodes, edges: allEdges });
    }
  };
  const resetZoom = () => {
    if (network) {
      network.fit(); // Réinitialise le niveau de zoom du réseau
    }
  };


  /*  const options = {
    physics: {
      enabled: false,
    },
    manipulation: {
      enabled: false,
      addEdge: onAddEdge,
      editNode: onEditNode,
      deleteNode: false,
    },
    interaction: {
      hover: true,
      navigationButtons: false,
      keyboard: false,
    },
    manipulation: {
      enabled: false,
    },
    nodes: {
      shape: "image",
      chosen: true,
      // Invisible border, 0 makes selected border dissapear
      borderWidth: 2,
      borderWidthSelected: 2,
      font: {
        align: "center",
        color: '#240747',
        face: "Source Sans Pro",
        strokeWidth: 0,
      },
      shapeProperties: {
        borderRadius: 6,
        useBorderWithImage: true,
      },
      scaling: {
        label: {
          // Don't hide labels while zooming in too much (useful for image export)
          maxVisible: Number.MAX_SAFE_INTEGER,
        },
      },
    },
    groups: {
      host: {
        shape: "image",
        image: hostIcon,
        size: 20,
        color: {
          background: 'white',
          border: 'white',
          highlight: {
            background: 'white',
            border: 'green'
          },
          hover: {
            background: "white",
            border: "blue",
          },
        },
      },
      switch: {
        shape: "image",
        image: switchIcon,
        size: 20,
        color: {
          background: 'white',
          border: 'white',
          highlight: {
            background: 'white',
            border: '#FFC300'
          },
          hover: {
            background: "white",
            border: "blue",
          },
        },
      },
      controller: {
        shape: "image",
        image: controllerIcon,
        size: 20,
        color: {
          background: 'white',
          border: 'white',
          highlight: {
            background: 'white',
            border: '#C70039'
          },
          hover: {
            background: "white",
            border: "blue",
          },
        },
      },
      port: {
        shape: "image",
        image: portIcon,
        size: 8,
        color: {
          background: 'white',
          border: 'white',
          highlight: {
            background: 'white',
            border: '#f70776'
          },
          hover: {
            background: "white",
            border: "blue",
          },
        },
      },
    },
    edges: {
      smooth: false,
      color: 'red',
      font: {
        align: "top", // Pour aligner le texte au-dessus des arêtes
      },
      edgeLabel: function (edge) {
        return edge.label;
      },
    },
  };
*/
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
  const [open, setOpen] = useState(false);

  const handleShare = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleCopy = (pageUrl) => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
  };


  const [selectedTopologyIds, setSelectedTopologyIds] = React.useState([]);

  
  
  // Fonction pour récupérer la configuration de la topologie
const fetchTopologyConfig = async (topologyId) => {
  try {
    const response = await axios.get(`http://41.111.146.70:5000/restapi/topologies/${topologyId}/config`);
    // Traitement de la réponse
    console.log('Configuration de la topologie :', response.data);
    // Mettre à jour l'état ou effectuer d'autres actions avec la réponse
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration de la topologie :', error);
    // Gérer les erreurs
  }
};


// Dans votre fonction de gestion du changement d'ID de topologie
const handleTopologyIdChange = (event) => {
  const selectedIds = event.target.value;
  setSelectedTopologyIds(selectedIds);
  
  // Si vous voulez envoyer la requête pour chaque ID sélectionné
  selectedIds.forEach(async (id) => {
    initializeTopology(id);
  });
};
  
  return (
    <div>
      <div style={{position: 'fixed',marginTop: '70px', right:'3%' }}>
    {isBackendConnected ? (
        <button style={{ backgroundColor: 'green' }}>Backend connecté</button>
      ) : (
        <button style={{ backgroundColor: 'red' }}>Backend non connecté</button>
      )}
    </div> 

      <div 
        style={{width: '100%', float: 'right', top:'0'}}
          id="mynetwork"
          ref={visJsRef}
          onClick={onNetworkClick}
        ></div>


{/*---------------------SpeedDial------------------------------*/}
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
{/*------------------Boutons: Run Stop Save Share---------*/}
      <ToggleButtonGroup
        aria-label="device"
        sx={{ position: 'fixed', top: 80, left: "50%", }}
        >
      <Tooltip title="Save an Experience Configuration ">
        <ToggleButton value="save" aria-label="save">
        <SaveIcon onClick={() => initializeTopology(selectedTopologyId)} />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Run">
        <ToggleButton value="run" aria-label="run">
          <PlayArrowIcon onClick={() => sendNodesData(selectedTopologyId)} />
        </ToggleButton>
       </Tooltip>
        <Tooltip title="Stop ">
        <ToggleButton value="stop" aria-label="stop">
          <StopIcon />
        </ToggleButton>
        </Tooltip>
	      <Tooltip title="Pause ">
        <ToggleButton value="Pause" aria-label="Pause">
          <PauseIcon />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Replay ">
        <ToggleButton value="Replay" aria-label="Replay">
          <ReplayIcon />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Share">
        <ToggleButton value="Share" aria-label="Share">
          <IosShareIcon onClick={handleShare} />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Clear">
        <ToggleButton value="Clear" aria-label="Clear">
          <ClearIcon onClick={() => clearData()}/>
        </ToggleButton>
        </Tooltip>
        <FormControl>
        <InputLabel id="topology-id-label">Topology ID</InputLabel>
        <Select
          labelId="topology-id-label"
          id="topology-id"
          value={selectedTopologyId}
          onChange={(event) => setSelectedTopologyId(event.target.value)}
        >
          <MenuItem value="1">Topology 1</MenuItem>
          <MenuItem value="2">Topology 2</MenuItem>
        </Select>

        </FormControl>

        <FormControl>
        <InputLabel id="topology-id-label">Topology ID</InputLabel>
        <Select
          labelId="topology-id-label"
          id="topology-id"
          value={selectedTopologyIds} // Utilisez un tableau pour stocker les ID sélectionnés
          onChange={handleTopologyIdChange} // Mettez à jour la fonction de gestion du changement
          multiple // Permet la sélection multiple
          renderValue={(selected) => selected.join(', ')} // Affiche les valeurs sélectionnées
        >
          <MenuItem value="1">Topology 1</MenuItem>
          <MenuItem value="2">Topology 2</MenuItem>
        </Select>
      </FormControl>

      </ToggleButtonGroup>
{/*-------------------------Model Save---------------------------*/}
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

 
    </div>
  );
};

export default MyNetwork;