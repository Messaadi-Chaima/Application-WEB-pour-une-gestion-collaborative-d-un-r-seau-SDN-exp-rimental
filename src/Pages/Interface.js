import {
  AppBar,
  Button,
  Card,
  CardContent,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from 'axios';

const buttonsStyle = {
  m: 3,
  p: 2,
};
const mdTheme = createTheme({
  palette: {
    primary: {
      main: "#1A3867",
      dark: "#036c9e",
      contrastText: "#fff",
    },
  },
});
export const Interface = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/pythonlogin/logout');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      if (response.data.message === 'Logged out successfully!') {
        navigate('/');
      }
      console.log(response.data);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const storedUsername = localStorage.getItem('username');
    return (
      <ThemeProvider theme={mdTheme}>
        <AppBar position="absolute" sx={{ mb: 3 }}>
          <Toolbar>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Accueil
            </Typography>

            <AccountCircleIcon />
            <Typography sx={{ ml: 1 }}>{storedUsername}</Typography>
            <IconButton sx={{ mx: 2 }} onClick={logout} >
              <LogoutIcon style={{ color: "white", mx: 2 }} />
              <Typography sx={{ color: "white", mx: 1 }}>log out</Typography>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Typography sx={{ mt: 15, textAlign: "center" }} variant="h3">
        Mininet Editor
        </Typography>
        <Card sx={{ mx: 20, my: 8 }}>
          <CardContent
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              sx={buttonsStyle}
              onClick={() => navigate("/Dashboard")}
            >
              <DashboardIcon />
              <Typography sx={{ ml: 2 }}>Dashboard</Typography>
            </Button>
              <>
                <Button
                  variant="contained"
                  sx={buttonsStyle}
                  onClick={() => navigate("/Manage_Users")}
                >
                  <SettingsIcon />
                  <Typography sx={{ ml: 2 }}>New Account</Typography>
                </Button>
                <Button
                  variant="contained"
                  sx={buttonsStyle}
                  onClick={() => navigate("/Manage_Users")}
                >
                  <PersonIcon style={{ color: "#fff" }} />
                  <Typography sx={{ ml: 2 }}>Manage Users</Typography>
                </Button>
              </>
          </CardContent>
        </Card>
      </ThemeProvider>
    );
};
export default Interface;
