import React, { useState } from 'react';
import {addUsers} from '../Service/userService';
import { UserList } from './Redux/UserList';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import List from '@mui/material/List';

import { MainListItems, SecondaryListItems } from './listItems';

import { Modal, Backdrop, Fade, Button, TextField } from '@mui/material';
import { useDispatch } from "react-redux";
import { addUser } from "./Redux/userSlice";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { v4 as uuidv4 } from 'uuid';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);


const defaultTheme = createTheme();

export const Dashboard = ({ handleOpen, user, setUsers}) => {
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [modalOpen, setModalOpen] = useState(false); 

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const dispatch = useDispatch();
  const [values, setValues] = useState({
    name: '',
    password: '',
    role:'',
  });
  const [openAdd, setOpenAdd] = useState(false);
  const [ouv,setOuv]=useState(false);

  const handleClickOpen = () => {
    if ((values.name !== '') && (values.password !== '') && (values.role !== '')) {
      setOpen(true);
      setOpenAdd(true); 
    } else {
      setOuv(true);
    }
  };
  
  const [lastUserId, setLastUserId] = useState(0);
  
  const handleAddUser = async () => {
    if (values.name && values.password && values.role) {
      try {
        const newUser = {
          id: uuidv4(),
          name: values.name,
          password: values.password,
          role: values.role,
        };

        // Appel à la fonction addUsers pour ajouter le nouvel utilisateur
        await addUsers(newUser);

        // Dispatch de l'action pour mettre à jour l'état Redux
        dispatch({
          type: 'ADD_USER',
          payload: newUser,
        });

        // Réinitialisation des valeurs
        setValues({ name: '', password: '', role: '' });
        setModalOpen(false);
      } catch (error) {
        console.error('Error while adding user:', error);
      }
    }
  };
  
  const handleConfirmAddUser = () => {
    console.log("handleConfirmAddUser() called");
    handleAddUser();
    handleClose();
  };
  
  
  const handleClose = () => {
    console.log("handleClose() called");
    setOpenAdd(false);
  };
  
 const handleFerme = () =>{
   setOuv(false);
 }

 const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}  sx={{ backgroundColor: '#1A3867' }}>
          <Toolbar
            sx={{
              pr: '24px', // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Mininet Editor

            </Typography>
           
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <MainListItems />
            <Divider sx={{ my: 1 }} />
            <SecondaryListItems handleOpen={handleOpenModal} />
          </List>
          
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
             
              
             
            </Grid>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <Box sx={{position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            }}>
              
             
            <Typography component="h1" variant="h5" sx={{ mb: 2, textAlign: 'center', marginY: '20px' }}>
              Create a new account
            </Typography>
            
<Grid container spacing={3}>
  <Grid item xs={12}>
    <TextField 
      fullWidth
      variant='outlined'
      label="Username"
      value={values.name}
      onChange={(e) => setValues({ ...values, name: e.target.value })} 
    />
  </Grid>
  <Grid item xs={12}>
    <FormControl fullWidth variant="outlined">
      <InputLabel 
      htmlFor="outlined-adornment-password"
      value={values.password}
      >Password</InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? 'text' : 'password'}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
        onChange={(e) => setValues({ ...values, password: e.target.value })} 
      />
    </FormControl>
  </Grid>
  <Grid item xs={12} >
    <FormControl fullWidth  variant="outlined">
      <InputLabel>Role</InputLabel>
      <Select
        value={values.role}
        label="Role"
        onChange={(e) => setValues({ ...values, role: e.target.value })}
      >
        <MenuItem value={'Administrator'}>Administrator</MenuItem>
        <MenuItem value={'Experimentator'}>Experimentator</MenuItem>
      </Select>
    </FormControl>
  </Grid>
</Grid>

<Grid item xs={12} sx={{ mt: 2 }}> 
  <Grid container spacing={3} alignItems="center">
    <Grid item xs={6}>
      <Button variant="contained" onClick={handleCloseModal} fullWidth>
        Cancel
      </Button>
    </Grid>
    <Grid item xs={6}>
      <Button variant="contained" onClick={handleClickOpen} fullWidth>
        Create
      </Button>
    </Grid>
  </Grid>
</Grid>

          </Box>
        </Fade>
      </Modal>

      <Dialog
        open={openAdd}
        onClose={handleClose}
      >
        <DialogTitle id="alert-dialog-title">
          {"Do you really want to add this user?"}
        </DialogTitle>
        <DialogActions>  
  <Button variant="contained" color="success" onClick={handleConfirmAddUser}>Yes</Button>
  <Button variant="contained" color="error" onClick={handleClose}>Non</Button>
</DialogActions>

      </Dialog>

    </ThemeProvider>
  );
}

export default Dashboard;