import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function UsersList() {
  const { state, deleteUser, currentUser } = useAuth();

  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState({ open: false, user: null });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const users = [...state.users].sort((a, b) => {
      const ar = a.role === "admin" ? 0 : 1;
      const br = b.role === "admin" ? 0 : 1;
      if (ar !== br) return ar - br;
      return String(a.email).localeCompare(String(b.email));
    });

    if (!term) return users;
    return users.filter((u) =>
      [u.email, u.role].some((x) => String(x || "").toLowerCase().includes(term))
    );
  }, [state.users, q]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="mb-0">User Management</h4>
          <div className="text-muted">Kelola akun user-login.</div>
        </div>

        <div className="d-flex gap-2">
          <div className="input-group" style={{ maxWidth: 280 }}>
            <span className="input-group-text">
              <i className="fa fa-search"></i>
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Search email / role..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <Link className="btn btn-primary" to="/users/new" title="Tambah user">
            <i className="fa-solid fa-user-plus" />
          </Link>
        </div>
      </div>

      {state.error ? <div className="alert alert-danger">{state.error}</div> : null}

      <div className="card shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Email</th>
                <th style={{ width: 140 }}>Role</th>
                <th style={{ width: 220 }}>Created</th>
                <th style={{ width: 180 }} className="text-end">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((u, idx) => {
                  const isMe = currentUser?.id === u.id;
                  return (
                    <tr key={u.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="fw-semibold">{u.email}</div>
                        {isMe ? <span className="badge bg-info">You</span> : null}
                      </td>
                      <td>
                        <span
                          className={`badge ${u.role === "admin" ? "bg-danger" : "bg-success"}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="text-muted">
                        {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <Link className="btn btn-outline-dark btn-sm" to={`/users/${u.id}/edit`}>
                            <i className="fa-solid fa-pen-to-square me-2" />
                            Edit
                          </Link>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            disabled={isMe}
                            onClick={() => setConfirm({ open: true, user: u })}
                            title={isMe ? "Tidak bisa hapus akun yang sedang login" : "Hapus user"}
                          >
                            <i className="fa-solid fa-trash-can me-2" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    Tidak ada user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title="Hapus user?"
        message={
          confirm.user
            ? `Anda yakin ingin menghapus user: ${confirm.user.email}?`
            : "Anda yakin ingin menghapus user ini?"
        }
        loading={state.loading}
        onCancel={() => setConfirm({ open: false, user: null })}
        onConfirm={async () => {
          if (!confirm.user) return;
          const res = await deleteUser(confirm.user.id);
          if (res.ok) setConfirm({ open: false, user: null });
        }}
      />

      <div className="mt-4 small text-muted">
        <div className="fw-semibold">Default admin</div>
        <div>Email: <strong>root@local.host</strong></div>
        <div>Password: <strong>password</strong></div>
      </div>
    </div>
  );
}
