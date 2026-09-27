import React, { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Provider, useDispatch, useSelector } from "react-redux";
import AuthPage from "./components/AuthPage";
import ChatPage from "./components/ChatPage";
import { store, RootState } from "./store/store";
import { setUser, clearUser } from "./store/userSlice";
import { socketService } from "./services/socket";

const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const username = user?.username ?? "";
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
          primary: {
            main: "#667eea",
          },
          secondary: {
            main: "#764ba2",
          },
          ...(isDarkMode
            ? {
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                },
              }
            : {
                background: {
                  default: "#f5f5f5",
                  paper: "#ffffff",
                },
              }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        shape: {
          borderRadius: 8,
        },
      }),
    [isDarkMode],
  );

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleAuthSuccess = (
    username: string,
    email?: string,
    token?: string,
  ) => {
    dispatch(
      setUser({
        username,
        email: email || username,
        token: token || "",
      }),
    );
  };

  const handleLogout = () => {
    socketService.logout();
    dispatch(clearUser());
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public auth route */}
          <Route
            path="/auth"
            element={
              user ? (
                <Navigate to="/chat" replace />
              ) : (
                <AuthPage
                  onAuthSuccess={handleAuthSuccess}
                  isDarkMode={isDarkMode}
                  onToggleTheme={handleToggleTheme}
                />
              )
            }
          />

          {/* Protected chat route - accessible by all authenticated users */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                {user && (
                  <ChatPage
                    username={username}
                    isDarkMode={isDarkMode}
                    onToggleTheme={handleToggleTheme}
                    onLogout={handleLogout}
                  />
                )}
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route
            path="/"
            element={<Navigate to={user ? "/chat" : "/auth"} replace />}
          />
          <Route
            path="*"
            element={<Navigate to={user ? "/chat" : "/auth"} replace />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
