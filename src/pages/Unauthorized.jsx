import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm rounded-4">
            <div className="card-body p-4">
              <h4 className="mb-2"><span class="text-danger">401</span> | Unauthorized</h4>
              <p className="text-muted mb-4">
                Akses di tolak. Anda tidak memiliki izin untuk membuka halaman ini.
              </p>
              <Link className="btn btn-dark" to="/contacts">
                Kembali ke Contacts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
