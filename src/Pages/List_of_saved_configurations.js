import React, { useState } from "react";
import { Dashboard } from "./Dashboard";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux'; 
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

export const List_of_saved_configurations = () => {
    const dispatch = useDispatch();
    const savedItems = useSelector((state) => state.users);
    const [values, setValues] = useState({
      name: '',
    });

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
                  color="info"

                >
                  Restore
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
    <div style={{ margin: 'auto', width: '82%', marginTop: '70px' , float: 'right'}}>
    <DataGrid
        rows={savedItems}
        columns={columns}
        pageSize={5}
        components={{
          Toolbar: GridToolbar,
        }}
        getRowId={getRowId}
      />
    
    </div>
    <Dashboard />
    </div>

    );
};

export default List_of_saved_configurations;