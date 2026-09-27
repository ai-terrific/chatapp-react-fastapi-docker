import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  username: string;
  email: string;
  token: string;
}

interface UserState {
  user: UserProfile | null;
}

const STORAGE_KEY = "chatapp-user";

const loadUserFromStorage = (): UserProfile | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = window.localStorage.getItem(STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as UserProfile) : null;
  } catch {
    return null;
  }
};

const persistUser = (user: UserProfile | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

const initialState: UserState = {
  user: loadUserFromStorage(),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      persistUser(action.payload);
    },
    clearUser: (state) => {
      state.user = null;
      persistUser(null);
    },
    updateUser: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (!state.user) {
        return;
      }

      state.user = {
        ...state.user,
        ...action.payload,
      };

      persistUser(state.user);
    },
  },
});

export const { setUser, clearUser, updateUser } = userSlice.actions;

export default userSlice.reducer;
