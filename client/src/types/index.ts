export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  username: string;
  email: string;
}

export interface ConnectedUser {
  id?: string | number;
  username: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}
