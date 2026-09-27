import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import { ConnectedUser } from "../types";

interface SidebarProps {
  username: string;
  connectedUsers: ConnectedUser[];
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  username,
  connectedUsers,
  isDarkMode,
  onToggleTheme,
  onLogout,
}) => {
  const sidebarBg = isDarkMode ? "#1a1a2e" : "#2c2c54";

  return (
    <Box
      sx={{
        width: 280,
        minWidth: 280,
        height: "100%",
        bgcolor: sidebarBg,
        color: "white",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "#667eea", width: 36, height: 36 }}>
          {username.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {username}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Active user
          </Typography>
        </Box>
        <IconButton
          onClick={onToggleTheme}
          sx={{
            color: "white",
            bgcolor: "rgba(255,255,255,0.1)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
          }}
          size="small"
        >
          {isDarkMode ? (
            <Brightness7Icon fontSize="small" />
          ) : (
            <Brightness4Icon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* Connected Users */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: "rgba(255,255,255,0.5)", fontWeight: "bold" }}
        >
          Online Users ({connectedUsers.length})
        </Typography>
      </Box>

      <List sx={{ flex: 1, overflow: "auto", px: 1 }}>
        {connectedUsers.length === 0 ? (
          <Box sx={{ px: 1, py: 2 }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              No other users online right now.
            </Typography>
          </Box>
        ) : (
          connectedUsers.map((user) => (
            <ListItem
              key={user.id ? String(user.id) : user.username}
              sx={{
                borderRadius: "8px",
                mb: 0.5,
                bgcolor:
                  user.username === username
                    ? "rgba(102, 126, 234, 0.2)"
                    : "transparent",
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: "#4caf50",
                    width: 32,
                    height: 32,
                    fontSize: "0.9rem",
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "white",
                        fontWeight:
                          user.username === username ? "bold" : "normal",
                      }}
                    >
                      {user.username}
                      {user.username === username && " (You)"}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: user.isOnline ? "#4caf50" : "#757575",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {user.isOnline ? "Online" : "Offline"}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))
        )}
      </List>

      {/* Footer */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
      <Box sx={{ p: 2 }}>
        <IconButton
          onClick={onLogout}
          sx={{
            color: "white",
            bgcolor: "rgba(244, 67, 54, 0.2)",
            "&:hover": { bgcolor: "rgba(244, 67, 54, 0.3)" },
            width: "100%",
          }}
        >
          <LogoutIcon />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Logout
          </Typography>
        </IconButton>
      </Box>
    </Box>
  );
};

export default Sidebar;
