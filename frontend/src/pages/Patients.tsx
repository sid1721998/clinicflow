import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["patients", search, page],
    queryFn: () => apiFetch(`/patients?search=${encodeURIComponent(search)}&per_page=15&page=${page}`),
    placeholderData: (prev) => prev,
  });

  const d = data as any;
  const patients = d?.data ?? [];
  const meta = d?.meta;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Pacijenti</h1>
        {meta && <span className="text-sm text-slate-400">Ukupno: {meta.total}</span>}
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          type="search"
          placeholder="Pretraži po imenu, OIB-u, emailu..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading && (
        <div className="space-y-2 animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="bg-slate-200 rounded-xl h-16" />)}
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-3xl mb-2">⚠️</p>
          <p className="text-sm">Greška pri dohvaćanju pacijenata</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {patients.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {patients.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm shrink-0">
                        {p.first_name?.[0]}{p.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.first_name} {p.last_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.date_of_birth && <span className="text-xs text-slate-400">{new Date(p.date_of_birth).toLocaleDateString("hr-HR")}</span>}
                          {p.gender && <span className="text-xs text-slate-400">{p.gender === "M" ? "Muški" : "Ženski"}</span>}
                          {p.oib && <span className="text-xs text-slate-400 font-mono">OIB: {p.oib}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.phone && <span className="hidden md:block text-xs text-slate-400">{p.phone}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {p.is_active ? "Aktivan" : "Neaktivan"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <p className="text-3xl mb-2">👤</p>
                <p className="text-sm">{search ? "Nema rezultata" : "Nema pacijenata"}</p>
              </div>
            )}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-4 py-2 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition">Prethodna</button>
              <span className="text-sm text-slate-500">{page} / {meta.last_page}</span>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p+1))} disabled={page === meta.last_page} className="px-4 py-2 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition">Sljedeća</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
