import { io, Socket } from "socket.io-client";
import { ConnectedUser } from "../types";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5050";

class SocketService {
  private socket: Socket | null = null;
  private currentUser: string | null = null;
  private accessToken: string | null = null;

  private getSessionToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    const token =
      window.localStorage.getItem("access_token") ??
      window.sessionStorage.getItem("access_token");
    if (token) {
      return token;
    }

    try {
      const storedUser = window.localStorage.getItem("chatapp-user");
      return storedUser
        ? ((JSON.parse(storedUser) as { token?: string }).token ?? null)
        : null;
    } catch {
      return null;
    }
  }

  private saveSessionToken(token: string): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("access_token", token);
    this.accessToken = token;
  }

  private clearSessionToken(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem("access_token");
    window.sessionStorage.removeItem("access_token");
    this.accessToken = null;
  }

  connect(): void {
    if (this.socket) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: (cb) => {
        const token = this.getSessionToken();
        cb(token ? { token } : {});
      },
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to socket server");

      if (this.getSessionToken()) {
        this.socket?.emit("get-connected-users");
      }
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  login(
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    error?: string;
    username?: string;
    email?: string;
    token?: string;
  }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        this.connect();
      }

      const socket = this.socket;
      if (!socket) {
        resolve({ success: false, error: "Unable to connect" });
        return;
      }

      const timeout = window.setTimeout(() => {
        socket.off("sign-in-result", handleResult);
        resolve({ success: false, error: "Login timeout" });
      }, 10000);

      const handleResult = (data: {
        success: boolean;
        error?: string;
        message?: string;
        access_token?: string;
        user?: { username?: string; email?: string };
      }) => {
        window.clearTimeout(timeout);
        const user = data.user as
          | { username?: string; email?: string }
          | undefined;
        this.currentUser = user?.username || email;

        if (data.success && data.access_token) {
          this.saveSessionToken(data.access_token);
          this.socket?.emit("get-connected-users");
        }

        resolve({
          success: data.success,
          error: data.error || data.message,
          username: user?.username || email,
          email: user?.email || email,
          token: data.access_token,
        });
      };

      socket.once("sign-in-result", handleResult);
      socket.emit("sign-in", { email, password });
    });
  }

  getConnectedUsers(): Promise<ConnectedUser[]> {
    return new Promise((resolve) => {
      if (!this.socket) {
        this.connect();
      }
      const socket = this.socket;
      if (!socket) return resolve([]);

      const requestUsers = () => {
        socket.once(
          "connected-users",
          (
            users:
              | Array<{ id?: string | number; username: string }>
              | undefined,
          ) => {
            const mappedUsers = (users ?? []).map((user) => ({
              id: user.id,
              username: user.username,
              isOnline: true,
            }));
            console.log(mappedUsers);
            resolve(mappedUsers);
          },
        );

        socket.emit("get-connected-users");
      };

      if (!socket.connected) {
        socket.once("connect", requestUsers);
      } else {
        requestUsers();
      }

      window.setTimeout(() => {
        resolve([]);
      }, 5000);
    });
  }

  getMessages(): Promise<
    Array<{ id: string; username: string; text: string; timestamp?: string }>
  > {
    console.log("Get messages.............");
    return new Promise((resolve) => {
      if (!this.socket) {
        this.connect();
      }
      const socket = this.socket;
      if (!socket) return resolve([]);

      const requestMessages = () => {
        socket.once("messages", (messages) => resolve(messages ?? []));
        socket.emit("messages");
      };

      if (!socket.connected) {
        socket.once("connect", requestMessages);
      } else {
        requestMessages();
      }

      window.setTimeout(() => resolve([]), 5000);
    });
  }

  onUsersUpdate(callback: (users: ConnectedUser[]) => void): void {
    if (this.socket) {
      this.socket.on(
        "connected-users",
        (
          users: Array<{ id?: string | number; username: string }> | undefined,
        ) => {
          const mappedUsers = (users ?? []).map((user) => ({
            id: user.id,
            username: user.username,
            isOnline: true,
          }));
          callback(mappedUsers);
        },
      );
    }
  }

  sendMessage(text: string): void {
    if (this.socket) {
      this.socket.emit("message", { text });
    }
  }

  onMessage(
    callback: (data: {
      id?: string;
      username: string;
      text: string;
      timestamp?: string;
    }) => void,
  ): void {
    if (this.socket) {
      this.socket.on("message", callback);
    }
  }

  getCurrentUser(): string | null {
    return this.currentUser;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUser = null;
    }
  }

  logout(): void {
    this.clearSessionToken();
    this.disconnect();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("chatapp-user");
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
export default socketService;
