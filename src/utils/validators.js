export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
export const isDigitsOnly = (v) => /^[0-9]+$/.test(String(v || "").trim());

export function validateRegister({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = "Email wajib diisi.";
  else if (!isEmail(email)) errors.email = "Format email tidak valid.";

  if (!password) errors.password = "Password wajib diisi.";
  else if (password.length < 6) errors.password = "Password minimal 6 karakter.";

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = "Email wajib diisi.";
  else if (!isEmail(email)) errors.email = "Format email tidak valid.";

  if (!password) errors.password = "Password wajib diisi.";
  return errors;
}

export function validateContact({ name, phone, email, location, file }) {
  const errors = {};

  if (!name?.trim()) errors.name = "Nama wajib diisi.";

  if (!phone?.trim()) errors.phone = "Telepon wajib diisi.";
  else if (!isDigitsOnly(phone)) errors.phone = "Telepon hanya boleh angka.";

  if (!email?.trim()) errors.email = "Email wajib diisi.";
  else if (!isEmail(email)) errors.email = "Format email tidak valid.";

  if (!location?.address?.trim()) errors.address = "Lokasi wajib dipilih (klik peta).";
  if (typeof location?.lat !== "number" || typeof location?.lng !== "number")
    errors.coords = "Koordinat tidak valid (pilih dari peta).";

  if (!file) errors.photo = "Foto profil wajib diunggah.";
  else {
    const isImage = file.type?.startsWith("image/");
    if (!isImage) errors.photo = "File harus berupa gambar.";
    const max = 1 * 1024 * 1024;
    if (file.size > max) errors.photo = "Ukuran gambar maksimal 1MB.";
  }

  return errors;
}

export function validateUser({ email, password, isEdit }) {
  const errors = {};
  if (!email?.trim()) errors.email = "Email wajib diisi.";
  else if (!isEmail(email)) errors.email = "Format email tidak valid.";

  // For edit: password is optional, but if filled must be min length
  if (!isEdit) {
    if (!password) errors.password = "Password wajib diisi.";
    else if (password.length < 6) errors.password = "Password minimal 6 karakter.";
  } else {
    if (password && password.length < 6) errors.password = "Password minimal 6 karakter.";
  }

  return errors;
}

export function validateChangePassword({ oldPassword, newPassword }) {
  const errors = {};
  if (!oldPassword) errors.oldPassword = "Password lama wajib diisi.";
  if (!newPassword) errors.newPassword = "Password baru wajib diisi.";
  else if (newPassword.length < 6) errors.newPassword = "Password baru minimal 6 karakter.";
  return errors;
}
