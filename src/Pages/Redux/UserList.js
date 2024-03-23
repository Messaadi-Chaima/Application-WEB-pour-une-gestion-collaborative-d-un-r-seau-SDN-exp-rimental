import React, { useState, useEffect } from 'react';
import {Dashboard} from "../Dashboard";
import axios from 'axios';
import { getUsers, deleteUsers, updateUser  } from '../../Service/userService';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Grid from '@mui/material/Grid';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteUser } from './userSlice';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { editUser } from './userSlice';
import { useNavigate, useParams } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

export const UserList = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const users = useSelector((store) => store.users);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [editValues, setEditValues] = useState({
    name: '',
    role: '',
    password: '',
  });

  const [user, setUsers] = useState([]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleOpenDeleteDialog = (id) => {
    setOpenDeleteDialog(true);
    setDeleteUserId(id);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteUserId(null);
  };

  const handleSupprimerUser = async (id) => {
    try {
      await deleteUsers(id);
      setUsers(user.filter(users => users.id !== id)); // Update users state after deletion
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  

  const handleOpenEdit = (id) => {
    setEditUserId(id);
    const selectedUser = user.find(users => users.id === id); // Trouver l'utilisateur sélectionné
    if (selectedUser) {
      // Mettre à jour les valeurs d'édition avec les données de l'utilisateur sélectionné
      setEditValues({
        name: selectedUser.name,
        role: selectedUser.role,
        password: selectedUser.password,
      });
    } else {
      console.error('User not found');
    }
  };

  const handleCloseEdit = () => {
    setEditUserId(null);
    setEditValues({
      name: '',
      role: '',
      password: '',
    });
  };

  const handleEditUser = async () => {
    try {
      // Envoi de la modification au backend
      await updateUser(editUserId, editValues); // Assurez-vous que updateUser prend en charge l'identifiant et les nouvelles valeurs
      // Mettre à jour l'utilisateur dans l'état local
      const updatedUsers = user.map(users => users.id === editUserId ? { ...users, ...editValues } : users);
      setUsers(updatedUsers);
      // Fermeture de la boîte de dialogue modale d'édition
      handleCloseEdit();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };
  
  
  
  
  
  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Username', width: 350 },
    { field: 'role', headerName: 'Role', width: 350 },
    {
      field: 'actions',
      headerName: 'Action',
      sortable: false,
      width: 350,
      renderCell: (params) => (
        <div>
          <Grid item xs={12} sx={{ mt: 1 }}> 
            <Grid container spacing={15} alignItems="center">
          
          <Grid item xs={6}>
            <Button
              variant="outlined"
              color="info"
              onClick={() => handleOpenEdit(params.row.id)}
            >
              Edit
            </Button>
          </Grid>

          <Grid item xs={6}>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleOpenDeleteDialog(params.row.id)}
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
  
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers(); // Appelez la fonction getUsers pour récupérer les utilisateurs
        setUsers(usersData); // Mettez à jour l'état avec les utilisateurs récupérés
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [user]); 

  function getRowId(row) {
    return row.id;
  }



  return (
    <div >
      <div style={{width: '82%', float: 'right', top:'0'}}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <SearchIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
        <TextField
          variant="standard"
          label="Rechercher"
          id="input-with-sx"
          onChange={handleSearch}
        />
      </div>

      <DataGrid
        rows={user}
        columns={columns}
        pageSize={5}
        components={{
          Toolbar: GridToolbar,
        }}
        getRowId={getRowId}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Do you really want to delete this user?"}
        </DialogTitle>
        <DialogActions>
          
            <Button
              variant="contained"
              color="error"
              onClick={() => { handleSupprimerUser(deleteUserId) }}>Delete</Button>
         
          <Link to='/Manage_Users' style={{ textDecoration: 'none' }}>
            <Button variant="contained" onClick={handleCloseDeleteDialog}>Cancel</Button>
          </Link>
        </DialogActions>
      </Dialog>

      <Modal open={editUserId !== null} onClose={handleCloseEdit}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 2, textAlign: 'center', marginY: '20px' }}>
            Edit User Information 
            </Typography>
       <Grid container spacing={3}>
  <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="Username"
            value={editValues.name}
            onChange={(e) =>
              setEditValues({ ...editValues, name: e.target.value })
            }
          />
          </Grid>
          <Grid item xs={12}>
    <FormControl fullWidth variant="outlined">
      <InputLabel 
      htmlFor="outlined-adornment-password"
      value={editValues.password}
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
        onChange={(e) => setEditValues({ ...editValues, password: e.target.value })} 
      />
    </FormControl>
  </Grid>
  <Grid item xs={12} >    
      <FormControl fullWidth variant="outlined">
        <InputLabel >Role</InputLabel>
        <Select
          value={editValues.role}
          label="Role"
          onChange={(e) => setEditValues({ ...editValues, role: e.target.value })}>
          <MenuItem value={'Administrator'}>Administrator</MenuItem>
          <MenuItem value={'Experimentator'}>Experimentator</MenuItem>
        </Select>
      </FormControl>
      </Grid>
</Grid>

<Grid item xs={12} sx={{ mt: 2 }}> 
  <Grid container spacing={3} alignItems="center">
    <Grid item xs={6}>
    <Button fullWidth
        variant="contained"
        onClick={handleCloseEdit}>Cancel</Button>
          </Grid>
    <Grid item xs={6}>
      <Button
        fullWidth
        variant="contained"
        onClick={handleEditUser}
        >
            Edit
          </Button>
          </Grid>
          </Grid>
          </Grid>
        </Box>
      </Modal>

      
      </div>
      <Dashboard user={user} setUsers={setUsers} />
    </div>
  );
};

export default UserList;