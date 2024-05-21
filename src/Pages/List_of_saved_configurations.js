import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux'; 
import { addConfiguration } from "../Service/actions";
import { Dashboard } from "./Dashboard";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Box, Typography } from "@mui/material";

export const List_of_saved_configurations = () => {
  const dispatch = useDispatch();
  const [configurations, setConfigurations] = useState(JSON.parse(localStorage.getItem('configurations')) || []);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    localStorage.setItem('configurations', JSON.stringify(configurations));
  }, [configurations]);

  const inputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      const newConfigurations = [...configurations, { id: Date.now(), name: selectedFile.name }];
      setConfigurations(newConfigurations);
    }
  }; 

  const handleButtonClick = () => {
    inputRef.current.click();
  };

  const handleDelete = (id) => {
    const updatedConfigurations = configurations.filter(config => config.id !== id);
    setConfigurations(updatedConfigurations);
  };

  const columns = [
    { field: 'name', headerName: 'Configuration Name', width: 500 },
    {
      field: 'actions',
      headerName: 'Action',
      sortable: false,
      width: 500,
      renderCell: (params) => (
        <div>
          <Grid item xs={12} sx={{ mt: 1 }}> 
            <Grid container spacing={15} alignItems="center">
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDelete(params.row.id)}
                >
                  Delete
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </div>
      ),
    },
  ];

  function getRowId(row) {
    return row.id;
  }

  return (
    <div> 
      <div style={{
          width: '100%',
          margin: 'auto',
          marginTop: '80px',
          float: 'right'
      }}> 
        <Box sx={{width: '80%', float: 'right'}}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
          Import
          </Typography>
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Box mb={2}> {/* Ajouter une marge basse de 2 unités */}
          <Button
            variant="outlined"
            color="primary"
            onClick={handleButtonClick}
          >
            Upload
          </Button>
          </Box>

          <DataGrid
            rows={configurations}
            columns={columns}
            pageSize={5}
            getRowId={getRowId}
          />
        </Box>
      </div>
      <Dashboard />
    </div>
  );
};

export default List_of_saved_configurations;
