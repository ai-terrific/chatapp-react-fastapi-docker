import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Sidebar from "./Sidebar";
import ChatContent from "./ChatContent";
import { ChatMessage, ConnectedUser } from "../types";
import { socketService } from "../services/socket";

interface ChatPageProps {
  username: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({
  username,
  isDarkMode,
  onToggleTheme,
  onLogout,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  const refreshMessages = useCallback(() => {
    socketService.getMessages().then((history) => {
      const restoredMessages = history.map((message) => ({
        ...message,
        timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
        isOwn: message.username === username,
      }));
      setMessages((previous) => {
        const restoredIds = new Set(
          restoredMessages.map((message) => message.id),
        );
        return [
          ...restoredMessages,
          ...previous.filter((message) => !restoredIds.has(message.id)),
        ];
      });
    });
  }, [username]);

  useEffect(() => {
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    socketService.onUsersUpdate(setConnectedUsers);
    socketService.onMessage(
      (data: {
        id?: string;
        username: string;
        text: string;
        timestamp?: string;
      }) => {
        const newMessage: ChatMessage = {
          id:
            data.id ||
            Date.now().toString() + Math.random().toString(36).slice(2),
          username: data.username,
          text: data.text,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          isOwn: data.username === username,
        };
        console.log(newMessage);
        setMessages((previous) =>
          previous.some((message) => message.id === newMessage.id)
            ? previous
            : [...previous, newMessage],
        );
      },
    );

    socketService.getConnectedUsers().then(setConnectedUsers);
    refreshMessages();

    return () => {
      socketService.disconnect();
    };
  }, [username]);

  const handleSendMessage = useCallback((text: string) => {
    socketService.sendMessage(text);
  }, []);

  const sidebarContent = (
    <Sidebar
      username={username}
      connectedUsers={connectedUsers}
      isDarkMode={isDarkMode}
      onToggleTheme={onToggleTheme}
      onLogout={onLogout}
    />
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Desktop Sidebar */}
      {!isMobile && sidebarContent}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
      >
        {/* Mobile Top Bar */}
        {isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 1,
              py: 0.5,
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <IconButton onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Box
                component="span"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              >
                General Chat
              </Box>
            </Box>
            <IconButton onClick={onToggleTheme}>
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        )}

        <ChatContent
          username={username}
          messages={messages}
          onSendMessage={handleSendMessage}
          roomName="General Chat"
          isDarkMode={isDarkMode}
        />
      </Box>
    </Box>
  );
};

export default ChatPage;
