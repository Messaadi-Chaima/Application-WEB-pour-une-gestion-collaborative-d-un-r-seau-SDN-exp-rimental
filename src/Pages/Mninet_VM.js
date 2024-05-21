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
  import {MyNetwork} from './MyNetwork';

export const Mninet_VM = ({ openMininet, handleCloseMininet,handleOpenMininet,
    visJsRef, onNetworkClick
}) => {
  const [values, setValues] = useState({
    VM:'',
  });
  const [statuses, setStatuses] = useState({
    'Mninet VM 1': true,
    'Mninet VM 2': false,
    'Mninet VM 3': true,
    'Mninet VM 4': false,
  });
  const handleValidate = () => {
    console.log('VM', values.VM);
    const vmId = values.VM;
    handleCloseMininet();
  };
  const vmId = values.VM;
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
      <InputLabel>Mninet VM</InputLabel>
      <Select
        value={values.VM}
        label="Mninet_VM"
        onChange={(e) => setValues({ ...values, VM: e.target.value })}
      >
        {Object.keys(statuses).map(key => (
            <MenuItem key={key} value={key} disabled={!statuses[key]}>
                {`${key} (${statuses[key] ? 'Active' : 'Inactive'})`}
            </MenuItem>
            ))}
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