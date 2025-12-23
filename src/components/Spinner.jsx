import React from "react";

export default function Spinner({ label = "Memproses..." }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
      <span className="text-small">{label}</span>
    </div>
  );
}
