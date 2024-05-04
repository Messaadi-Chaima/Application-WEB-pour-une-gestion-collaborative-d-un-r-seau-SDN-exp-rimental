import React, { useState } from 'react';
import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui';
import axios from 'axios';
import { Dashboard } from "./Dashboard";
import Box from '@mui/material/Box';

export const Test = (props = {}) => {
  const [terminalLineData, setTerminalLineData] = useState([
    <TerminalOutput>Welcome to CLI Mininet</TerminalOutput>
  ]);

  // Fonction pour gérer l'exécution des commandes
  const handleCommand = async (command) => {
    let output;
    switch (command) {
      case 'pingall':
      try {
        const response = await axios.get(`http://127.0.0.1:5002/restapi/topologies/1/pingall`);
        const result = response.data.result;
        if (result === 0) {
          output = `Ping: testing ping reachability\nResults: ${result}% dropped`;
        } else {
          output = `Ping: testing ping reachability\nResults: ${result}% dropped`;
        }
      } catch (error) {
        output = 'Error fetching pingall';
        console.error('Error fetching pingall:', error);
      }
      break;
      case 'nodes':
        try {
          const response = await axios.get(`http://127.0.0.1:5002/restapi/topologies/1/nodes`);
          const nodesDetails = response.data.nodes.map(node => {
            return `${node.name} - Type: ${node.type}`;
          });
          output = `Available nodes are: \n${nodesDetails.join("\n")}`;
        } catch (error) {
          output = 'Error fetching nodes';
          console.error('Error fetching nodes:', error);
        }
        break;
      default:
        // Diviser la commande par des espaces pour obtenir les parties
        const commandParts = command.split(' ');
        // Vérifier si la commande contient les noms des hôtes source et destination
        if (commandParts.length === 3 && commandParts[0] === 'ping') {
          const sourceHost = commandParts[1];
          const destHost = commandParts[2];
          try {
            const response = await axios.post(`http://127.0.0.1:5002/restapi/topologies/1/ping`, {
              source_host: sourceHost,
              dest_host: destHost
            });
            const result = response.data;
            output = result.message ? result.message : result.error;
          } catch (error) {
            output = 'Error executing ping command';
            console.error('Error executing ping command:', error);
          }
        } else {
          output = `Command '${command}' not recognized.`;
        }
        break;
    }
    setTerminalLineData([
      ...terminalLineData,
      <TerminalOutput>{`> ${command}`}</TerminalOutput>,
      <TerminalOutput>{output}</TerminalOutput>
    ]);
  };

  return (
    <div>
    <div style={{ width: '100%', margin: 'auto', marginTop: '80px', float: 'right' }}>
      <Box sx={{width: '80%', margin: 'auto', float: 'right'}}>
      <Terminal
        name='Terminal'
        colorMode={ColorMode.Dark}
        onInput={handleCommand}
        commands={['pingall', 'nodes']}
      >
        {terminalLineData}
      </Terminal>
      </Box>
    </div>
    <Dashboard />
    </div>
  );
};

export default Test;
