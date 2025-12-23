import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Navbar() {
  const { isAuthed, state, logout } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to={isAuthed ? "/contacts" : "/"}>          
          <span class="fw-light">CONT</span>ACT
        </Link>

        <div className="ms-auto d-flex align-items-center gap-2">
          {isAuthed ? (
            <>
              <span className="text-white d-none d-md-inline">
               <span class="fw-light">Halo,</span> {state.session?.email}
              </span>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => {
                  logout();
                  nav("/login");
                }}
              >
                <i className="fa-solid fa-right-from-bracket me-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-light btn-sm" to="/login">
                Login
              </Link>
              <Link className="btn btn-warning btn-sm" to="/register">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
