import {
  DEMO_DASHBOARD,
  DEMO_PATIENTS,
  DEMO_APPOINTMENTS,
  DEMO_INVOICES,
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

// ─── Demo Store (localStorage CRUD) ───────────────────────────────────────────
const LS = {
  get<T>(key: string, seed: T): T {
    try {
      const v = localStorage.getItem(`cf_${key}`);
      if (v) return JSON.parse(v) as T;
    } catch { /* ignore */ }
    LS.set(key, seed);
    return seed;
  },
  set(key: string, value: unknown) {
    localStorage.setItem(`cf_${key}`, JSON.stringify(value));
  },
};

type AnyRecord = Record<string, unknown> & { id: number };

function listStore(key: string, seed: AnyRecord[]) {
  return LS.get<AnyRecord[]>(key, seed);
}
function nextId(rows: AnyRecord[]) {
  return rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
}
function saveStore(key: string, rows: AnyRecord[]) {
  LS.set(key, rows);
}

function paginate(rows: AnyRecord[], page: number, perPage: number) {
  const total = rows.length;
  const start = (page - 1) * perPage;
  return {
    data: rows.slice(start, start + perPage),
    meta: { total, current_page: page, last_page: Math.max(1, Math.ceil(total / perPage)), per_page: perPage },
  };
}

function demoHandle(path: string, method: string, body: unknown): unknown {
  const m = method.toUpperCase();
  const params = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
  const cleanPath = path.split("?")[0];
  const page = parseInt(params.get("page") || "1");
  const perPage = parseInt(params.get("per_page") || "15");
  const search = (params.get("search") || "").toLowerCase();

  if (cleanPath.startsWith("/dashboard") || cleanPath === "/me") {
    return cleanPath === "/me" ? DEMO_USER : DEMO_DASHBOARD;
  }

  if (cleanPath.startsWith("/patients")) {
    const idMatch = cleanPath.match(/\/patients\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;
    const rows = listStore("patients", DEMO_PATIENTS.data as AnyRecord[]);

    if (m === "GET" && !id) {
      let filtered = rows;
      if (search) {
        filtered = rows.filter((p) => {
          const hay = `${p.first_name} ${p.last_name} ${p.oib || ""} ${p.email || ""}`.toLowerCase();
          return hay.includes(search);
        });
      }
      return paginate(filtered, page, perPage);
    }
    if (m === "GET" && id) return rows.find((r) => r.id === id) ?? null;
    if (m === "POST") {
      const rec = { ...(body as AnyRecord), id: nextId(rows), is_active: true };
      saveStore("patients", [...rows, rec]);
      return { data: rec };
    }
    if (m === "PUT" && id) {
      const updated = rows.map((r) => r.id === id ? { ...r, ...(body as AnyRecord) } : r);
      saveStore("patients", updated);
      return { data: updated.find((r) => r.id === id) };
    }
    if (m === "DELETE" && id) {
      saveStore("patients", rows.filter((r) => r.id !== id));
      return { success: true };
    }
  }

  if (cleanPath.startsWith("/appointments")) {
    const idMatch = cleanPath.match(/\/appointments\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;
    const rows = listStore("appointments", DEMO_APPOINTMENTS.data as AnyRecord[]);
    const todayStr = new Date().toDateString();

    if (cleanPath === "/appointments/today") {
      return rows.filter((a) => new Date(a.scheduled_at as string).toDateString() === todayStr);
    }
    if (m === "GET" && !id) return paginate(rows, page, perPage);
    if (m === "GET" && id) return rows.find((r) => r.id === id) ?? null;
    if (m === "POST") {
      const b = body as Record<string, unknown>;
      const [fn, ...ln] = ((b.patient_name as string) || "Novi Pacijent").split(" ");
      const [dfn, ...dln] = ((b.doctor_name as string) || "Dr. Doktor").split(" ");
      const rec: AnyRecord = {
        id: nextId(rows),
        patient: { first_name: fn, last_name: ln.join(" ") || "" },
        doctor: { first_name: dfn, last_name: dln.join(" ") || "" },
        scheduled_at: b.scheduled_at || new Date().toISOString(),
        duration_minutes: Number(b.duration_minutes) || 30,
        status: (b.status as string) || "scheduled",
        type: b.type || "",
        price: b.price ? Number(b.price) : null,
        notes: b.notes || "",
      };
      saveStore("appointments", [...rows, rec]);
      return { data: rec };
    }
    if (m === "PUT" && id) {
      const updated = rows.map((r) => r.id === id ? { ...r, ...(body as AnyRecord) } : r);
      saveStore("appointments", updated);
      return { data: updated.find((r) => r.id === id) };
    }
    if (m === "DELETE" && id) {
      saveStore("appointments", rows.filter((r) => r.id !== id));
      return { success: true };
    }
  }

  if (cleanPath.startsWith("/invoices")) {
    const rows = listStore("invoices", DEMO_INVOICES.data as AnyRecord[]);

    if (cleanPath === "/invoices/summary") {
      const total = rows.reduce((s, i) => s + Number(i.total_amount || 0), 0);
      const paid = rows.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
      return { total_amount: total, paid_amount: paid, unpaid_amount: total - paid, total_count: rows.length };
    }

    const payMatch = cleanPath.match(/\/invoices\/(\d+)\/pay/);
    if (payMatch && m === "POST") {
      const id = parseInt(payMatch[1]);
      const b = body as Record<string, unknown>;
      const updated = rows.map((r) =>
        r.id === id ? { ...r, paid_amount: b.paid_amount ?? r.total_amount, status: "paid" } : r
      );
      saveStore("invoices", updated);
      return { data: updated.find((r) => r.id === id) };
    }

    const idMatch = cleanPath.match(/\/invoices\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : null;
    if (m === "GET" && !id) return paginate(rows, page, perPage);
    if (m === "GET" && id) return rows.find((r) => r.id === id) ?? null;
    if (m === "PUT" && id) {
      const updated = rows.map((r) => r.id === id ? { ...r, ...(body as AnyRecord) } : r);
      saveStore("invoices", updated);
      return { data: updated.find((r) => r.id === id) };
    }
  }

  if (cleanPath.startsWith("/reports")) return DEMO_REPORTS;

  return null;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 180));
    const method = options.method || "GET";
    let body: unknown = undefined;
    if (options.body && typeof options.body === "string") {
      try { body = JSON.parse(options.body); } catch { body = {}; }
    }
    const result = demoHandle(path, method, body);
    if (result !== null) return result;
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
