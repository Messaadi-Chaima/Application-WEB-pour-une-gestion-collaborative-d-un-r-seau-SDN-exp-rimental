import React, { useState, useEffect } from "react";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import AppsIcon from '@mui/icons-material/Apps';
import { ListItemIcon } from '@material-ui/core';
import {
  Typography,
  Modal,
  Box,
  Grid,
  Button,
} from "@mui/material";

export const Mninet_VM = ({
  openMininet,
  handleCloseMininet,
  onSelectValue, // New prop for passing the selected value back to the parent
}) => {
  const [values, setValues] = useState({ VM: '' });
  const [vmData, setVmData] = useState({});

  useEffect(() => {
    // Fetch VM data from server
    const fetchVmData = async () => {
      try {
        const response = await fetch('http://10.0.0.55:5000/get-server-info'); // Update with your server URL
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setVmData(data);
      } catch (error) {
        console.error("Error fetching VM data:", error);
      }
    };

    fetchVmData();
  }, []);

  const handleValidate = () => {
    handleCloseMininet();
    onSelectValue(values.VM); // Call onSelectValue with the selected value
    // Additional handling logic if needed
  };

  return (
    <Modal open={openMininet} onClose={handleCloseMininet}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 450,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="button" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemIcon>
                <AppsIcon sx={{ fontSize: 30 }} />
              </ListItemIcon>
              Specify the Mininet machine to deploy
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Mninet VM</InputLabel>
              <Select
                value={values.VM}
                label="Mninet_VM"
                onChange={(e) => setValues({ ...values, VM: e.target.value })}
              >
                {Object.entries(vmData).map(([key, vm]) => (
                  <MenuItem key={key} value={key}>
                    {`${vm.hostname} (${vm.ip_address}:${vm.port})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <Button onClick={handleValidate} fullWidth>Validate</Button>
          </Grid>
          <Grid item xs={6}>
            <Button onClick={handleCloseMininet} fullWidth>Close</Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default Mninet_VM;
