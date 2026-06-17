export const ADMIN_EMAILS = [
  "ridwannurjaman799@gmail.com",
  "nurlailahandayani02@gmail.com",
];

export const FAMILY_EMAILS = [
  "keluarga@gmail.com",
];

export const getRole = (email) => {
  if (!email) return null;
  if (ADMIN_EMAILS.includes(email.toLowerCase())) return "admin";
  if (FAMILY_EMAILS.includes(email.toLowerCase())) return "family";
  return null;
};
