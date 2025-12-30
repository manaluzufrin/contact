import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Navbar() {
  const { isAuthed, state, logout, isAdmin } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to={isAuthed ? "/contacts" : "/"}>
          <span className="fw-light">CONT</span>ACT
        </Link>

        {isAuthed ? (
          <div className="collapse navbar-collapse show">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/contacts">
                  <i className="fa-regular fa-address-book me-2" /> Contacts
                </Link>
              </li>
              {isAdmin ? (
                <li className="nav-item">
                  <Link className="nav-link" to="/users">
                    <i className="fa-solid fa-users-gear me-2" /> Users
                  </Link>
                </li>
              ) : null}
              <li className="nav-item">
                <Link className="nav-link" to="/profile">
                  <i className="fa-regular fa-user me-2" /> Profile
                </Link>
              </li>
            </ul>
          </div>
        ) : null}

        <div className="ms-auto d-flex align-items-center gap-2">
          {isAuthed ? (
            <>
              <span className="text-white d-none d-md-inline">
                <span className="fw-light">Halo,</span> {state.session?.email}
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
