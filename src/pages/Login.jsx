import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";
import { validateLogin } from "../utils/validators.js";

export default function Login() {
  const nav = useNavigate();
  const { state, login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validateLogin(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    const res = await login(form);
    if (res.ok) nav("/contacts");
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="card shadow-sm rounded-4">
            <div className="card-body p-4">
              <h4 className="mb-3">Login</h4>

              {state.error ? <div className="alert alert-danger">{state.error}</div> : null}

              <form onSubmit={onSubmit} className="d-grid gap-3">
                <div>
                  <label className="form-label">Email</label>
                  <input
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@email.com"
                  />
                  {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Password"
                  />
                  {errors.password ? <div className="invalid-feedback">{errors.password}</div> : null}
                </div>

                <button className="btn btn-dark" disabled={state.loading}>
                  {state.loading ? <Spinner label="Masuk..." /> : "Login"}
                </button>

                <div className="text-small">
                  Belum punya akun? <Link to="/register">Daftar</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
