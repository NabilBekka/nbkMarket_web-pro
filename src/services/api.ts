const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/merchant";
interface ApiResponse<T = unknown> { data?: T; error?: string; }
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try { const { headers: h, ...rest } = options; const res = await fetch(`${API_URL}${endpoint}`, { headers: { "Content-Type": "application/json", ...(h as Record<string, string>) }, credentials: "include", ...rest }); const data = await res.json(); if (!res.ok) return { error: data.error || "Request failed" }; return { data }; } catch { return { error: "Network error" }; }
}
function authH(token: string) { return { Authorization: `Bearer ${token}` }; }
export const api = { auth: {
  register: (b: { email: string; password: string; first_name: string; last_name: string; company_name: string; lang?: string }) => request("/auth/register", { method: "POST", body: JSON.stringify(b) }),
  verifyEmail: (b: { email: string; code: string }) => request<{ accessToken: string; user: Record<string, unknown> }>("/auth/verify-email", { method: "POST", body: JSON.stringify(b) }),
  resendCode: (b: { email: string }) => request("/auth/resend-code", { method: "POST", body: JSON.stringify(b) }),
  checkCompany: (name: string) => request<{ available: boolean }>(`/auth/check-company/${encodeURIComponent(name)}`),
  login: (b: { email: string; password: string }) => request<{ accessToken: string; user: Record<string, unknown> }>("/auth/login", { method: "POST", body: JSON.stringify(b) }),
  forgotPassword: (b: { email: string; lang?: string }) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify(b) }),
  resetPassword: (b: { email: string; code: string; password: string }) => request("/auth/reset-password", { method: "POST", body: JSON.stringify(b) }),
  refreshToken: () => request<{ accessToken: string }>("/auth/refresh-token", { method: "POST" }),
  logout: (t: string) => request("/auth/logout", { method: "POST", headers: authH(t) }),
  getMe: (t: string) => request<{ user: Record<string, unknown> }>("/auth/me", { headers: authH(t) }),
  updateProfile: (t: string, b: { password: string; updates: Record<string, string> }) => request<{ user: Record<string, unknown> }>("/auth/profile", { method: "PUT", headers: authH(t), body: JSON.stringify(b) }),
  deleteAccount: (t: string, b: { password: string }) => request("/auth/account", { method: "DELETE", headers: authH(t), body: JSON.stringify(b) }),
  updateLang: (t: string, b: { lang: string }) => request("/auth/lang", { method: "PUT", headers: authH(t), body: JSON.stringify(b) }),
}};
