import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { validateUser } from "../utils/validators.js";

export default function UserForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { state, createUser, updateUser } = useAuth();

  const existing = useMemo(() => {
    if (!isEdit) return null;
    return state.users.find((u) => u.id === id) || null;
  }, [state.users, id, isEdit]);

  const [form, setForm] = useState(() => {
    if (existing) return { email: existing.email, role: existing.role || "user", password: "" };
    return { email: "", role: "user", password: "" };
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existing) setForm({ email: existing.email, role: existing.role || "user", password: "" });
  }, [existing]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const v = validateUser({ ...form, isEdit });
    setErrors(v);
    if (Object.keys(v).length) return;

    if (isEdit) {
      const res = await updateUser(id, {
        email: form.email,
        role: form.role,
        ...(form.password ? { password: form.password } : {}),
      });
      if (res.ok) nav("/users");
    } else {
      const res = await createUser({
        email: form.email,
        password: form.password,
        role: form.role,
      });
      if (res.ok) nav("/users");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-0">{isEdit ? "Edit User" : "Tambah User"}</h4>
          <div className="text-muted">
            {isEdit ? "Ubah email, role, dan password (opsional) dari akun user-login." : "Buat akun user baru untuk user-login."}
          </div>
        </div>

        <Link className="btn btn-outline-secondary" to="/users">
          Kembali
        </Link>
      </div>

      {state.error ? <div className="alert alert-danger">{state.error}</div> : null}

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm rounded-4">
            <div className="card-body p-4">
              <form onSubmit={onSubmit} className="d-grid gap-3">
                <div>
                  <label className="form-label">Email</label>
                  <input
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="user@email.com"
                  />
                  {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
                </div>

                <div>
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Password {isEdit ? <span className="text-muted">(opsional)</span> : null}
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={isEdit ? "Isi jika ingin ganti password" : "Password minimal 6 karakter"}
                  />
                  {errors.password ? <div className="invalid-feedback">{errors.password}</div> : null}
                </div>

                <button className="btn btn-dark" disabled={state.loading}>
                  {state.loading ? (
                    <Spinner label={isEdit ? "Menyimpan..." : "Membuat..."} />
                  ) : (
                    "Simpan"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
