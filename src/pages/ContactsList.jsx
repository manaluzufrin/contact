import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useContacts } from "../contexts/ContactsContext.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Toast from "../components/Toast.jsx";
import Spinner from "../components/Spinner.jsx";

export default function ContactsList() {
  const { state, getList, remove } = useContacts();
  const contacts = useMemo(() => getList(), [getList, state.loading, state.error]);

  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const openMap = (lat, lng) =>
    `https://www.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;

  const onDelete = (c) => setConfirm({ open: true, id: c.id, name: c.name });

  const doDelete = async () => {
    const id = confirm.id;
    const res = await remove(id);
    if (res.ok) {
      setToast({ show: true, type: "success", message: "Kontak berhasil dihapus!" });
    } else {
      setToast({ show: true, type: "error", message: "Gagal menghapus kontak." });
    }
    setConfirm({ open: false, id: null, name: "" });
  };

  return (
    <div className="container py-4">
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0"><i className="fa-solid fa-address-book me-2" /> Daftar Kontak</h4>
        <Link className="btn btn-warning" to="/contacts/new">
          <i className="fa-solid fa-plus me-2" />
          Tambah Kontak
        </Link>
      </div>

      {state.loading ? (
        <div className="alert alert-info d-flex align-items-center gap-2">
          <Spinner label="Memuat / menyimpan data..." />
        </div>
      ) : null}

      {state.error ? <div className="alert alert-danger">{state.error}</div> : null}

      {contacts.length === 0 ? (
        <div className="card rounded-4 shadow-sm">
          <div className="card-body">
            Belum ada kontak. Klik <b><Link className="text-warning" to="/contacts/new">Tambah Kontak</Link></b> untuk membuat data baru.
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {contacts.map((c) => (
            <div className="col-12 col-md-6 col-lg-4" key={c.id}>
              <div className="card rounded-4 shadow-sm card-hover h-100">
                <div className="card-body">
                  <div className="d-flex gap-3 align-items-start">
                    <img
                      src={c.photoDataUrl}
                      alt={c.name}
                      style={{ width: 64, height: 64, objectFit: "cover" }}
                      className="rounded-circle border"
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{c.name}</div>
                      <div className="text-small text-muted">
                        <i className="fa-solid fa-phone me-2" />
                        {c.phone}
                      </div>
                      <div className="text-small text-muted">
                        <i className="fa-solid fa-envelope me-2" />
                        {c.email}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-small">
                    <div className="text-muted">
                      <i className="fa-solid fa-location-dot me-2" />
                      {c.location?.address || `${c.location?.lat}, ${c.location?.lng}`}
                    </div>
                    <a
                      className="d-inline-block mt-1"
                      href={openMap(c.location.lat, c.location.lng)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i class="fa-solid fa-share me-2" />Lihat di Google Maps
                    </a>
                  </div>
                </div>

                <div className="card-footer bg-white border-0 pt-0 pb-3 px-3">
                  <div className="d-flex gap-2">
                    <Link className="btn btn-outline-dark btn-sm flex-grow-1" to={`/contacts/${c.id}/edit`}>
                      <i className="fa-solid fa-pen-to-square me-2" />
                      Edit
                    </Link>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(c)}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Konfirmasi Hapus"
        message={`Yakin ingin menghapus kontak "${confirm.name}"?`}
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={doDelete}
        loading={state.loading}
      />
    </div>
  );
}
