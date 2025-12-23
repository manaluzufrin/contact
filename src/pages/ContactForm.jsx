import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MapPicker from "../components/MapPicker.jsx";
import Toast from "../components/Toast.jsx";
import Spinner from "../components/Spinner.jsx";
import { useContacts } from "../contexts/ContactsContext.jsx";
import { validateContact } from "../utils/validators.js";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function ContactForm() {
  const { id } = useParams();
  const isEdit = id && id !== "new";
  const nav = useNavigate();
  const { state, create, update, findById } = useContacts();

  const existing = useMemo(() => (isEdit ? findById(id) : null), [isEdit, id, findById]);

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: { address: "", lat: -6.755316451902105, lng: 108.50968109451621 },
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    if (!existing) return;

    setForm({
      name: existing.name,
      phone: existing.phone,
      email: existing.email,
      location: existing.location,
    });
    setPhotoPreview(existing.photoDataUrl);
  }, [isEdit, existing]);

  if (isEdit && !existing) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning rounded-4">
          Kontak dengan ID <b>{id}</b> tidak ditemukan.
        </div>
        <Link className="btn btn-dark" to="/contacts">
          Kembali ke daftar
        </Link>
      </div>
    );
  }

  const onPickPhoto = async (file) => {
    setPhotoFile(file);
    if (!file) {
      setPhotoPreview("");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPhotoPreview(dataUrl);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const v = validateContact({
      ...form,
      file: isEdit ? (photoFile || { type: "image/*", size: 0 }) : photoFile,
    });

    if (isEdit && !photoFile) delete v.photo;

    setErrors(v);
    if (Object.keys(v).length) return;

    let photoDataUrl = existing?.photoDataUrl || "";
    if (photoFile) photoDataUrl = await fileToDataUrl(photoFile);

    if (!isEdit) {
      const res = await create({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        photoDataUrl,
        location: form.location,
      });
      if (res.ok) {
        setToast({ show: true, type: "success", message: "Kontak berhasil ditambahkan!" });
        setTimeout(() => nav("/contacts"), 800);
      } else {
        setToast({ show: true, type: "error", message: "Gagal menambahkan kontak." });
      }
    } else {
      const res = await update(id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        photoDataUrl,
        location: form.location,
      });
      if (res.ok) {
        setToast({ show: true, type: "success", message: "Kontak berhasil diperbarui!" });
        setTimeout(() => nav("/contacts"), 800);
      } else {
        setToast({ show: true, type: "error", message: "Gagal memperbarui kontak." });
      }
    }
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
        <h4 className="mb-0">{isEdit ? "Edit Kontak" : "Tambah Kontak"}</h4>
        <Link className="btn btn-outline-dark" to="/contacts">
          <i className="fa-solid fa-arrow-left me-2" />
          Kembali
        </Link>
      </div>

      <div className="card shadow-sm rounded-4">
        <div className="card-body p-4">
          <form onSubmit={onSubmit} className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Nama</label>
              <input
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name ? <div className="invalid-feedback">{errors.name}</div> : null}
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Telepon</label>
              <input
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Hanya angka"
                inputMode="numeric"
              />
              {errors.phone ? <div className="invalid-feedback">{errors.phone}</div> : null}
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Email</label>
              <input
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com"
              />
              {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Foto Profil (maks 1MB)</label>
              <input
                type="file"
                className={`form-control ${errors.photo ? "is-invalid" : ""}`}
                accept="image/*"
                onChange={(e) => onPickPhoto(e.target.files?.[0] || null)}
              />
              {errors.photo ? <div className="invalid-feedback">{errors.photo}</div> : null}

              {photoPreview ? (
                <div className="mt-2 d-flex align-items-center gap-3">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: 72, height: 72, objectFit: "cover" }}
                    className="rounded-circle border"
                  />
                </div>
              ) : null}
            </div>

            <div className="col-12">
              <label className="form-label">Pilih Lokasi (klik peta)</label>
              <MapPicker
                value={form.location}
                onChange={(loc) => setForm({ ...form, location: loc })}
              />
              {(errors.address || errors.coords) ? (
                <div className="text-danger text-small mt-2">
                  {errors.address || errors.coords}
                </div>
              ) : null}
            </div>

            <div className="col-12 d-flex gap-2">
              <button className="btn btn-warning" disabled={state.loading}>
                {state.loading ? <Spinner label="Menyimpan..." /> : (isEdit ? "Simpan Perubahan" : "Tambah Kontak")}
              </button>
              <Link className="btn btn-outline-secondary" to="/contacts">
                Batal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
