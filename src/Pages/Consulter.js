import React, { useState, useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";
import "./MyNetwork.css";

import hostIcon from "../Images/host.png";
import switchIcon from "../Images/switch.png";
import controllerIcon from "../Images/controller.png";
import portIcon from "../Images/port.png";
import axios from 'axios';

export const Consulter = () => {
  const [network, setNetwork] = useState(null);
  const visJsRef = useRef(null);
  const dataRef = useRef({
    nodes: new DataSet([]),
    edges: new DataSet([]),
  });

  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
        try {
            const response = await axios.get('http://10.0.0.40:5049/check-connection');
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

    const initializeTopology = async () => {
      try {
        const response = await axios.get('http://10.0.0.40:5049/restapi/topologies/1/config');
        const topologyData = response.data;
        console.log(topologyData)
        // Accédez aux données de la topologie
        const { hosts, switches, host_switch_links } = topologyData;
        

        // Parcourez chaque hôte
        for (const hostId in hosts) {
          if (Object.hasOwnProperty.call(hosts, hostId)) {
            const host = hosts[hostId];
            console.log(`Hôte ID: ${hostId}`);
            
            // Créez le nœud de l'hôte
            const newHostNode = {
              id: hostId, // ID du nœud est l'ID de l'hôte
              label: `Host ${hostId}`, // Étiquette du nœud
              group: 'host', // Groupe du nœud (hôte)
              x: host.position.x, // Position x avec décalage
              y: host.position.y, // Position y avec décalage
            };
            dataRef.current.nodes.add(newHostNode); // Ajoutez le nœud de l'hôte à dataRef.current.nodes
            
            // Parcourez chaque interface de l'hôte
            host.intfs.forEach(intf => {
              console.log(`- Port (Interface): ${intf.name}`);

              // Créez le nœud du port
              const newPortNode = {
                id: `${hostId}-${intf.name}`, // ID du nœud est composé de l'ID de l'hôte et de l'interface
                label: `${intf.name}`, // Étiquette du nœud
                group: 'port', // Groupe du nœud (port)
                x: intf.x, // Position x avec décalage
                y: intf.y, // Position y avec décalage
              };
              dataRef.current.nodes.add(newPortNode); // Ajoutez le nœud du port à dataRef.current.nodes

              // Ajoutez un bord (edge) entre le nœud de l'hôte et le nœud du port
              dataRef.current.edges.add({ from: hostId, to: `${hostId}-${intf.name}` });
            });
          
          }
        }
       
        // Parcourez chaque commutateur
        for (const switchId in switches) {
          if (Object.hasOwnProperty.call(switches, switchId)) {
            const switchObj = switches[switchId];
            console.log(`Commutateur ID: ${switchId}`);

            // Créez le nœud du commutateur
            const newSwitchNode = {
              id: switchId, // ID du nœud est l'ID du commutateur
              label: `Switch ${switchId}`, // Étiquette du nœud
              group: 'switch', // Groupe du nœud (commutateur)
              x: switchObj.position.x, // Position x avec décalage
              y: switchObj.position.y, // Position y avec décalage
            };
            dataRef.current.nodes.add(newSwitchNode); // Ajoutez le nœud du commutateur à dataRef.current.nodes

            // Parcourez chaque interface du commutateur
            switchObj.intfs.forEach(intf => {
              //console.log(`- Port (Interface): ${intf.name}`);
              //console.log(`- ETH POS (Interface): ${intf.x}`);
              // Créez le nœud du port
              const newPortNode = {
                id: `${switchId}-${intf.name}`, // ID du nœud est composé de l'ID du commutateur et de l'interface
                label: `${intf.name}`, // Étiquette du nœud
                group: 'port', // Groupe du nœud (port)
                x: intf.x, // Position x avec décalage
                y: intf.y, // Position y avec décalage
              };
              dataRef.current.nodes.add(newPortNode); // Ajoutez le nœud du port à dataRef.current.nodes

              // Ajoutez un bord (edge) entre le nœud du commutateur et le nœud du port
              dataRef.current.edges.add({ from: switchId, to: `${switchId}-${intf.name}` });
            });
           
          }
        }
        // Ajoutez les arêtes entre les hôtes et les commutateurs en fonction de host_switch_links
         host_switch_links.forEach(link => {
          const { host, switch: switchId, host_intf, switch_intf } = link;
          // Ajoutez un bord (edge) entre le port de l'hôte et le port du commutateur
          dataRef.current.edges.add({ from: `${host}-${host_intf}`, to: `${switchId}-${switch_intf}` });
        });
      } catch (error) {
       
      }
    };

  const [selectedNodeType, setSelectedNodeType] = useState(null);
  const [editNodeId, setEditNodeId] = useState(null);
  const [editNodeLabel, setEditNodeLabel] = useState('');

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

    let switchId, hostId, switchlabel, hostlabel;
    if (previousNodesFrom[0]?.group === "switch" && previousNodesTo[0]?.group === "host") {
      switchId = previousNodesFrom[0]?.id.toString(); // ID du switch
      hostId = previousNodesTo[0]?.id.toString(); // ID de l'hôte
      switchlabel = fromNode.label; // Label du switch
      hostlabel = toNode.label; // Label de l'hôte
  } 
  // Si l'edge va de l'hôte vers le switch
  else if (previousNodesFrom[0]?.group === "host" && previousNodesTo[0]?.group === "switch") {
      switchId = previousNodesTo[0]?.id.toString(); // ID du switch
      hostId = previousNodesFrom[0]?.id.toString(); // ID de l'hôte
      switchlabel = toNode.label; // Label du switch
      hostlabel = fromNode.label; // Label de l'hôte
  }
  
    try {
      const response = await axios.post("http://10.0.0.40:5049/restapi/topologies/1/connect_host_to_switch", {
        switch_id: switchId,
        host_id: hostId,
        switch_label:switchlabel,
        host_label:hostlabel
      });
      console.log("Réponse de la requête:", response.data);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la requête:", error);
      // Gérer les erreurs de requête ici
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

        axios.post('http://10.0.0.40:5049/restapi/topologies/1/delete-selected', data)
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

        axios.post('http://10.0.0.40:5049/restapi/topologies/1/delete-selected', data)
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
  

  const addNode = async (x, y, group) => {
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
    } else if (group === 'host') {
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

    // Création d'un tableau pour stocker les ports associés à l'hôte
    const ports = [];

    // Ajout de la logique pour ajouter un port
    for (let i = 0; i < 1; i++) {
      const newPortId = generateUniqueId();
      const newPort = {
        id: newPortId,
        label: `eth${i}`,
        group: "port",
        x: x - 20 + i * 30, // Positionnement du port
        y: y + 90,
      };
      dataRef.current.nodes.add(newPort);

      dataRef.current.edges.add({ from: newId, to: newPortId });

      // Ajout du port au tableau ports
      ports.push({
        id: newPortId,
        label: newPort.label,
        group: newPort.group,
        x: newPort.x,
        y: newPort.y
      });
    }
    console.log("HOTE :", newId);
    console.log("X :", x);
    console.log("Y :", y);
    // Envoi de la requête POST avec les informations sur l'hôte et les ports
    try {
      const response = await axios.post("http://10.0.0.40:5049/restapi/topologies/1/hosts", {
        host_id: `${newId}`, // Formatage de l'ID de l'hôte
        x: x,
        y: y,
        ports: ports, // Ajout du tableau de ports
      });
      console.log("Réponse de la requête:", response.data);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la requête:", error);
      // Gérer les erreurs de requête ici
    }

    } else if(group == 'switch'){
        const newId = generateUniqueId();
        const newNode = {
          id: newId,
          label: `${group} ${newId}`,
          group: group,
          x: x,
          y: y,
        };
        const ports = [];

        dataRef.current.nodes.add(newNode);
        // Add 6 new port nodes connected to the switch node
        for (let i = 0; i < 6; i++) {
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

          ports.push({
            id: newPortId,
            label: newPort.label,
            group: newPort.group,
            x: newPort.x,
            y: newPort.y
          });


        }
        setEditNodeId(newId);
        setEditNodeLabel(newNode.label);
        setOpenDialogopenDialogSwitch(true)  ;

        if (network) {
          network.setData(dataRef.current);
        }
        console.log(dataRef.current.nodes);

        try {
          const response = await axios.post("http://10.0.0.40:5049/restapi/topologies/1/switches", {
            switch_id: `${newId}`, // Formatage de l'ID du commutateur
            x: x,
            y: y,
            ports: ports, // Ajout du tableau de ports
          });
          console.log("Réponse de la requête:", response.data);
        } catch (error) {
          console.error("Erreur lors de l'envoi de la requête:", error);
          // Gérer les erreurs de requête ici
        }
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

  return (
    <div>
      <div 
        style={{width: '100%'}}
          id="mynetwork"
          ref={visJsRef}
          onClick={onNetworkClick}
        ></div>
    </div>
  );
};

export default Consulter;
