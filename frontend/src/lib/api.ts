import {
  DEMO_DASHBOARD,
  DEMO_PATIENTS,
  DEMO_APPOINTMENTS,
  DEMO_TODAY_APPOINTMENTS,
  DEMO_INVOICES,
  DEMO_INVOICES_SUMMARY,
  DEMO_REPORTS,
  DEMO_USER,
} from "./demo-data";

const API_BASE_KEY = "clinicflow_api_url";
const TOKEN_KEY = "clinicflow_token";
const USER_KEY = "clinicflow_user";
const DEMO_TOKEN = "demo-mode-token";

export const getApiUrl = () =>
  localStorage.getItem(API_BASE_KEY) ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8091/api";

export const setApiUrl = (url: string) =>
  localStorage.setItem(API_BASE_KEY, url);

const getToken = () => localStorage.getItem(TOKEN_KEY) || "";
export const isDemoMode = () => getToken() === DEMO_TOKEN;

function getDemoResponse(path: string): unknown | null {
  if (path.startsWith("/dashboard")) return DEMO_DASHBOARD;
  if (path.startsWith("/patients") && !path.match(/\/patients\/\d/))
    return DEMO_PATIENTS;
  if (path === "/appointments/today") return DEMO_TODAY_APPOINTMENTS;
  if (path.startsWith("/appointments")) return DEMO_APPOINTMENTS;
  if (path === "/invoices/summary") return DEMO_INVOICES_SUMMARY;
  if (path.startsWith("/invoices")) return DEMO_INVOICES;
  if (path.startsWith("/reports")) return DEMO_REPORTS;
  if (path === "/me") return DEMO_USER;
  return null;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 250));
    const demo = getDemoResponse(path);
    if (demo !== null) return demo;
    throw new Error("Demo: endpoint not found");
  }

  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("API_UNREACHABLE");
  }

  if (!res.ok) {
    if (res.status === 401) {
      logout();
      window.location.href = "/";
    }
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<unknown> {
  if (
    (email === "demo@clinicflow.hr" || email === "admin@demo-klinika.hr") &&
    (password === "demo1234" || password === "demo")
  ) {
    localStorage.setItem(TOKEN_KEY, DEMO_TOKEN);
    localStorage.setItem(USER_KEY, JSON.stringify(DEMO_USER));
    return { token: DEMO_TOKEN, user: DEMO_USER };
  }

  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("API_UNREACHABLE");
  }

  if (!res.ok) throw new Error("Invalid credentials");
  const data = (await res.json()) as { token?: string; user?: unknown };
  if (data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
    if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const u = localStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
}
