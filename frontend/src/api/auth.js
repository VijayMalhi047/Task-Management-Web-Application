// api/auth.js — Auth API calls
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const request = async (endpoint, body) => {
  const res  = await fetch(`${BASE_URL}${endpoint}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
};

export const apiSignup    = (form) => request("/auth/signup",     form);
export const apiVerifyOtp = (form) => request("/auth/verify-otp", form);
export const apiLogin     = (form) => request("/auth/login",      form);