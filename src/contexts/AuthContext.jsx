import React, { createContext, useContext, useMemo, useReducer } from "react";
import { storage } from "../utils/storage.js";

const AuthContext = createContext(null);

const LS_USERS = "spa_users";
const LS_SESSION = "spa_session";

// Default admin
const DEFAULT_ADMIN = {
  email: "root@local.host",
  password: "password",
  role: "admin",
};

function seedUsers(existingUsers) {
  const users = Array.isArray(existingUsers) ? existingUsers : [];
  if (users.length) return users;
  return [
    {
      id: crypto.randomUUID(),
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
      role: DEFAULT_ADMIN.role,
      createdAt: new Date().toISOString(),
    },
  ];
}

const initialState = {
  users: seedUsers(storage.get(LS_USERS, [])),
  session: storage.get(LS_SESSION, null),
  loading: false,
  error: null,
};

storage.set(LS_USERS, initialState.users);

function safeSession(session, users) {
  if (!session?.userId) return null;
  const u = users.find((x) => x.id === session.userId);
  if (!u) return null;
  return { userId: u.id, email: u.email, role: u.role };
}

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
    case "USERS_UPDATED": {
      const users = action.payload.users;
      storage.set(LS_USERS, users);
      const nextSession = safeSession(state.session, users);
      if (state.session && !nextSession) storage.remove(LS_SESSION);
      else storage.set(LS_SESSION, nextSession);
      return { ...state, users, session: nextSession, loading: false, error: null };
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
    const currentUser = state.session?.userId
      ? state.users.find((u) => u.id === state.session.userId) || null
      : null;

    const isAdmin = currentUser?.role === "admin";

    return {
      state,
      isAuthed: !!state.session,
      currentUser,
      isAdmin,

      async register({ email, password }) {
        dispatch({ type: "LOADING" });
        await new Promise((r) => setTimeout(r, 500));

        const exists = state.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          dispatch({ type: "ERROR", payload: "Email sudah terdaftar." });
          return { ok: false };
        }

        const newUser = {
          id: crypto.randomUUID(),
          email,
          password,
          role: "user",
          createdAt: new Date().toISOString(),
        };
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

        const session = { userId: user.id, email: user.email, role: user.role };
        dispatch({ type: "LOGIN_SUCCESS", payload: { session } });
        return { ok: true };
      },

      async createUser({ email, password, role }) {
        dispatch({ type: "LOADING" });
        await new Promise((r) => setTimeout(r, 300));

        if (!isAdmin) {
          dispatch({ type: "ERROR", payload: "Tidak punya akses." });
          return { ok: false };
        }

        const exists = state.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          dispatch({ type: "ERROR", payload: "Email sudah terdaftar." });
          return { ok: false };
        }

        const newUser = {
          id: crypto.randomUUID(),
          email,
          password,
          role: role || "user",
          createdAt: new Date().toISOString(),
        };

        const users = [...state.users, newUser];
        dispatch({ type: "USERS_UPDATED", payload: { users } });
        return { ok: true };
      },

      async updateUser(userId, patch) {
        dispatch({ type: "LOADING" });
        await new Promise((r) => setTimeout(r, 300));

        if (!isAdmin) {
          dispatch({ type: "ERROR", payload: "Tidak punya akses." });
          return { ok: false };
        }

        const users = state.users.map((u) => {
          if (u.id !== userId) return u;
          return {
            ...u,
            email: patch.email ?? u.email,
            role: patch.role ?? u.role,
            password: patch.password ? patch.password : u.password,
            updatedAt: new Date().toISOString(),
          };
        });

        dispatch({ type: "USERS_UPDATED", payload: { users } });
        return { ok: true };
      },

      async deleteUser(userId) {
        dispatch({ type: "LOADING" });
        await new Promise((r) => setTimeout(r, 300));

        if (!isAdmin) {
          dispatch({ type: "ERROR", payload: "Tidak punya akses." });
          return { ok: false };
        }
        if (state.session?.userId === userId) {
          dispatch({ type: "ERROR", payload: "Tidak bisa menghapus akun yang sedang login." });
          return { ok: false };
        }

        const users = state.users.filter((u) => u.id !== userId);
        dispatch({ type: "USERS_UPDATED", payload: { users } });
        return { ok: true };
      },

      async changeMyPassword({ oldPassword, newPassword }) {
        dispatch({ type: "LOADING" });
        await new Promise((r) => setTimeout(r, 300));

        const me = currentUser;
        if (!me) {
          dispatch({ type: "ERROR", payload: "Silakan login dulu." });
          return { ok: false };
        }
        if (me.password !== oldPassword) {
          dispatch({ type: "ERROR", payload: "Password lama salah." });
          return { ok: false };
        }

        const users = state.users.map((u) =>
          u.id === me.id
            ? { ...u, password: newPassword, updatedAt: new Date().toISOString() }
            : u
        );
        dispatch({ type: "USERS_UPDATED", payload: { users } });
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
