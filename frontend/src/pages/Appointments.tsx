import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

const STATUS_LABELS: Record<string, string> = { scheduled:"Zakazano", confirmed:"Potvrđeno", in_progress:"U tijeku", completed:"Završeno", cancelled:"Otkazano", no_show:"Nije došao" };
const STATUS_COLORS: Record<string, string> = { scheduled:"bg-blue-100 text-blue-700", confirmed:"bg-green-100 text-green-700", in_progress:"bg-amber-100 text-amber-700", completed:"bg-purple-100 text-purple-700", cancelled:"bg-red-100 text-red-700", no_show:"bg-gray-100 text-gray-600" };

function ApptRow({ a }: { a: any }) {
  const d = new Date(a.scheduled_at);
  return (
    <div className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
          {a.patient?.first_name?.[0]}{a.patient?.last_name?.[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{a.patient?.first_name} {a.patient?.last_name}</p>
          <p className="text-xs text-slate-400">Dr. {a.doctor?.first_name} {a.doctor?.last_name}{a.type ? ` · ${a.type}` : ""}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right">
          <p className="text-xs font-medium text-slate-700">{d.toLocaleDateString("hr-HR")}</p>
          <p className="text-xs text-slate-400">{d.toLocaleTimeString("hr-HR", { hour:"2-digit", minute:"2-digit" })}</p>
        </div>
        {a.price != null && <span className="hidden lg:block text-sm font-semibold text-slate-700">{Number(a.price).toFixed(2)} €</span>}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status] || "bg-slate-100 text-slate-600"}`}>
          {STATUS_LABELS[a.status] || a.status}
        </span>
      </div>
    </div>
  );
}

export default function Appointments() {
  const { data: todayData } = useQuery({ queryKey: ["today"], queryFn: () => apiFetch("/appointments/today") });
  const { data, isLoading, error } = useQuery({ queryKey: ["appointments"], queryFn: () => apiFetch("/appointments?per_page=20") });

  const today = (Array.isArray(todayData) ? todayData : (todayData as any)?.data) ?? [];
  const all = (data as any)?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Termini</h1>

      {today.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <span>📅</span>
            <p className="font-semibold text-slate-800">Danas ({today.length})</p>
          </div>
          <div className="divide-y divide-slate-100">{today.map((a: any) => <ApptRow key={a.id} a={a} />)}</div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="font-semibold text-slate-800">Svi termini</p>
        </div>
        {isLoading && <div className="p-8 space-y-2 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="bg-slate-200 rounded h-14" />)}</div>}
        {error && <div className="text-center py-16 text-slate-400"><p className="text-sm">Greška pri dohvaćanju termina</p></div>}
        {!isLoading && !error && (
          all.length > 0
            ? <div className="divide-y divide-slate-100">{all.map((a: any) => <ApptRow key={a.id} a={a} />)}</div>
            : <div className="text-center py-16 text-slate-400"><p className="text-3xl mb-2">📅</p><p className="text-sm">Nema termina</p></div>
        )}
      </div>
    </div>
  );
}
