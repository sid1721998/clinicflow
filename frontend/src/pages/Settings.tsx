import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, getUser, getApiUrl, setApiUrl, logout } from "../lib/api";

export default function Settings() {
  const [, setLocation] = useLocation();
  const user = getUser();
  const [apiUrl, setApiUrlState] = useState(getApiUrl());
  const [saved, setSaved] = useState(false);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => apiFetch("/me") });
  const currentUser = (me as any) ?? user;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900">Postavke</h1>

      {currentUser && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="font-semibold text-slate-800">Korisnički profil</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {(currentUser.first_name?.[0] ?? "")}{(currentUser.last_name?.[0] ?? "")}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{currentUser.first_name} {currentUser.last_name}</p>
                <p className="text-sm text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">{currentUser.role}</span>
              </div>
            </div>
            {currentUser.clinic && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Klinika</p>
                <p className="font-semibold text-slate-800">{currentUser.clinic.name}</p>
                {currentUser.clinic.address && <p className="text-sm text-slate-500">{currentUser.clinic.address}</p>}
                {currentUser.clinic.phone && <p className="text-sm text-slate-500">{currentUser.clinic.phone}</p>}
                <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">Plan: {currentUser.clinic.plan}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="font-semibold text-slate-800">API Konfiguracija</p>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">API Base URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={e => setApiUrlState(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="http://localhost:8091/api"
            />
            <p className="mt-1.5 text-xs text-slate-400">Docker lokalno: http://localhost:8091/api</p>
          </div>
          <button
            onClick={() => { setApiUrl(apiUrl); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            {saved ? "✓ Spremljeno!" : "Spremi"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <button
          onClick={() => { logout(); setLocation("/"); }}
          className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition"
        >
          Odjava
        </button>
      </div>
    </div>
  );
}
