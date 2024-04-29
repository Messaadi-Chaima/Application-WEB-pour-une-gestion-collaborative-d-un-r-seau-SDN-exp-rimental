import React from 'react';
import { Dashboard } from "./Dashboard";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Typography, Button } from "@mui/material";

export const Home = () => {

    const rows = [
        { id: 1, Combination: 'H', Description: 'Add a host.'}, 
        { id: 2, Combination: 'S', Description: 'Add a switch.'}, 
        { id: 3, Combination: 'P', Description: 'Add a port.'}, 
        { id: 4, Combination: 'C', Description: 'Add a controller.'}, 
        { id: 5, Combination: 'E', Description: 'Add an edge.'}, 
        { id: 6, Combination: 'D', Description: 'Delete selected items.'}, 
        { id: 7, Combination: 'A', Description: 'Select all.'}, 
        { id: 8, Combination: 'Z', Description: 'Reset zoom.'}, 
      ];
      
    const columns = [
        { 
          field: 'Combination', 
          headerName: 'Combination', 
          width: 200,
          renderCell: (params) => (
            <Button style={{ backgroundColor: 'black', color: 'white'}} variant="contained" >
              {params.value}
            </Button>
          )
        },
        { field: 'Description', headerName: 'Description', width: 500 },
      ];

  return (
    <div>
      <div style={{ width: '100%', margin: 'auto', marginTop: '80px', float: 'right' }}>
      <Box sx={{ width: '50%', margin: 'auto'}}>
          <Typography variant="h4" component="h1" gutterBottom sx={{mb: 2 }}>
          Description 
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
          
      </Typography>
        </Box>
        <Box sx={{ width: '50%', margin: 'auto'}}>
          <Typography variant="h4" component="h1" gutterBottom sx={{mb: 2 }}>
            List of shortcuts 
          </Typography>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
          />
        </Box>
      </div>
      <Dashboard />
    </div>
  );
};

export default Home;
