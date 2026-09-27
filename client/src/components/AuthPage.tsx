import React, { useState } from "react";
import { Box, Typography, Paper, Tabs, Tab, IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LoginPage from "./LoginPage";
import SignUpForm from "./SignUpForm";

interface AuthPageProps {
  onAuthSuccess: (username: string, email?: string, token?: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  isDarkMode,
  onToggleTheme,
}) => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: isDarkMode
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      {/* Theme Toggle */}
      <IconButton
        onClick={onToggleTheme}
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          bgcolor: "rgba(255,255,255,0.15)",
          color: "white",
          "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
        }}
      >
        {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>

      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 420,
          borderRadius: "12px",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          💬 Chat App
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {tabValue === 0
            ? "Welcome back! Log in to continue"
            : "Create an account to start chatting"}
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          centered
          sx={{
            mb: 2,
            "& .MuiTab-root": { textTransform: "none", fontWeight: "bold" },
          }}
        >
          <Tab label="Log In" />
          <Tab label="Sign Up" />
        </Tabs>

        {tabValue === 0 ? (
          <LoginPage onLoginSuccess={onAuthSuccess} />
        ) : (
          <SignUpForm onSignUpSuccess={onAuthSuccess} />
        )}
      </Paper>
    </Box>
  );
};

export default AuthPage;
