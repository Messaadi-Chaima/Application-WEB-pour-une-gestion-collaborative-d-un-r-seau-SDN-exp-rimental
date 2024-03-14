import React, { useState } from "react";
import {Dashboard} from "./Dashboard";
import TextField from '@mui/material/TextField';

export const Control_experimental_elements = () => {
  
  return (
    <div>
     
      <TextField
          fullWidth 
          id="filled-textarea"
          label="Control of experimental elements"
          multiline
          variant="filled"
          sx={{ width: '50%', margin: 'auto' , m: 1}}
        />
    </div>
  );
  }


export default Control_experimental_elements;