import { useState } from "react";
import { useLocation } from "wouter";
import { login, getApiUrl, setApiUrl } from "../lib/api";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiUrl, setApiUrlState] = useState(getApiUrl());
  const [showApiUrl, setShowApiUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doLogin = async (em: string, pw: string) => {
    setLoading(true);
    setError("");
    setApiUrl(apiUrl);
    try {
      await login(em, pw);
      setLocation("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "API_UNREACHABLE") {
        setError("API nije dostupan. Pokrenite Demo Mode ili provjerite Docker.");
      } else {
        setError("Neispravni podaci za prijavu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3">
            <span className="text-white text-xl font-bold">CF</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ClinicFlow</h1>
          <p className="text-slate-500 mt-1 text-sm">Upravljanje privatnim poliklinikama</p>
        </div>

        {/* Demo CTA */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-semibold text-blue-700 mb-1">🔬 Demo Mode</p>
          <p className="text-xs text-blue-600 mb-3">
            Pregledajte sve funkcionalnosti s realnim demo podacima — bez backenda.
          </p>
          <button
            onClick={() => doLogin("admin@demo-klinika.hr", "demo1234")}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Učitavanje..." : "Pokreni Demo"}
          </button>
        </div>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">ili prijava s API-jem</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Login form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); doLogin(email, password); }}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@demo-klinika.hr"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Lozinka</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition disabled:opacity-60"
            >
              Prijava
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowApiUrl(!showApiUrl)}
              className="text-xs text-slate-400 hover:text-slate-600 transition"
            >
              {showApiUrl ? "Sakrij" : "Promijeni"} API URL
            </button>
            {showApiUrl && (
              <div className="mt-3">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrlState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:8091/api"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Default: http://localhost:8091/api
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
