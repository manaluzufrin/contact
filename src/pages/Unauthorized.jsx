import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="container py-5">
          <div className="card shadow-sm rounded-4">
            <div className="card-body p-4">
              <h4><span class="text-danger">401</span> | UnAuthorized</h4>
              <p className="text-muted mb-3">Kamu tidak memiliki otoritas untuk mengakses halaman ini.</p>
              <Link to="/contacts" className="btn btn-dark">
                <i class="fa-solid fa-address-book me-2" /> Kembali ke Contacts
              </Link>
            </div>
          </div>
        </div>
  );
}
