import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Alert } from "@mui/material";
import { socketService } from "../services/socket";
import { LoginRequest } from "../types";

interface LoginPageProps {
  onLoginSuccess: (username: string, email?: string, token?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socketService.isConnected()) {
      socketService.connect();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await socketService.login(
        formData.email,
        formData.password,
      );
      if (result.success) {
        onLoginSuccess(
          result.username || formData.email,
          result.email || formData.email,
          result.token,
        );
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
          autoFocus
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            mt: 3,
            py: 1.5,
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "1rem",
          }}
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
