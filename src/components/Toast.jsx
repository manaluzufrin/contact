import React, { useEffect } from "react";

export default function Toast({ show, type = "success", message, onClose }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onClose?.(), 2500);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  const cls = type === "success" ? "alert-success" : type === "error" ? "alert-danger" : "alert-info";

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 2000, maxWidth: 420 }}>
      <div className={`alert ${cls} shadow-sm mb-0`} role="alert">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>{message}</div>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      </div>
    </div>
  );
}
