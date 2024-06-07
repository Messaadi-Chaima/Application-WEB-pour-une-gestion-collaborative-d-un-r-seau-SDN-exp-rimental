import React, { useState, useRef } from "react";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import AppsIcon from '@mui/icons-material/Apps';
import {ListItemIcon } from '@material-ui/core';
import {
    Typography,
    Modal,
    Box,
    Grid,
  } from "@mui/material";
  import Button from '@mui/material/Button';

export const Mninet_VM = ({ openMininet, handleCloseMininet,handleOpenMininet, selectedTopologyIds,
  setSelectedTopologyIds
}) => {
  const handleValidate = () => {
    handleCloseMininet();
  };

  return (
    <>
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
        <FormControl fullWidth  variant="outlined">
        <InputLabel id="topology-id-label">Mninet VM</InputLabel>
        <Select
          labelId="topology-id-label"
          id="topology-id"
          value={selectedTopologyIds}
          label="Mninet_VM"
          onChange={(event) => setSelectedTopologyIds(event.target.value)}
        >
          <MenuItem value="1">Topology 1</MenuItem>
          <MenuItem value="2">Topology 2</MenuItem>
        </Select>

        </FormControl>
    </Grid>
    <Grid item xs={6}>
        <Button onClick={handleValidate} fullWidth>validate</Button>
    </Grid>
    <Grid item xs={6}>
        <Button onClick={handleCloseMininet} fullWidth>Close</Button>
    </Grid>
    </Grid>
        </Box>
</Modal>

    </>
  );
};

export default Mninet_VM;