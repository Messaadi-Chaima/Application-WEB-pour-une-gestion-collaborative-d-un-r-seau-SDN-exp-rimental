import React, { useState } from "react";
import { Dashboard } from "./Dashboard";
import TextField from '@mui/material/TextField';
import axios from 'axios'; 
import { Button} from "@mui/material";
import DatasetIcon from '@mui/icons-material/Dataset';
import "./style.css";

export const Control_experimental_elements  = () => {
  const [responseText, setResponseText] = useState(""); // État pour stocker la réponse de la requête
  const [inputText, setInputText] = useState(""); // État pour stocker le texte entré dans le TextField

  // Fonction pour effectuer la requête et mettre à jour l'état avec la réponse
  const fetchData = async () => {
    if (inputText.trim().toLowerCase() === "pingall") {
      try {
        const response = await axios.get('http://10.0.0.40:5049/restapi/topologies/1/pingall');
        const result = response.data.result;
        if (result === 0) {
          setResponseText(prevText => prevText + `Ping: testing ping reachability\nResults: ${result}% dropped\n`);
        } else {
          setResponseText(prevText => prevText + `Ping: testing ping reachability\nResults: ${result}% dropped\n`);
        }
      } catch (error) {
        console.error('Error fetching pingall:', error);
      }
    } else if (inputText.trim().toLowerCase().startsWith("ping ")) {
      // Extracting source and destination hosts from the input
      const commandParts = inputText.trim().split(" ");
      if (commandParts.length === 3) {
        const sourceHost = commandParts[1];
        const destHost = commandParts[2];
        try {
          const response = await axios.post('http://10.0.0.40:5049/restapi/topologies/1/ping', {
            source_host: sourceHost,
            dest_host: destHost
          });
          const result = response.data.message ? response.data.message : response.data.error;
          setResponseText(prevText => prevText + result + "\n");
        } catch (error) {
          console.error('Error executing ping command:', error);
        }
      } else {
        setResponseText(prevText => prevText + "Please specify source and destination hosts for ping command\n");
      }
    } else if (inputText.trim().toLowerCase() === "nodes") {
      try {
        const response = await axios.get('http://10.0.0.40:5049/restapi/topologies/1/nodes');
        const nodesDetails = response.data.nodes.map(node => {
          return `${node.name} - Type: ${node.type}`;
        });
        setResponseText(prevText => prevText + `Available nodes are:\n${nodesDetails.join("\n")}\n`);
      } catch (error) {
        console.error('Error fetching nodes details:', error);
      }
    } else {
      console.log("Text is not 'pingall' or 'nodes', cannot fetch data");
    }
  };

  return (
    <div className="container">
      <div className="input-container">
        <TextField
          fullWidth
          id="experiment-input"
          label="Enter a command to control experimental elements"
          placeholder="with commands such as: pingall, nodes..."
          multiline
          variant="filled"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          sx={{ marginBottom: "1rem" }}
        />
        <div className="button-container">
          <Button
            variant="contained"
            startIcon={<DatasetIcon />}
            onClick={fetchData}
            className="fetch-button" 
          >
          Fetch Data
          </Button>
        </div>
      </div>
      <div className="response-container">
        <pre>{responseText}</pre>
      </div>
      <Dashboard />
    </div>
  );
};
export default Control_experimental_elements;
