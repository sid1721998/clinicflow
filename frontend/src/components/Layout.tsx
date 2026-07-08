import { useLocation, Link } from "wouter";
import { useState } from "react";
import { logout, isDemoMode } from "../lib/api";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/patients", label: "Pacijenti", icon: "👥" },
  { href: "/appointments", label: "Termini", icon: "📅" },
  { href: "/invoices", label: "Fakture", icon: "🧾" },
  { href: "/reports", label: "Izvještaji", icon: "📊" },
  { href: "/settings", label: "Postavke", icon: "⚙" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            CF
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">
            ClinicFlow
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const active =
              location === item.href || location.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={() => {
              logout();
              setLocation("/");
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 w-full transition-colors"
          >
            <span className="text-base w-5 text-center">→</span>
            Odjava
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-md hover:bg-slate-100"
          >
            ☰
          </button>
          <span className="font-bold text-slate-800">ClinicFlow</span>
        </div>

        {/* Demo banner */}
        {isDemoMode() && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-blue-700 text-xs font-medium flex items-center gap-2">
            <span>🔬</span>
            Demo Mode — prikazuju se simulirani podaci Demo Poliklinike Zagreb. Za pravi API pokrenite Docker i spojite se na localhost:8091.
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
