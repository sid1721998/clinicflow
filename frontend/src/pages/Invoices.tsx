import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, isDemoMode } from "../lib/api";

const STATUS_LABELS: Record<string, string> = {
  paid: "Plaćeno", unpaid: "Neplaćeno", partially_paid: "Djelomično", cancelled: "Otkazano",
};
const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700", unpaid: "bg-red-100 text-red-700",
  partially_paid: "bg-amber-100 text-amber-700", cancelled: "bg-gray-100 text-gray-600",
};

type Invoice = {
  id: number;
  patient?: { first_name: string; last_name: string };
  doctor?: { first_name: string; last_name: string };
  total_amount: number;
  paid_amount?: number;
  status: string;
  invoice_date?: string;
  due_date?: string;
  notes?: string;
  items?: Array<{ description: string; quantity: number; unit_price: number; total: number }>;
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

function InvoiceDetail({ inv, onMarkPaid, loading }: { inv: Invoice; onMarkPaid: () => void; loading: boolean }) {
  const isPaid = inv.status === "paid";
  return (
    <div className="p-5 space-y-4">
      {isDemoMode() && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
          🔬 Demo Mode — promjene se ne čuvaju na serveru.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-lg text-slate-900">{inv.patient?.first_name} {inv.patient?.last_name}</p>
          <p className="text-sm text-slate-500">Faktura #{inv.id}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[inv.status] || "bg-slate-100 text-slate-600"}`}>
          {STATUS_LABELS[inv.status] || inv.status}
        </span>
      </div>
      <dl className="space-y-0">
        {[
          { label: "Datum fakture", value: inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString("hr-HR") : undefined },
          { label: "Rok plaćanja", value: inv.due_date ? new Date(inv.due_date).toLocaleDateString("hr-HR") : undefined },
          { label: "Doktor", value: inv.doctor ? `Dr. ${inv.doctor.first_name} ${inv.doctor.last_name}` : undefined },
          { label: "Napomena", value: inv.notes },
        ].filter(r => r.value).map(r => (
          <div key={r.label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
            <dt className="text-xs text-slate-400">{r.label}</dt>
            <dd className="text-sm font-medium text-slate-800 text-right">{r.value}</dd>
          </div>
        ))}
      </dl>
      {inv.items && inv.items.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Stavke:</p>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {inv.items.map((item, i) => (
              <div key={i} className="flex justify-between px-3 py-2 text-sm border-b border-slate-100 last:border-0">
                <span>{item.description} × {item.quantity}</span>
                <span className="font-medium">{Number(item.total).toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-slate-50 rounded-lg p-4 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Ukupno</span>
          <span className="font-bold text-lg text-slate-900">{Number(inv.total_amount).toLocaleString("hr-HR", { style: "currency", currency: "EUR" })}</span>
        </div>
        {inv.paid_amount != null && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Plaćeno</span>
            <span className="text-green-600 font-medium">{Number(inv.paid_amount).toLocaleString("hr-HR", { style: "currency", currency: "EUR" })}</span>
          </div>
        )}
        {inv.paid_amount != null && inv.total_amount > inv.paid_amount && (
          <div className="flex justify-between text-sm pt-1 border-t border-slate-200">
            <span className="text-slate-500">Preostalo</span>
            <span className="text-red-500 font-semibold">{Number(inv.total_amount - inv.paid_amount).toLocaleString("hr-HR", { style: "currency", currency: "EUR" })}</span>
          </div>
        )}
      </div>
      {!isPaid && (
        <button onClick={onMarkPaid} disabled={loading}
          className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
          ✓ {loading ? "Obrađivanje..." : "Označi kao plaćeno"}
        </button>
      )}
    </div>
  );
}

export default function Invoices() {
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [toast, setToast] = useState("");
  const qc = useQueryClient();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { data: summary } = useQuery({ queryKey: ["inv-summary"], queryFn: () => apiFetch("/invoices/summary") });
  const { data, isLoading, error } = useQuery({ queryKey: ["invoices"], queryFn: () => apiFetch("/invoices?per_page=20") });

  const invoices = (data as any)?.data ?? [];
  const s = summary as any;

  const mutMarkPaid = useMutation({
    mutationFn: () => {
      if (isDemoMode()) return Promise.resolve({ demo: true });
      return apiFetch(`/invoices/${selected!.id}/pay`, { method: "POST", body: JSON.stringify({ paid_amount: selected!.total_amount }) });
    },
    onSuccess: (res: any) => {
      if (res?.demo) showToast("Demo Mode — plaćanje nije zabilježeno na serveru");
      else { showToast("Faktura označena kao plaćena!"); qc.invalidateQueries({ queryKey: ["invoices"] }); qc.invalidateQueries({ queryKey: ["inv-summary"] }); }
      setSelected(null);
    },
  });

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm shadow-lg">{toast}</div>}
      <h1 className="text-xl font-bold text-slate-900">Fakture</h1>

      {s && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Ukupno", val: s.total_amount ?? 0, curr: true, color: "text-slate-900" },
            { label: "Plaćeno", val: s.paid_amount ?? 0, curr: true, color: "text-green-600" },
            { label: "Neplaćeno", val: s.unpaid_amount ?? 0, curr: true, color: "text-red-500" },
            { label: "Broj faktura", val: s.total_count ?? 0, curr: false, color: "text-slate-900" },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-slate-400 mb-1">{item.label}</p>
              <p className={`text-xl font-bold ${item.color}`}>
                {item.curr ? Number(item.val).toLocaleString("hr-HR", { style: "currency", currency: "EUR" }) : item.val}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100"><p className="font-semibold text-slate-800">Lista faktura</p></div>
        {isLoading && <div className="p-8 space-y-2 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="bg-slate-200 rounded h-14" />)}</div>}
        {error && <div className="text-center py-16 text-slate-400"><p className="text-sm">Greška pri dohvaćanju faktura</p></div>}
        {!isLoading && !error && (
          invoices.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {invoices.map((inv: Invoice) => (
                <div key={inv.id} onClick={() => setSelected(inv)} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-sm shrink-0">🧾</div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{inv.patient?.first_name} {inv.patient?.last_name}</p>
                      <p className="text-xs text-slate-400">#{inv.id} · {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString("hr-HR") : "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-semibold text-slate-800">{Number(inv.total_amount ?? 0).toFixed(2)} €</p>
                      {inv.paid_amount != null && inv.paid_amount !== inv.total_amount && (
                        <p className="text-xs text-slate-400">Plaćeno: {Number(inv.paid_amount).toFixed(2)} €</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inv.status] || "bg-slate-100 text-slate-600"}`}>
                      {STATUS_LABELS[inv.status] || inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="text-center py-16 text-slate-400"><p className="text-3xl mb-2">🧾</p><p className="text-sm">Nema faktura</p></div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalji fakture">
        {selected && <InvoiceDetail inv={selected} onMarkPaid={() => mutMarkPaid.mutate()} loading={mutMarkPaid.isPending} />}
      </Modal>
    </div>
  );
}
