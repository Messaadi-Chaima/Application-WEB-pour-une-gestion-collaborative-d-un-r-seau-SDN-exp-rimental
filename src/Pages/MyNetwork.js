import React, { useState, useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";
import "./MyNetwork.css";

import hostIcon from "../Images/host.png";
import switchIcon from "../Images/switch.png";
import controllerIcon from "../Images/controller.png";
import portIcon from "../Images/port.png";


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
    interaction: {
      navigationButtons: true,
      keyboard: true,
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
    const newId = generateUniqueId(); // Générer un ID unique pour le nouveau nœud
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

  return (
    <div>
      <div>
        <button onClick={addEdgeButtonHandler}>Add Edge</button>
        <button onClick={() => network.editEdgeMode()}>Edit Edge</button>
        <button onClick={onDeleteSelected}>Delete Selected</button>
      </div>
      <div
        id="mynetwork"
        ref={visJsRef}
        onClick={onNetworkClick}
      ></div>
      <div>{renderAddNodeButtons()}</div>
    </div>
  );
};

export default MyNetwork;
