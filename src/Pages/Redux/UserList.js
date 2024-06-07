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
import Avatar from '@mui/material/Avatar';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

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
    { field: 'Avatar', headerName: 'Avatar', width: 90, renderCell: (params) => (
      <div>
          <Avatar sx={{ bgcolor: '#3399FF' }}>{params.row.name.charAt(0)}</Avatar>
      </div>
    
   ), },
    { field: 'id', headerName: 'ID', width: 300 },
    { field: 'name', headerName: 'Username', width: 200},
    { field: 'role', headerName: 'Role', width: 180 },
    {
      field: 'actions',
      headerName: 'Action',
      sortable: false,
      width: 300,
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
        const usersData = await getUsers(); 
        const formattedUsers = usersData.map(user => ({
          id: user[0], 
          name: user[1], 
          password: user[2], 
          role: user[3],
        }));
        setUsers(formattedUsers);
        console.log(formattedUsers);
        console.log('user', user);
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
      <div style={{width: '100%',
                margin: 'auto',
                marginTop: '80px',
                float: 'right'}}> 
<Box sx={{width: '80%', float: 'right'}}>
      <DataGrid
        rows={user}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 7,
            },
          },
        }}
        pageSizeOptions={[7]}
        components={{
          Toolbar: GridToolbar,
        }}
        getRowId={getRowId}
      />
</Box>
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Do you really want to delete this user?"}
        </DialogTitle>
        <DialogContent>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
        {user.find(u => u.id === deleteUserId)?.name}
      </Typography>
        </DialogContent>
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
        value={editValues.password}
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