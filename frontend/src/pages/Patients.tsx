import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, isDemoMode } from "../lib/api";

type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  oib?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  blood_type?: string;
  allergies?: string;
  is_active: boolean;
};

const EMPTY_FORM = {
  first_name: "", last_name: "", oib: "", date_of_birth: "",
  gender: "M", phone: "", email: "", address: "", blood_type: "", allergies: "",
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
  if (!isDemoMode()) return null;
  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
      🔬 Demo Mode — podaci se čuvaju lokalno u vašem pregledniku.
    </div>
  );
}

function PatientForm({ initial, onSubmit, onCancel, loading }: {
  initial?: Partial<typeof EMPTY_FORM>;
  onSubmit: (data: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="p-5 space-y-3">
      {isDemoMode() && <DemoBanner />}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Ime *</label>
          <input required value={form.first_name} onChange={set("first_name")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Prezime *</label>
          <input required value={form.last_name} onChange={set("last_name")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">OIB</label>
          <input value={form.oib} onChange={set("oib")} maxLength={11} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Datum rođenja</label>
          <input type="date" value={form.date_of_birth} onChange={set("date_of_birth")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Spol</label>
          <select value={form.gender} onChange={set("gender")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="M">Muški</option>
            <option value="F">Ženski</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Krvna grupa</label>
          <select value={form.blood_type} onChange={set("blood_type")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">—</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Telefon</label>
        <input value={form.phone} onChange={set("phone")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
        <input type="email" value={form.email} onChange={set("email")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Adresa</label>
        <input value={form.address} onChange={set("address")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Alergije</label>
        <textarea value={form.allergies} onChange={set("allergies")} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition">
          {loading ? "Spremanje..." : "Spremi"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-100 transition">Odustani</button>
      </div>
    </form>
  );
}

function PatientDetail({ patient, onEdit, onDelete }: { patient: Patient; onEdit: () => void; onDelete: () => void }) {
  const rows = [
    { label: "OIB", value: patient.oib },
    { label: "Datum rođenja", value: patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString("hr-HR") : undefined },
    { label: "Spol", value: patient.gender === "M" ? "Muški" : patient.gender === "F" ? "Ženski" : patient.gender },
    { label: "Krvna grupa", value: patient.blood_type },
    { label: "Telefon", value: patient.phone },
    { label: "Email", value: patient.email },
    { label: "Adresa", value: patient.address },
    { label: "Alergije", value: patient.allergies },
  ].filter(r => r.value);

  return (
    <div className="p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <span className="text-blue-600 font-bold text-lg">{patient.first_name[0]}{patient.last_name[0]}</span>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">{patient.first_name} {patient.last_name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${patient.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
            {patient.is_active ? "Aktivan" : "Neaktivan"}
          </span>
        </div>
      </div>
      <dl className="space-y-0 mb-5">
        {rows.map(r => (
          <div key={r.label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
            <dt className="text-xs text-slate-400">{r.label}</dt>
            <dd className="text-sm font-medium text-slate-800 text-right max-w-[60%]">{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex gap-2">
        <button onClick={onEdit} className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-100 transition">✏️ Uredi</button>
        <button onClick={onDelete} className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition">🗑️ Obriši</button>
      </div>
    </div>
  );
}

export default function Patients() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [mode, setMode] = useState<"detail" | "add" | "edit" | "delete" | null>(null);
  const [toast, setToast] = useState("");
  const qc = useQueryClient();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { data, isLoading, error } = useQuery({
    queryKey: ["patients", search, page],
    queryFn: () => apiFetch(`/patients?search=${encodeURIComponent(search)}&per_page=15&page=${page}`),
    placeholderData: (prev) => prev,
  });

  const patients = (data as any)?.data ?? data ?? [];
  const meta = (data as any)?.meta;

  const mutCreate = useMutation({
    mutationFn: (body: typeof EMPTY_FORM) =>
      apiFetch("/patients", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      showToast("Pacijent uspješno dodan!");
      qc.invalidateQueries({ queryKey: ["patients"] });
      setMode(null);
    },
  });

  const mutUpdate = useMutation({
    mutationFn: (body: typeof EMPTY_FORM) =>
      apiFetch(`/patients/${selected!.id}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      showToast("Pacijent ažuriran!");
      qc.invalidateQueries({ queryKey: ["patients"] });
      setMode(null);
    },
  });

  const mutDelete = useMutation({
    mutationFn: () => apiFetch(`/patients/${selected!.id}`, { method: "DELETE" }),
    onSuccess: () => {
      showToast("Pacijent obrisan!");
      qc.invalidateQueries({ queryKey: ["patients"] });
      setMode(null); setSelected(null);
    },
  });

  return (
    <div className="space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Pacijenti</h1>
        <div className="flex items-center gap-2">
          {meta && <span className="text-sm text-slate-400">Ukupno: {meta.total}</span>}
          <button onClick={() => setMode("add")} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + Novi pacijent
          </button>
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          type="search"
          placeholder="Pretraži po imenu, OIB-u, emailu..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading && <div className="space-y-2 animate-pulse">{[1,2,3,4,5].map(i => <div key={i} className="bg-slate-200 rounded-xl h-16" />)}</div>}
      {error && <div className="text-center py-16 text-slate-400"><p className="text-3xl mb-2">⚠️</p><p className="text-sm">Greška pri dohvaćanju pacijenata</p></div>}

      {!isLoading && !error && (
        <>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {Array.isArray(patients) && patients.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {patients.map((p: Patient) => (
                  <div key={p.id} onClick={() => { setSelected(p); setMode("detail"); }}
                    className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition cursor-pointer">
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
                <p className="text-sm">{search ? "Nema rezultata" : "Dodajte prvog pacijenta"}</p>
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

      <Modal open={mode === "detail"} onClose={() => setMode(null)} title="Detalji pacijenta">
        {selected && <PatientDetail patient={selected} onEdit={() => setMode("edit")} onDelete={() => setMode("delete")} />}
      </Modal>
      <Modal open={mode === "add"} onClose={() => setMode(null)} title="Novi pacijent">
        <PatientForm onSubmit={d => mutCreate.mutate(d)} onCancel={() => setMode(null)} loading={mutCreate.isPending} />
      </Modal>
      <Modal open={mode === "edit"} onClose={() => setMode(null)} title="Uredi pacijenta">
        {selected && <PatientForm initial={selected} onSubmit={d => mutUpdate.mutate(d)} onCancel={() => setMode("detail")} loading={mutUpdate.isPending} />}
      </Modal>
      <Modal open={mode === "delete"} onClose={() => setMode(null)} title="Potvrda brisanja">
        <div className="p-5">
          {isDemoMode() && <DemoBanner />}
          <p className="text-sm text-slate-600 mt-4">Jeste li sigurni da želite obrisati pacijenta <strong>{selected?.first_name} {selected?.last_name}</strong>?</p>
          <div className="flex gap-2 mt-5">
            <button onClick={() => mutDelete.mutate()} disabled={mutDelete.isPending} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition">
              {mutDelete.isPending ? "Brisanje..." : "Obriši"}
            </button>
            <button onClick={() => setMode(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-100 transition">Odustani</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
