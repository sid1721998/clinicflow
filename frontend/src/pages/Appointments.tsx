import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, isDemoMode } from "../lib/api";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Zakazano", confirmed: "Potvrđeno", in_progress: "U tijeku",
  completed: "Završeno", cancelled: "Otkazano", no_show: "Nije došao",
};
const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700", confirmed: "bg-green-100 text-green-700",
  in_progress: "bg-amber-100 text-amber-700", completed: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-700", no_show: "bg-gray-100 text-gray-600",
};

type Appointment = {
  id: number;
  patient?: { id?: number; first_name: string; last_name: string };
  doctor?: { id?: number; first_name: string; last_name: string };
  scheduled_at: string;
  duration_minutes?: number;
  status: string;
  type?: string;
  price?: number;
  notes?: string;
};

const EMPTY_FORM = {
  patient_name: "", doctor_name: "", scheduled_at: "",
  duration_minutes: "30", type: "", price: "", notes: "", status: "scheduled",
};

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 text-slate-500">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DemoBanner() {
  return (
    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
      🔬 Demo Mode — promjene se ne čuvaju. Spojite se na pravi API za stvarne operacije.
    </div>
  );
}

function AppointmentDetail({ appt, onStatusChange, loading }: { appt: Appointment; onStatusChange: (s: string) => void; loading: boolean }) {
  const d = new Date(appt.scheduled_at);
  return (
    <div className="p-5 space-y-4">
      {isDemoMode() && <DemoBanner />}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
          {appt.patient?.first_name?.[0]}{appt.patient?.last_name?.[0]}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{appt.patient?.first_name} {appt.patient?.last_name}</p>
          <p className="text-sm text-slate-500">Dr. {appt.doctor?.first_name} {appt.doctor?.last_name}</p>
        </div>
      </div>
      <dl className="space-y-0">
        {[
          { label: "Datum i vrijeme", value: `${d.toLocaleDateString("hr-HR")} u ${d.toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" })}` },
          { label: "Trajanje", value: appt.duration_minutes ? `${appt.duration_minutes} min` : undefined },
          { label: "Vrsta", value: appt.type },
          { label: "Cijena", value: appt.price != null ? `${Number(appt.price).toFixed(2)} €` : undefined },
          { label: "Napomena", value: appt.notes },
        ].filter(r => r.value).map(r => (
          <div key={r.label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
            <dt className="text-xs text-slate-400">{r.label}</dt>
            <dd className="text-sm font-medium text-slate-800 text-right">{r.value}</dd>
          </div>
        ))}
      </dl>
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Promijeni status:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <button key={k} disabled={loading || appt.status === k} onClick={() => onStatusChange(k)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${appt.status === k ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold" : "border-slate-300 hover:bg-slate-100"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppointmentForm({ onSubmit, onCancel, loading }: { onSubmit: (d: typeof EMPTY_FORM) => void; onCancel: () => void; loading: boolean }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="p-5 space-y-3">
      {isDemoMode() && <DemoBanner />}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Pacijent (ime i prezime) *</label>
        <input required placeholder="npr. Marko Horvat" value={form.patient_name} onChange={set("patient_name")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Doktor *</label>
        <input required placeholder="npr. Dr. Ana Kovačević" value={form.doctor_name} onChange={set("doctor_name")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Datum i vrijeme *</label>
          <input required type="datetime-local" value={form.scheduled_at} onChange={set("scheduled_at")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Trajanje (min)</label>
          <input type="number" min="10" max="180" value={form.duration_minutes} onChange={set("duration_minutes")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Vrsta pregleda</label>
          <input placeholder="npr. Internistički" value={form.type} onChange={set("type")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Cijena (€)</label>
          <input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Napomena</label>
        <textarea value={form.notes} onChange={set("notes")} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition">
          {loading ? "Spremanje..." : "Zakaži termin"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-100 transition">Odustani</button>
      </div>
    </form>
  );
}

function ApptRow({ a, onClick }: { a: Appointment; onClick: () => void }) {
  const d = new Date(a.scheduled_at);
  return (
    <div onClick={onClick} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
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
          <p className="text-xs text-slate-400">{d.toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" })}</p>
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
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState("");
  const qc = useQueryClient();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { data: todayData } = useQuery({ queryKey: ["today"], queryFn: () => apiFetch("/appointments/today") });
  const { data, isLoading, error } = useQuery({ queryKey: ["appointments"], queryFn: () => apiFetch("/appointments?per_page=20") });

  const today = (Array.isArray(todayData) ? todayData : (todayData as any)?.data) ?? [];
  const all = (data as any)?.data ?? [];

  const mutStatus = useMutation({
    mutationFn: (status: string) => {
      if (isDemoMode()) return Promise.resolve({ demo: true });
      return apiFetch(`/appointments/${selected!.id}`, { method: "PUT", body: JSON.stringify({ status }) });
    },
    onSuccess: (res: any) => {
      if (res?.demo) showToast("Demo Mode — status nije promijenjen na serveru");
      else { showToast("Status ažuriran!"); qc.invalidateQueries({ queryKey: ["appointments"] }); }
      setSelected(null);
    },
  });

  const mutCreate = useMutation({
    mutationFn: (body: typeof EMPTY_FORM) => {
      if (isDemoMode()) return Promise.resolve({ demo: true });
      return apiFetch("/appointments", { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: (res: any) => {
      if (res?.demo) showToast("Demo Mode — termin nije zakazan na serveru");
      else { showToast("Termin uspješno zakazan!"); qc.invalidateQueries({ queryKey: ["appointments"] }); }
      setShowAdd(false);
    },
  });

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Termini</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + Novi termin
        </button>
      </div>

      {today.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <span>📅</span>
            <p className="font-semibold text-slate-800">Danas ({today.length})</p>
          </div>
          <div className="divide-y divide-slate-100">{today.map((a: Appointment) => <ApptRow key={a.id} a={a} onClick={() => setSelected(a)} />)}</div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100"><p className="font-semibold text-slate-800">Svi termini</p></div>
        {isLoading && <div className="p-8 space-y-2 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="bg-slate-200 rounded h-14" />)}</div>}
        {error && <div className="text-center py-16 text-slate-400"><p className="text-sm">Greška pri dohvaćanju termina</p></div>}
        {!isLoading && !error && (
          all.length > 0
            ? <div className="divide-y divide-slate-100">{all.map((a: Appointment) => <ApptRow key={a.id} a={a} onClick={() => setSelected(a)} />)}</div>
            : <div className="text-center py-16 text-slate-400"><p className="text-3xl mb-2">📅</p><p className="text-sm">Nema termina</p></div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalji termina">
        {selected && <AppointmentDetail appt={selected} onStatusChange={s => mutStatus.mutate(s)} loading={mutStatus.isPending} />}
      </Modal>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Novi termin">
        <AppointmentForm onSubmit={d => mutCreate.mutate(d)} onCancel={() => setShowAdd(false)} loading={mutCreate.isPending} />
      </Modal>
    </div>
  );
}
