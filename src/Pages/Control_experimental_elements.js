import React, { useState } from "react";
import { Dashboard } from "./Dashboard";
import TextField from '@mui/material/TextField';
import axios from 'axios'; 
import { Button} from "@mui/material";
import DatasetIcon from '@mui/icons-material/Dataset';

export const Control_experimental_elements  = () => {
  const [responseText, setResponseText] = useState(""); // État pour stocker la réponse de la requête
  const [inputText, setInputText] = useState(""); // État pour stocker le texte entré dans le TextField

  // Fonction pour effectuer la requête et mettre à jour l'état avec la réponse
  const fetchData = async () => {
    if (inputText.trim().toLowerCase() === "pingall") {
      try {
        const response = await axios.get('http://127.0.0.1:5000/restapi/topologies/2/pingall');
        setResponseText(prevText => prevText + response.data.result + "\n"); // Concaténer les nouveaux résultats avec les anciens et passer à la ligne
      } catch (error) {
        console.error('Error fetching pingall:', error);
      }
    } else if (inputText.trim().toLowerCase() === "nodes") {
      try {
        const response = await axios.get('http://127.0.0.1:5000/restapi/topologies/2/hosts/details');
        const hostsDetails = response.data.hosts.map(host => {
          return `${host.name} - IP: ${host.ip}`;
        });
        setResponseText(prevText => prevText + hostsDetails.join("\n") + "\n"); // Concaténer les nouveaux détails d'hôtes avec les anciens et passer à la ligne
      } catch (error) {
        console.error('Error fetching host details:', error);
      }
    } else {
      console.log("Text is not 'pingall' or 'nodes', cannot fetch data");
    }
  };

  return (
    <div>
      <Dashboard />
      <TextField
        fullWidth 
        id="filled-textarea"
        label="Control of experimental elements"
        placeholder="with commands such as: pingall, nodes..."
        multiline
        variant="filled"
        value={inputText} 
        onChange={(e) => setInputText(e.target.value)} 
        sx={{ width: '50%', position: 'absolute', top: '22%', right: '10px' }}
      />
      <Button 
        variant="outlined"
        startIcon={<DatasetIcon />}
        sx={{position: 'absolute', top: '35%', right: '40%' }}
        onClick={fetchData} 
      >
        Fetch Data
      </Button> 
      <div style={{ 
        marginTop: "1rem", 
        width: '50%', 
        position: 'absolute', 
        top: '40%', 
        left: '49%',
        padding: '1rem',
        borderRadius: '5px',
        border: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        whiteSpace: 'pre-wrap' // Pour conserver les sauts de ligne dans le texte
      }}>
        {responseText}
      </div> 
    </div>
  );
};
export default Control_experimental_elements ;
