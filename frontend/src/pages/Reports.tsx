import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Reports() {
  const today = new Date();
  const [start, setStart] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]);
  const [end, setEnd] = useState(today.toISOString().split("T")[0]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["reports", start, end],
    queryFn: () => apiFetch(`/reports/revenue?start_date=${start}&end_date=${end}`),
  });

  const d = data as any;
  const chartData = Array.isArray(d?.daily) ? d.daily : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Izvještaji</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-4">Vremensko razdoblje</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Od</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Do</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-end">
            <button onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">Primijeni</button>
          </div>
        </div>
      </div>

      {error && <div className="text-center py-16 bg-white border border-slate-200 rounded-xl text-slate-400"><p className="text-sm">Greška pri dohvaćanju izvještaja</p></div>}

      {!error && (
        <>
          {d && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Ukupni prihod", val: d.total_revenue ?? 0, curr: true },
                { label: "Plaćeno", val: d.paid_revenue ?? 0, curr: true },
                { label: "Broj faktura", val: d.invoice_count ?? 0, curr: false },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                  <p className="text-xl font-bold text-slate-900">
                    {item.curr ? `${Number(item.val).toLocaleString("hr-HR")} €` : item.val}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-4">Prihodi po danima</p>
            {isLoading ? (
              <div className="bg-slate-100 rounded h-48 animate-pulse" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => new Date(v).toLocaleDateString("hr-HR", { day:"2-digit", month:"2-digit" })} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}€`} />
                  <Tooltip formatter={(v: unknown) => [`${Number(v).toFixed(2)} €`, "Prihod"]} />
                  <Bar dataKey="amount" fill="#2563eb" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-400"><p className="text-3xl mb-2">📊</p><p className="text-sm">Nema podataka za odabrano razdoblje</p></div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
