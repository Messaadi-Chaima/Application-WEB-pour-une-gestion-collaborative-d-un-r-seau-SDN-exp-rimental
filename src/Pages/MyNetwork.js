import React, { useState, useEffect, useRef  } from "react";
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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import { Dashboard } from "./Dashboard";
import {addSave} from '../Pages/Redux/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid'; 
import IosShareIcon from '@mui/icons-material/IosShare';
import { IconButton,Chip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import copy from "clipboard-copy";
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import {Notification} from './Notification';
import {Mninet_VM} from './Mninet_VM';
import AppsIcon from '@mui/icons-material/Apps';
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

  const [responseData, setResponseData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    const checkConnection = async () => {
        try {
            const response = await axios.get('http://41.111.146.70:5000/check-connection');
            if (response.status === 200) {
                setIsBackendConnected(true);
                initializeTopology(); // Si la connexion est réussie, initialisez la topologie
            } else {
                setIsBackendConnected(false);
            }
        } catch (error) {
            setIsBackendConnected(false);
        }
    };

    checkConnection(); // Appel initial pour vérifier la connexion au montage du composant
}, []);
  
  
  // Fonction pour supprimer tous les nœuds et toutes les arêtes
const clearData = () => {
  dataRef.current.nodes.clear(); // Supprime tous les nœuds
  dataRef.current.edges.clear(); // Supprime toutes les arêtes
};


