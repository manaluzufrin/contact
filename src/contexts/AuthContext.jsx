import React, { createContext, useContext, useMemo, useReducer } from "react";
import { storage } from "../utils/storage.js";

const AuthContext = createContext(null);

const LS_USERS = "spa_users";
const LS_SESSION = "spa_session";

const initialState = {
  users: storage.get(LS_USERS, []),
  session: storage.get(LS_SESSION, null), 
  loading: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "ERROR":
      return { ...state, loading: false, error: action.payload || "Terjadi kesalahan." };
    case "REGISTER_SUCCESS": {
      const users = action.payload.users;
      storage.set(LS_USERS, users);
      return { ...state, users, loading: false, error: null };
    }
    case "LOGIN_SUCCESS": {
      const session = action.payload.session;
      storage.set(LS_SESSION, session);
      return { ...state, session, loading: false, error: null };
    }
    case "LOGOUT": {
      storage.remove(LS_SESSION);
      return { ...state, session: null, loading: false, error: null };
    }
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const api = useMemo(() => {
    return {
      state,
      isAuthed: !!state.session,

      async register({ email, password }) {
        dispatch({ type: "LOADING" });
        await new Promise((r) => setTimeout(r, 500));

        const exists = state.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          dispatch({ type: "ERROR", payload: "Email sudah terdaftar." });
          return { ok: false };
        }

        const newUser = { id: crypto.randomUUID(), email, password };
        const users = [...state.users, newUser];
        dispatch({ type: "REGISTER_SUCCESS", payload: { users } });
        return { ok: true };
      },

      async login({ email, password }) {
        dispatch({ type: "LOADING" });
        await new Promise((r) => setTimeout(r, 500));

        const user = state.users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!user) {
          dispatch({ type: "ERROR", payload: "Email atau password salah." });
          return { ok: false };
        }

        const session = { userId: user.id, email: user.email };
        dispatch({ type: "LOGIN_SUCCESS", payload: { session } });
        return { ok: true };
      },

      logout() {
        dispatch({ type: "LOGOUT" });
      },
    };
  }, [state]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
