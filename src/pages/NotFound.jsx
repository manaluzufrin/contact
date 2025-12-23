import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5">
      <div className="card shadow-sm rounded-4">
        <div className="card-body p-4">
          <h4><span class="text-danger">404</span> | Not Found</h4>
          <p className="text-muted mb-3">Halaman yang kamu akses tidak tersedia.</p>
          <Link to="/" className="btn btn-dark">
            <i class="fa-solid fa-home me-2" /> Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  );
}
