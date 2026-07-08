import { useQuery } from "@tanstack/react-query";
import { apiFetch, getUser } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Zakazano", confirmed: "Potvrđeno", in_progress: "U tijeku",
  completed: "Završeno", cancelled: "Otkazano", no_show: "Nije došao",
};
const STATUS_COLORS: Record<string, string> = {
  scheduled: "#3b82f6", confirmed: "#10b981", in_progress: "#f59e0b",
  completed: "#6366f1", cancelled: "#ef4444", no_show: "#9ca3af",
};

function Card({ title, value, sub, color }: { title: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-500 mb-2">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const user = getUser();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch("/dashboard"),
  });

  const d = data as any;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-7 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-slate-200 rounded-xl h-28" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <h3 className="font-semibold text-slate-800">API nije dostupan</h3>
        <p className="text-sm text-slate-500 mt-1">Provjerite je li Docker pokrenut na portu 8091</p>
      </div>
    );
  }

  const chartData = d?.statusStats
    ? Object.entries(d.statusStats as Record<string, number>).map(([k, v]) => ({ name: STATUS_LABELS[k] || k, value: v, key: k }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        {user && <p className="text-sm text-slate-500 mt-0.5">Dobrodošli, {user.first_name} {user.last_name} — {user.clinic?.name}</p>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Pacijenti" value={d?.totalPatients ?? 0} color="text-blue-600" />
        <Card title="Doktori" value={d?.totalDoctors ?? 0} color="text-teal-600" />
        <Card title="Danas" value={d?.todayAppts ?? 0} sub="termina danas" color="text-amber-600" />
        <Card title="Ovaj mjesec" value={d?.monthAppts ?? 0} sub="termina" color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-4">Prihodi</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Ovaj mjesec</p>
              <p className="text-xl font-bold text-slate-900">
                {Number(d?.monthRevenue ?? 0).toLocaleString("hr-HR", { style: "currency", currency: "EUR" })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Ukupno</p>
              <p className="text-xl font-bold text-slate-900">
                {Number(d?.totalRevenue ?? 0).toLocaleString("hr-HR", { style: "currency", currency: "EUR" })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-4">Status termina</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={chartData} barSize={24}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: unknown) => [v, "Termini"]} />
                <Bar dataKey="value" radius={[3,3,0,0]}>
                  {chartData.map((e) => <Cell key={e.key} fill={STATUS_COLORS[e.key] || "#94a3b8"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400">Nema podataka</p>}
        </div>
      </div>

      {d?.todayDetails?.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="font-semibold text-slate-800">Termini danas</p>
          </div>
          <div className="divide-y divide-slate-100">
            {d.todayDetails.map((a: any) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{a.patient?.first_name} {a.patient?.last_name}</p>
                  <p className="text-xs text-slate-400">Dr. {a.doctor?.first_name} {a.doctor?.last_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{new Date(a.scheduled_at).toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" })}</span>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string,string> = { scheduled:"Zakazano", confirmed:"Potvrđeno", in_progress:"U tijeku", completed:"Završeno", cancelled:"Otkazano", no_show:"Nije došao" };
  const colors: Record<string,string> = { scheduled:"bg-blue-100 text-blue-700", confirmed:"bg-green-100 text-green-700", in_progress:"bg-amber-100 text-amber-700", completed:"bg-purple-100 text-purple-700", cancelled:"bg-red-100 text-red-700", no_show:"bg-gray-100 text-gray-600" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || "bg-slate-100 text-slate-600"}`}>{labels[status] || status}</span>;
}
