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
                marginTop: 26,
                boxShadow: 2,
                width: 0.8,
                backgroundColor: "white",
                padding: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: "10px",
                height: 0.5,
              }}
            >
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>
              <Box
                component="form"
                noValidate
                sx={{ mt: 1 }}
              >
                <TextField
                  value={username}
                  margin="normal"
                  required
                  fullWidth
                  id="usename"
                  label="username"
                  name="usename"
                  autoComplete="usename"
                  autoFocus
                  size="medium"
                  onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  value={password}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  size="medium"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="medium"
                  sx={{
                    mt: 3,
                    mb: 2,
                    ":hover": {
                      bgcolor: "primary.main", // theme.palette.primary.main
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
  }

export default SignIn;
