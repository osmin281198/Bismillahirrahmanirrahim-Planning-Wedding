import { supabase } from "./supabase";

// Akun ini SELALU punya akses penuh, hardcode di kode (bukan dari tabel),
// supaya tidak mungkin terkunci sendiri walau tabel user_permissions kosong/rusak.
export const SUPER_EMAIL = "ridwannurjaman799@gmail.com";

// Halaman yang bisa diberikan lewat halaman "Kelola User".
// "users" SENGAJA tidak dimasukkan di sini — halaman Kelola User selamanya
// eksklusif untuk SUPER_EMAIL, tidak bisa didelegasikan ke akun lain.
export const GRANTABLE_PAGES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "rab",       label: "Anggaran" },
  { key: "planning",  label: "Planning" },
  { key: "guests",    label: "Tamu" },
  { key: "wishes",    label: "RSVP" },
  { key: "notes",     label: "Catatan" },
  { key: "kas",       label: "Kas" },
  { key: "settings",  label: "Pengaturan" },
];

export const ALL_PAGES = [...GRANTABLE_PAGES.map((p) => p.key), "users"];

// Path awal -> nama page, dipakai ProtectedRoute untuk tahu halaman apa yang sedang diakses
export const PATH_PAGE_MAP = {
  "/dashboard": "dashboard",
  "/rab": "rab",
  "/planning": "planning",
  "/guests": "guests",
  "/wishes": "wishes",
  "/notes": "notes",
  "/kas": "kas",
  "/settings": "settings",
  "/users": "users",
};

// Cari halaman pertama yang cocok untuk didarati user sesuai pages yang dia punya
export const firstAllowedPath = (pages = []) => {
  const order = ["dashboard", "guests", "wishes", "rab", "planning", "notes", "kas", "settings"];
  const found = order.find((p) => pages.includes(p));
  return found ? `/${found}` : null;
};

/**
 * Ambil role & daftar halaman yang boleh diakses untuk sebuah email.
 * - SUPER_EMAIL selalu dapat akses penuh tanpa query ke DB.
 * - Email lain diambil dari tabel `user_permissions`.
 * Return: { role, pages } atau null kalau tidak punya akses sama sekali.
 */
export const getPermissions = async (email) => {
  if (!email) return null;
  const lower = email.toLowerCase();

  if (lower === SUPER_EMAIL) {
    return { role: "super", pages: ALL_PAGES };
  }

  const { data, error } = await supabase
    .from("user_permissions")
    .select("role_label, pages")
    .eq("email", lower)
    .single();

  if (error || !data) return null;
  return { role: data.role_label, pages: data.pages || [] };
};
