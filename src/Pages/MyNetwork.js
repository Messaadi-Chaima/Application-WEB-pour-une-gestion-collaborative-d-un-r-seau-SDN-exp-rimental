import React, { useState, useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";
import "./MyNetwork.css";

// Importez vos icônes ici
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

  const options = {
    physics: {
      enabled: false,
    },
    manipulation: {
      editEdge: {
        editWithoutDrag: function (data, callback) {
          console.info(data);
          alert("The callback data has been logged to the console.");
          // you can do something with the data here
          callback(data);
        },
      },
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
  };

  useEffect(() => {
    if (visJsRef.current && !network) {
      setNetwork(new Network(visJsRef.current, dataRef.current, options));
    }
  }, [visJsRef, network, options]);

  const addNode = (group) => {
    const newId = dataRef.current.nodes.length + 1;
    const newNode = { id: newId, label: `${group} ${newId}`, group: group };
    dataRef.current.nodes.add(newNode);
    // Mettre à jour le réseau pour refléter les modifications
    if (network) {
      network.setData(dataRef.current);
    }
  };

  const renderAddNodeButtons = () => {
    return Object.keys(options.groups).map((groupName) => (
      <button key={groupName} onClick={() => addNode(groupName)}>
        Add {groupName.charAt(0).toUpperCase() + groupName.slice(1)} Node
      </button>
    ));
  };

  return (
    <div>
      <div id="text"></div>
      <div id="mynetwork" ref={visJsRef}></div>
      <div>{renderAddNodeButtons()}</div>
    </div>
  );
};

export default MyNetwork;