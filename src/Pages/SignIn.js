import React, { useEffect  } from 'react';
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import Logo from "../Images/CERIST.png";
import axios from 'axios'; 
import { useNavigate  } from "react-router-dom";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const theme = createTheme({
  palette: {
    primary: {
      light: "#64b5f6", 
      main: "#1A3867", 
      dark: "#1976d2", 
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000",
    },
  },
});

export const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [role, setRole] = useState(""); 

  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    if (storedUsername && storedRole) {
      navigate('/Dashboard');
      console.log(storedUsername);
      console.log(storedRole);
    } 
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/pythonlogin/', {
        username: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(response.data);
      if (response.data.message === 'Logged in successfully!') {
        // Stocker le nom d'utilisateur et le rôle dans le localStorage
        localStorage.setItem('username', username);
        localStorage.setItem('role', response.data.role);
        const userRole = response.data.role;
        if (userRole === 'Administrator') {
          navigate('/Interface');
        } else if (userRole === 'Experimentator') {
          navigate('/Home');
        }
      } else {
        setError('Incorrect username/password!');
      }

    } catch (error) {
      console.error("Error:", error.response.data.message);
      setError(error.response.data.message); 
    }
  };
  
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
            `url(${Logo})`,
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "contain",
            backgroundPosition: "center",
          }}
        />
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
          sx={{
            display: "flex",
            justifyContent: "center",
            bgcolor: "primary.main",
          }}
        >
          <Box
            sx={{
              marginTop: 20,
              boxShadow: 2,
              width: 0.8,
              backgroundColor: "white",
              padding: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: "10px",
              height: 0.6,
            }}
          >
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit} 
              sx={{ mt: 1 }}
            >
              <TextField
                value={username}
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="usename"
                autoComplete="usename"
                autoFocus
                size="medium"
                onChange={(e) => setUsername(e.target.value)}
              />
              <FormControl fullWidth variant="outlined" required>
              <InputLabel 
              htmlFor="outlined-adornment-password"
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
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              />
              </FormControl>
              {error && <Typography color="error">{error}</Typography>} {/* Display error message */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="medium"
                sx={{
                  mt: 3,
                  mb: 2,
                  ":hover": {
                    bgcolor: "primary.main",
                    color: "white",
                  },
                }}
              >
                Sign In
              </Button>

            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default SignIn;