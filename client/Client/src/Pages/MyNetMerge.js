import React, { useState, useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";
import "./MyNetMerge.css";

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

export const MyNetMerge = () => {
  const [network, setNetwork] = useState(null);
  const visJsRef = useRef(null);
  const dataRef = useRef({
    nodes: new DataSet([]),
    edges: new DataSet([]),
  });
  const [topologyData, setTopologyData] = useState({}); // State to hold data for each topology

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

  const onAddEdge = async (data, callback) => {
    console.log("Adding edge:", data);
  
    // Retrieve information about the nodes and ports
    const fromNode = dataRef.current.nodes.get(data.from);
    const toNode = dataRef.current.nodes.get(data.to);
  
    // Retrieve the previous nodes of the fromNode
    const previousNodesFrom = dataRef.current.edges
      .get({ filter: edge => edge.to === data.from })
      .map(edge => dataRef.current.nodes.get(edge.from));
  
    // Retrieve the previous nodes of the toNode
    const previousNodesTo = dataRef.current.edges
      .get({ filter: edge => edge.to === data.to })
      .map(edge => dataRef.current.nodes.get(edge.from));
  
    console.log("From node:", fromNode);
    console.log("To node:", toNode);
    console.log("Previous nodes from:", previousNodesFrom);
    console.log("Previous nodes to:", previousNodesTo);
  
    let switchId1, switchId2, switchLabel1, switchLabel2, switchPort1, switchPort2;
    if (previousNodesFrom[0]?.group === "switch" && previousNodesTo[0]?.group === "switch") {
      switchId1 = previousNodesTo[0]?.id.toString();
      switchId2 = previousNodesFrom[0]?.id.toString();
      switchLabel1 = toNode.label;
      switchLabel2 = fromNode.label;
      switchPort1 = toNode.id;
      switchPort2 = fromNode.id;
  
      // Check if the switch is from a different topology
      const fromTopologyId = fromNode.topologyId;
      const toTopologyId = toNode.topologyId;
  
      if (fromTopologyId !== toTopologyId) {
        // Update edges_ovs for both topologies
        setTopologyData(prevState => {
          const updatedFromTopology = {
            ...prevState[fromTopologyId],
            edges_ovs: prevState[fromTopologyId]?.edges_ovs ? [...prevState[fromTopologyId].edges_ovs] : [],
          };
          updatedFromTopology.edges_ovs.push({
            switch_id1: switchId1,
            switch_id2: switchId2,
            switch_label1: switchLabel1,
            switch_label2: switchLabel2,
            switch_port1: switchPort1,
            switch_port2: switchPort2,
            switch_id1_topology: toTopologyId, // Added topology ID for switch_id1
            switch_id2_topology: fromTopologyId, // Added topology ID for switch_id2
          });
  
          const updatedToTopology = {
            ...prevState[toTopologyId],
            edges_ovs: prevState[toTopologyId]?.edges_ovs ? [...prevState[toTopologyId].edges_ovs] : [],
          };
          updatedToTopology.edges_ovs.push({
            switch_id1: switchId1,
            switch_id2: switchId2,
            switch_label1: switchLabel1,
            switch_label2: switchLabel2,
            switch_port1: switchPort1,
            switch_port2: switchPort2,
            switch_id1_topology: toTopologyId, // Added topology ID for switch_id1
            switch_id2_topology: fromTopologyId, // Added topology ID for switch_id2
          });
  
          return {
            ...prevState,
            [fromTopologyId]: updatedFromTopology,
            [toTopologyId]: updatedToTopology,
          };
        });
      }
    }
  
    const newData = { ...data };
    dataRef.current.edges.add(newData);
    callback(newData);
  };
  

  

  
  const onDeleteSelected = () => {
    const selectedEdges = network.getSelectedEdges();

    const edgesToRemove = [];


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
      const isSwitchToSwitchEdge =
          fromNode.group === 'port' &&
          toNode.group === 'port' &&
          previousNodesFrom[0]?.group === 'switch' &&
          previousNodesTo[0]?.group === 'switch' &&
          previousNodesFrom[0]?.id !== previousNodesTo[0]?.id; // Vérifie que les switch sont différents
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

  };
  

  const initializeTopology = async (topologyId) => {
    try {
      const response = await axios.get(`http://41.111.146.70:5000/restapi/topologies/${topologyId}/config`);
  
      if (response.status === 200) {
        const { nodes = [], edges = [], edges_s = [], edges_ovs = [] } = response.data;
  
        const newNodesData = [];
        const newEdgeDataArray = [];
        const newEdgeDataArray2 = [];
        const newEdgeOvsDataArray = [];
  
        nodes.forEach(({ id, label, group, x, y, ip, ports = [] }) => {
          const newNode = {
            id,
            label,
            group,
            x,
            y,
            ip: group === 'switch' ? ip : undefined, // Include IP if it's a switch
            topologyId,
            ports: []
          };
          dataRef.current.nodes.add(newNode);
          newNodesData.push(newNode);
  
          ports.forEach(({ id: portId, label: portLabel, group: portGroup, x: portX, y: portY, intf, ip: portIp }) => {
            const newPort = {
              id: portId,
              label: portLabel,
              group: portGroup,
              x: portX,
              y: portY,
              intf,
              ip: group === 'host' ? portIp : undefined, // Include IP if it's a host port
              topologyId
            };
            dataRef.current.nodes.add(newPort);
            dataRef.current.edges.add({ from: id, to: portId });
            newNode.ports.push(newPort);
          });
        });
  
        edges.forEach(({ switch_id, host_id, switch_label, host_label, switch_port, host_port, band_width }) => {
          dataRef.current.edges.add({
            from: switch_port,
            to: host_port,
            label: band_width || "None"
          });
          newEdgeDataArray.push({
            switch_id,
            host_id,
            switch_label,
            host_label,
            switch_port,
            host_port,
            band_width
          });
        });
  
        edges_s.forEach(({ switch_id1, switch_id2, switch_label1, switch_label2, switch_port1, switch_port2 }) => {
          dataRef.current.edges.add({ from: switch_port1, to: switch_port2 });
          newEdgeDataArray2.push({
            switch_id1,
            switch_id2,
            switch_label1,
            switch_label2,
            switch_port1,
            switch_port2
          });
        });
  
        edges_ovs.forEach(({ switch_id1, switch_id2, switch_label1, switch_label2, switch_port1, switch_port2,switch_id1_topology,switch_id2_topology }) => {
          dataRef.current.edges.add({ from: switch_port1, to: switch_port2 });
          newEdgeOvsDataArray.push({
            switch_id1,
            switch_id2,
            switch_label1,
            switch_label2,
            switch_port1,
            switch_port2,
            switch_id1_topology,
            switch_id2_topology
          });
        });
  
        // Update state with new data for the specific topologyId
        setTopologyData(prevState => ({
          ...prevState,
          [topologyId]: {
            nodes: newNodesData,
            edges: newEdgeDataArray,
            edges_s: newEdgeDataArray2,
            edges_ovs: newEdgeOvsDataArray,
          },
        }));
      } else if (response.status === 404) {
        console.log("File doesn't exist");
      } else {
        console.error("Failed to fetch topology configuration");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  



  
  const sendNodesData = async () => {
    try {
      const requests = []; // Array to store all the axios post requests
      // Iterate over each selected topology ID
      for (const topologyId of selectedTopologyIds) {
        const topology = topologyData[topologyId];
        if (!topology) {
          console.error(`No data found for topology ID ${topologyId}`);
          continue; // Move to the next iteration
        }
        const nodesToSend = topology.nodes.map(node => {
                // Create a new object without the topologyId property
                const { topologyId, ports, ...nodeWithoutTopologyId } = node;
                // Remove topologyId property from each port object
                const portsWithoutTopologyId = ports.map(port => {
                    const { topologyId, ...portWithoutTopologyId } = port;
                    return portWithoutTopologyId;
                });
                return { ...nodeWithoutTopologyId, ports: portsWithoutTopologyId };
            });
            console.log("topologyId:    "+topologyId);
        const dataToSend = {
          topology_id: topologyId,
          nodes: nodesToSend,
          edges: topology.edges,
          edges_s: topology.edges_s,
          edges_ovs: topology.edges_ovs, // Send the new edges in edges_ovs
        };
        console.log(`Sending data for topology ID ${topologyId}:`, JSON.stringify(dataToSend, null, 2));
  
        // Push axios post request to the requests array
        requests.push(axios.post(`http://41.111.146.70:5000/restapi/topologies/${topologyId}/nodes`, dataToSend));
      }
  
      // Send all requests concurrently
      await Promise.all(requests);
  
      console.log("All requests sent successfully.");
    } catch (error) {
      console.error("Error sending requests:", error);
    }
  };

  const options = {
    physics: {
      enabled: false,
    },
    manipulation: {
      enabled: false,
      addEdge: onAddEdge,
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


  const deleteSelected = () => {
    onDeleteSelected();
  };



    // Fonction pour supprimer tous les nœuds et toutes les arêtes
const clearData = () => {
  dataRef.current.nodes.clear(); // Supprime tous les nœuds
  dataRef.current.edges.clear(); // Supprime toutes les arêtes
};



 useEffect(() => {
    const handleKeyPress = (event) => {
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


  const actions = [
    { icon: <img src={AddEdge} alt="AddEdge" className="icon" />, name: 'Add Edge', onClick: addEdge },
    { icon: <img src={Delete} alt="Delete" className="icon" />, name: 'Delete Selected', onClick: deleteSelected },
    { icon: <img src={AddLabel} alt="AddLabel" className="icon" />, name: 'Add Label' },
  ];



  const [selectedTopologyIds, setSelectedTopologyIds] = React.useState([]);

  
  

// Dans votre fonction de gestion du changement d'ID de topologie
const handleTopologyIdChange = (event) => {
  const selectedIds = event.target.value;
  setSelectedTopologyIds(selectedIds);
  
  // Si vous voulez envoyer la requête pour chaque ID sélectionné
  selectedIds.forEach(async (id) => {
    initializeTopology(id);
  });
};

const handleSendData = async () => {
  if (selectedTopologyIds.length > 0) {
    await sendNodesData(selectedTopologyIds[0]); // Adjust if multiple IDs are supported
  }
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
          id="MyNetMerge"
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
          <PlayArrowIcon onClick={handleSendData} />
        </ToggleButton>
       </Tooltip>
        <Tooltip title="Replay ">
        <ToggleButton value="Replay" aria-label="Replay">
          <ReplayIcon />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Share">
        <ToggleButton value="Share" aria-label="Share">
          <IosShareIcon />
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

 
    </div>
  );
};

export default MyNetMerge;