import React, { useState } from "react";
import Spinner from "../components/Spinner.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { validateChangePassword } from "../utils/validators.js";

export default function Profile() {
  const { state, currentUser, changeMyPassword } = useAuth();

  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    const v = validateChangePassword(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    const res = await changeMyPassword(form);
    if (res.ok) {
      setSuccess("Password berhasil diubah.");
      setForm({ oldPassword: "", newPassword: "" });
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h4 className="mb-0">Profile Setting</h4>
              <div className="text-muted">Pengaturan akun-login profile.</div>
            </div>
          </div>

          {state.error ? <div className="alert alert-danger">{state.error}</div> : null}
          {success ? <div className="alert alert-success">{success}</div> : null}

          <div className="card shadow-sm rounded-4 mb-3">
            <div className="card-body p-4">
              <div className="mb-2">
                <div className="text-muted">Email</div>
                <div className="fw-semibold">{currentUser?.email}</div>
              </div>
              <div>
                <div className="text-muted">Role</div>
                <span
                  className={`badge ${currentUser?.role === "admin" ? "bg-danger" : "bg-success"}`}
                >
                  {currentUser?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="card shadow-sm rounded-4">
            <div className="card-body p-4">
              <h5 className="mb-3">Ganti Password</h5>

              <form onSubmit={onSubmit} className="d-grid gap-3">
                <div>
                  <label className="form-label">Password Lama</label>
                  <input
                    type="password"
                    className={`form-control ${errors.oldPassword ? "is-invalid" : ""}`}
                    value={form.oldPassword}
                    onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                    placeholder="Password lama"
                  />
                  {errors.oldPassword ? (
                    <div className="invalid-feedback">{errors.oldPassword}</div>
                  ) : null}
                </div>

                <div>
                  <label className="form-label">Password Baru</label>
                  <input
                    type="password"
                    className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    placeholder="Minimal 6 karakter"
                  />
                  {errors.newPassword ? (
                    <div className="invalid-feedback">{errors.newPassword}</div>
                  ) : null}
                </div>

                <button className="btn btn-dark" disabled={state.loading}>
                  {state.loading ? <Spinner label="Menyimpan..." /> : "Simpan"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
