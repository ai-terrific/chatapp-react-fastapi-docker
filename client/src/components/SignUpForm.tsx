import React, { useState } from "react";
import { Box, TextField, Button, Alert } from "@mui/material";
import { signUp } from "../services/api";
import { socketService } from "../services/socket";
import { SignUpRequest } from "../types";

interface SignUpFormProps {
  onSignUpSuccess: (username: string, email: string, token: string) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUpSuccess }) => {
  const [formData, setFormData] = useState<SignUpRequest>({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signUp(formData);
      socketService.connect();
      const loginResult = await socketService.login(
        formData.email,
        formData.password,
      );
      if (!loginResult.success || !loginResult.token) {
        setError(loginResult.error || "Account created, but sign-in failed.");
        return;
      }
      onSignUpSuccess(
        loginResult.username || formData.username,
        loginResult.email || formData.email,
        loginResult.token,
      );
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { detail?: string | Array<{ msg: string }> } };
      };
      if (axiosErr.response?.data?.detail) {
        const detail = axiosErr.response.data.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((d) => d.msg).join(", "));
        } else {
          setError(detail);
        }
      } else {
        setError("Failed to sign up. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
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
        <TextField
          fullWidth
          label="Confirm Password"
          name="confirm_password"
          type="password"
          value={formData.confirm_password}
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
          {loading ? "Signing up..." : "Sign Up & Join Chat"}
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpForm;