useEffect(() => {
  if (selectedTopologyId !== null) {
    clearData(dataRef);
    cleanupResources()
    initializeTopology(selectedTopologyId);
    
  }
}, [selectedTopologyId]);



  const initializeTopology = async (topologyId) => {
    try {
      const response = await axios.get(`http://41.111.146.70:5000/restapi/topologies/${topologyId}/config`,);

      if (response.status === 200) {
        const { nodes = [], edges = [], edges_s = [] } = response.data;
  
        console.log('Topology Data:', { nodes, edges, edges_s });
  
        // Adding nodes (hosts and switches) to dataRef
      nodes.forEach(({ id, label, group, x, y, ports = [] }) => {
        // Define the new node with its properties and ports
        const newNode = {
          id,
          label,
          group,
          x,
          y,
          ports: [],
        };

        // Add the main node (host or switch) to dataRef
        dataRef.current.nodes.add(newNode);
        nodesData.push(newNode);

        // Add ports and their edges to the parent node
        ports.forEach(({ id: portId, label: portLabel, group: portGroup, x: portX, y: portY }) => {
          const newPort = {
            id: portId,
            label: portLabel,
            group: portGroup,
            x: portX,
            y: portY,
          };
          dataRef.current.nodes.add(newPort);
          dataRef.current.edges.add({ from: id, to: portId });
          newNode.ports.push(newPort);
        });
      });
  

    
        edges.forEach(({switch_id,host_id,switch_label,host_label, switch_port, host_port }) => {
          dataRef.current.edges.add({ from: switch_port, to: host_port });
  
          edgeDataArray.push({
            switch_id:switch_id,
            host_id:host_id,
            switch_label:switch_label,
            host_label:host_label,
            switch_port:switch_port,
            host_port,host_port
          })
        });
        
       
  
        edges_s.forEach(({switch_id1,switch_id2,switch_label1,switch_label2,switch_port1, switch_port2 }) => {
          dataRef.current.edges.add({ from: switch_port1, to: switch_port2 });
          edgeDataArray2.push({
            switch_id1:switch_id1,
            switch_id2:switch_id2,
            switch_label1:switch_label1,
            switch_label2:switch_label2,
            switch_port1:switch_port1,
            switch_port2:switch_port2
          })
 
        });
  
        //console.log('Nodes:', dataRef.current.nodes.get());
        //console.log('Edges:', dataRef.current.edges.get());
      } else if (response.status === 404) {
        console.log("File doesn't exist");
      } else {
        console.error("Failed to fetch topology configuration");
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle other types of errors if needed
    }
  };


  const [selectedNodeType, setSelectedNodeType] = useState(null);
  const [editNodeId, setEditNodeId] = useState(null);
  const [editNodeLabel, setEditNodeLabel] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogcontroller, setOpenDialogcontroller] = useState(false);
  const [openDialogEdge, setOpenDialogopenDialogEdge] = useState(false);
  const [openDialogPort, setOpenDialogopenDialogPort] = useState(false);
  const [openDialogSave, setOpenDialogopenDialogSave] = useState(false);
  const [openDialogSwitch, setOpenDialogopenDialogSwitch] = useState(false);
  const [openDialogClean, setOpenDialogopenDialogClean] = useState(false);

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

  const onAddEdge = async (data, callback) => {
    console.log("Adding edge:", data);
  
    // Récupérer les informations sur les nœuds et les ports
    const fromNode = dataRef.current.nodes.get(data.from);
    const toNode = dataRef.current.nodes.get(data.to);
  
    // Récupérer les identifiants des nœuds précédents du nœud de départ (fromNode)
    const previousNodesFrom = dataRef.current.edges
      .get({ filter: edge => edge.to === data.from })
      .map(edge => dataRef.current.nodes.get(edge.from));
  
    // Récupérer les identifiants des nœuds précédents du nœud d'arrivée (toNode)
    const previousNodesTo = dataRef.current.edges
      .get({ filter: edge => edge.to === data.to })
      .map(edge => dataRef.current.nodes.get(edge.from));
  
    console.log("From node:", fromNode);
    console.log("To node:", toNode);
    console.log("Previous nodes from:", previousNodesFrom);
    console.log("Previous nodes to:", previousNodesTo);

    let switchId, hostId, switchlabel, hostlabel,switchport,hostport;
    let switchId1,switchId2,switchlabel1,switchlabel2,switchport1,switchport2;
    if (previousNodesFrom[0]?.group === "switch" && previousNodesTo[0]?.group === "host") {
      switchId = previousNodesFrom[0]?.id.toString(); // ID du switch
      hostId = previousNodesTo[0]?.id.toString(); // ID de l'hôte
      switchlabel = fromNode.label; // Label du switch
      hostlabel = toNode.label; // Label de l'hôte
      switchport =fromNode.id;
      hostport = toNode.id;

      edgeDataArray.push({
        switch_id: switchId,
        host_id: hostId,
        switch_label: switchlabel,
        host_label: hostlabel,
        switch_port : switchport,
        host_port : hostport
      })
  } 
  // Si l'edge va de l'hôte vers le switch
  else if (previousNodesFrom[0]?.group === "host" && previousNodesTo[0]?.group === "switch") {
      switchId = previousNodesTo[0]?.id.toString(); // ID du switch
      hostId = previousNodesFrom[0]?.id.toString(); // ID de l'hôte
      switchlabel = toNode.label; // Label du switch
      hostlabel = fromNode.label; // Label de l'hôte
      switchport =toNode.id;
      hostport = fromNode.id;

       edgeDataArray.push({
        switch_id: switchId,
        host_id: hostId,
        switch_label: switchlabel,
        host_label: hostlabel,
        switch_port : switchport,
        host_port : hostport
      })
    }
      else if (previousNodesFrom[0]?.group === "switch" && previousNodesTo[0]?.group === "switch") {
        switchId1 = previousNodesTo[0]?.id.toString(); // ID du switch
        switchId2 = previousNodesFrom[0]?.id.toString(); // ID de l'hôte
        switchlabel1 = toNode.label; // Label du switch
        switchlabel2 = fromNode.label; // Label de l'hôte
        switchport1=toNode.id;
        switchport2=fromNode.id;

        edgeDataArray2.push({
          switch_id1: switchId1,
          switch_id2: switchId2,
          switch_label1: switchlabel1,
          switch_label2: switchlabel2,
          switch_port1:switchport1,
          switch_port2:switchport2
        })
      }
  

  
    const newData = {
      ...data,
    };
  
    dataRef.current.edges.add(newData);
    callback(newData);
  };

  const onDeleteSelected = () => {
    const selectedNodes = network.getSelectedNodes();
    const selectedEdges = network.getSelectedEdges();

    const nodesToRemove = [];
    const edgesToRemove = [];

    const nodesToRemoveMininet = [];
    const edgesToRemoveMininet = [];

    let nodesDeleted = false;
    let edgesDeleted = false;

    selectedNodes.forEach(nodeId => {
        const node = dataRef.current.nodes.get(nodeId);
        if (node.group === 'host') {
            const connectedEdgesIds = network.getConnectedEdges(nodeId);
            connectedEdgesIds.forEach(edgeId => {
                const edge = dataRef.current.edges.get(edgeId);
                edgesToRemove.push(edgeId);
                nodesToRemove.push(edge.to); // Ajoute le nœud de port connecté à l'arête
            });
            nodesToRemove.push(nodeId); // Ajoute le nœud hôte lui-même
            nodesToRemoveMininet.push(nodeId);
            nodesDeleted = true;
        } else if (node.group === 'switch') {
            const connectedEdgesIds = network.getConnectedEdges(nodeId);
            connectedEdgesIds.forEach(edgeId => {
                const edge = dataRef.current.edges.get(edgeId);
                edgesToRemove.push(edgeId);
                nodesToRemove.push(edge.to); // Ajoute le nœud de port connecté à l'arête
            });
            nodesToRemove.push(nodeId); // Ajoute le nœud commutateur lui-même
            nodesToRemoveMininet.push(nodeId);
            nodesDeleted = true;
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
        if (isSwitchToHostEdge || isHostToSwitchEdge) {
            edgesToRemove.push(edgeId);
            edgesToRemoveMininet.push(previousNodesFrom[0]?.id);
            edgesToRemoveMininet.push(previousNodesTo[0]?.id);
            edgesDeleted = true;
        }
    });

    if (nodesDeleted) {
      const data = {
        selected_nodes: nodesToRemoveMininet,
        group: selectedNodes.length > 0 ? dataRef.current.nodes.get(selectedNodes[0]).group : "", // Utiliser le groupe du premier nœud sélectionné
    };

        axios.post('http://41.111.146.70:5000/restapi/topologies/1/delete-selected', data)
            .then(response => {
                console.log(response.data.message);
                // Mettez à jour votre interface utilisateur ou effectuez d'autres actions nécessaires après la suppression réussie
            })
            .catch(error => {
                console.error('Error deleting selected nodes:', error);
                // Gérez les erreurs de suppression des nœuds, le cas échéant
            });
    }

    if (edgesDeleted) {
        const data = {
            selected_nodes: edgesToRemoveMininet,
            group: "links",
        };

        axios.post('http://41.111.146.70:5000/restapi/topologies/1/delete-selected', data)
            .then(response => {
                console.log(response.data.message);
                // Mettez à jour votre interface utilisateur ou effectuez d'autres actions nécessaires après la suppression réussie
            })
            .catch(error => {
                console.error('Error deleting selected edges:', error);
                // Gérez les erreurs de suppression des arêtes, le cas échéant
            });
    }

    dataRef.current.nodes.remove(nodesToRemove);
    dataRef.current.edges.remove(edgesToRemove);

    network.setData(dataRef.current);
};

  const onEditNode = (data, callback) => {
    console.log("Editing node:", data);
    dataRef.current.nodes.update(data);
    callback(data);
  };


  /*
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
*/

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
    let newNode = {};
    let ports = [];
    const newId = generateUniqueId();
  
    if (group === 'host' || group === 'switch') {
      for (let i = 0; i < (group === 'host' ? 1 : 6); i++) {
        const newPortId = generateUniqueId();
        const newPort = {
          id: newPortId,
          label: `${newId}-eth${i}`,
          group: "port",
          x: x - 50 + i * 30,
          y: y + 90,
        };
        dataRef.current.nodes.add(newPort);
        dataRef.current.edges.add({ from: newId, to: newPortId });
        ports.push(newPort);
      }
    }
  
    newNode = {
      id: newId,
      label: `${group} ${newId}`,
      group: group,
      x: x,
      y: y,
      ports: ports,
    };
  
    dataRef.current.nodes.add(newNode);
    nodesData.push(newNode);
  
    if (network) {
      network.setData(dataRef.current);
    }
    console.log(dataRef.current.nodes);
  };
  


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



  const sendNodesData = async (topologyId) => {

    try {
  
      const dataToSend = {
        topology_id: topologyId,
        nodes: nodesData,
        edges: edgeDataArray,
        edges_s:edgeDataArray2,
      };
      console.log('Data to send:', JSON.stringify(dataToSend, null, 2));
  
  
      const response = await axios.post(`http://41.111.146.70:5000/restapi/topologies/${topologyId}/nodes`, dataToSend);
  
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error sending request:", error);
    } 
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
  const handleOpenDialogClean = () => {
    setOpenDialogopenDialogClean(true);
  };
  const handleCloseDialogClean = () => {
    setOpenDialogopenDialogClean(false);
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

//------------------------------------------------------------  
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
      <div style={{position: 'fixed',marginTop: '70px', right:'5%' , zIndex: 1000}}>
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
      <Notification 
      modalOpen={modalOpen} 
      handleModalClose={handleModalClose}
      handleModalOpen={handleModalOpen}
      responseData={responseData}
      />
{/*------------Dialog Bouton Clean--------------------*/}
 <Dialog
        open={openDialogClean}
        onClose={handleCloseDialogClean}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Do you really want to clean the topology ?"}
        </DialogTitle>
        <DialogActions>
            <Button 
              variant="contained"
              color="success">Yes</Button>
            <Button variant="contained" color="error"
            onClick={handleCloseDialogClean}>No</Button>
        </DialogActions>
      </Dialog>  
{/*-------------Host Details-----------------------*/}
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
{/*----------------------Controller Details---------------------------------*/}
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
{/*--------------------Link Details------------------------------*/}
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
{/*--------------------Port Details------------------------------*/}
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
        sx={{ position: 'fixed', top: 90, left: "40%", }}
        >
        <Tooltip title="Run ">
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
        <Tooltip title="Clean ">
        <ToggleButton value="Clean" aria-label="Clean">
          <CleaningServicesIcon onClick={handleOpenDialogClean} />
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
{/*-------------------------Switch Details---------------------------*/}
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