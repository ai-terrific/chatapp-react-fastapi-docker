import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { ChatMessage } from "../types";

interface ChatContentProps {
  username: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  roomName: string;
  isDarkMode: boolean;
}

const ChatContent: React.FC<ChatContentProps> = ({
  username,
  messages,
  onSendMessage,
  roomName,
  isDarkMode,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const bgColor = isDarkMode ? "#1e1e1e" : "#f5f5f5";
  const headerBg = isDarkMode ? "#2a2a2a" : "white";
  const inputBg = isDarkMode ? "#2a2a2a" : "white";
  const borderColor = isDarkMode ? "rgba(255,255,255,0.1)" : "#e0e0e0";

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: bgColor,
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: headerBg,
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar sx={{ bgcolor: "#667eea", width: 40, height: 40 }}>#</Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {roomName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            General chat room
          </Typography>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {messages.length === 0 && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary" variant="body1">
              No messages yet. Start the conversation! 🎉
            </Typography>
          </Box>
        )}

        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              justifyContent: msg.isOwn ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: 1,
            }}
          >
            {!msg.isOwn && (
              <Avatar
                sx={{
                  bgcolor: "#764ba2",
                  width: 32,
                  height: 32,
                  fontSize: "0.8rem",
                }}
              >
                {msg.username.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                px: 2,
                maxWidth: "60%",
                bgcolor: msg.isOwn
                  ? "#667eea"
                  : isDarkMode
                    ? "#3a3a3a"
                    : "white",
                color: msg.isOwn ? "white" : "text.primary",
                borderRadius: "12px",
                borderBottomRightRadius: msg.isOwn ? "0px" : "12px",
                borderBottomLeftRadius: msg.isOwn ? "12px" : "0px",
              }}
            >
              {!msg.isOwn && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#764ba2",
                    display: "block",
                    mb: 0.5,
                    fontWeight: "bold",
                  }}
                >
                  {msg.username}
                </Typography>
              )}
              <Typography variant="body2">{msg.text}</Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                  display: "block",
                  mt: 0.5,
                  textAlign: "right",
                }}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Paper>
            {msg.isOwn && (
              <Avatar
                sx={{
                  bgcolor: "#667eea",
                  width: 32,
                  height: 32,
                  fontSize: "0.8rem",
                }}
              >
                {msg.username.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          bgcolor: inputBg,
          borderTop: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: isDarkMode ? "#333" : "#f5f5f5",
            },
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!inputText.trim()}
          sx={{
            bgcolor: "#667eea",
            color: "white",
            width: 44,
            height: 44,
            "&:hover": { bgcolor: "#5a6fd6" },
            "&.Mui-disabled": { bgcolor: "#e0e0e0", color: "#9e9e9e" },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatContent;
