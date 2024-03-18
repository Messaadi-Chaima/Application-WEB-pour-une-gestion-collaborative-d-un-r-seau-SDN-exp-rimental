import React, { useState, useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";
import "./MyNetwork.css";

import hostIcon from "../Images/host.png";
import switchIcon from "../Images/switch.png";
import controllerIcon from "../Images/controller.png";
import portIcon from "../Images/port.png";

import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';

import {Dashboard} from "./Dashboard";

export const MyNetwork = () => {
  const [network, setNetwork] = useState(null);
  const visJsRef = useRef(null);
  const dataRef = useRef({
    nodes: new DataSet([]),
    edges: new DataSet([]),
  });

  const [selectedNodeType, setSelectedNodeType] = useState(null);

  const onAddEdge = (data, callback) => {
    console.log("Adding edge:", data);
    dataRef.current.edges.add(data);
    callback(data);
  };

  const onDeleteSelected = () => {
    const selectedNodes = network.getSelectedNodes();
    const selectedEdges = network.getSelectedEdges();
    dataRef.current.nodes.remove(selectedNodes);
    dataRef.current.edges.remove(selectedEdges);
    network.setData(dataRef.current);
  };

  const onEditEdge = (data, callback) => {
    console.log("Editing edge:", data);
    dataRef.current.edges.update(data);
    callback(data);
  };

  const options = {
    physics: {
      enabled: false,
    },
    manipulation: {
      enabled: false,
      addEdge: onAddEdge,
      editEdge: {
        editWithoutDrag: true,
        callback: onEditEdge,
      },
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
      },
    },
    edges: {
      smooth: false,
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

  const addNode = (x, y, group) => {
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
  };
  

  const generateUniqueId = () => {
    let newId;
    do {
      newId = Math.floor(Math.random() * 10000000) + 1;
    } while (dataRef.current.nodes.get(newId)); 
    return newId;
  };
  

  const renderAddNodeButtons = () => {
    return Object.keys(options.groups).map((groupName) => (
      <button
        key={groupName}
        onClick={() => setSelectedNodeType(groupName)}
      >
        Add {groupName.charAt(0).toUpperCase() + groupName.slice(1)} Node
      </button>
    ));
  };

  const addEdgeButtonHandler = () => {
    network.addEdgeMode();
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

  const actions = [
    { icon: <img src={hostIcon} alt="Host" />, name: 'Host', onClick: () => setSelectedNodeType('host') },
    { icon: <img src={switchIcon} alt="Switch" />, name: 'Switch', onClick: () => setSelectedNodeType('switch') },
    { icon: <img src={controllerIcon} alt="Controller" />, name: 'Controller', onClick: () => setSelectedNodeType('controller') },
    { icon: <img src={portIcon} alt="Port" />, name: 'Port', onClick: () => setSelectedNodeType('port') },
    { icon: <span>Add Edge</span>, name: 'Add Edge', onClick: addEdge },
    { icon: <span>Edit Edge</span>, name: 'Edit Edge', onClick: editEdge },
    { icon: <span>Delete Selected</span>, name: 'Delete Selected', onClick: deleteSelected },
  ];

  return (
    <div>
      <div
        id="mynetwork"
        ref={visJsRef}
        onClick={onNetworkClick}
      ></div>

      

      
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

      <Dashboard />
    </div>
  );
};

export default MyNetwork;