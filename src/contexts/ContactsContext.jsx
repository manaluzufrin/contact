import React, { createContext, useContext, useMemo, useReducer } from "react";
import { storage } from "../utils/storage.js";
import { useAuth } from "./AuthContext.jsx";

const ContactsContext = createContext(null);
const LS_CONTACTS = "spa_contacts"; 

const initialState = {
  data: storage.get(LS_CONTACTS, {}),
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "ERROR":
      return { ...state, loading: false, error: action.payload || "Terjadi kesalahan." };
    case "SET_DATA": {
      const data = action.payload;
      storage.set(LS_CONTACTS, data);
      return { ...state, data, loading: false, error: null };
    }
    default:
      return state;
  }
}

export function ContactsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { state: authState } = useAuth();

  const api = useMemo(() => {
    const userId = authState.session?.userId;

    const getList = () => {
      if (!userId) return [];
      return state.data[userId] || [];
    };

    const setList = (list) => {
      const next = { ...state.data, [userId]: list };
      dispatch({ type: "SET_DATA", payload: next });
    };

    return {
      state,
      getList,

      async create(contact) {
        dispatch({ type: "LOADING" });
        await new Promise((r) => setTimeout(r, 400));
        const list = getList();
        setList([{ ...contact, id: crypto.randomUUID() }, ...list]);
        return { ok: true };
      },

      async update(id, patch) {
        dispatch({ type: "LOADING" });
        await new Promise((r) => setTimeout(r, 400));
        const list = getList();
        const idx = list.findIndex((c) => c.id === id);
        if (idx === -1) {
          dispatch({ type: "ERROR", payload: "Kontak tidak ditemukan." });
          return { ok: false };
        }
        const next = [...list];
        next[idx] = { ...next[idx], ...patch };
        setList(next);
        return { ok: true };
      },

      async remove(id) {
        dispatch({ type: "LOADING" });
        await new Promise((r) => setTimeout(r, 300));
        const list = getList();
        setList(list.filter((c) => c.id !== id));
        return { ok: true };
      },

      findById(id) {
        return getList().find((c) => c.id === id) || null;
      },
    };
  }, [state.data, authState.session]);

  return <ContactsContext.Provider value={api}>{children}</ContactsContext.Provider>;
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within ContactsProvider");
  return ctx;
}
