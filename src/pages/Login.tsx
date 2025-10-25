import React, { useState, useEffect } from "react";
import { Container, Paper, Typography, Box, TextField, Button } from "@mui/material";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { login, userRole, currentUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
     
    } catch (err) {
      alert("Login failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (currentUser && userRole) {
      navigate(userRole === "admin" ? "/admin" : "/employee");
    }
  }, [userRole, currentUser, navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 15 }}>
      <Paper elevation={4} sx={{ p: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Expense Tracker
        </Typography>
        <Box mt={4} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
