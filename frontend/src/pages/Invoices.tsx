import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

const STATUS_LABELS: Record<string, string> = { paid:"Plaćeno", unpaid:"Neplaćeno", partially_paid:"Djelomično", cancelled:"Otkazano" };
const STATUS_COLORS: Record<string, string> = { paid:"bg-green-100 text-green-700", unpaid:"bg-red-100 text-red-700", partially_paid:"bg-amber-100 text-amber-700", cancelled:"bg-gray-100 text-gray-600" };

export default function Invoices() {
  const { data: summary } = useQuery({ queryKey: ["inv-summary"], queryFn: () => apiFetch("/invoices/summary") });
  const { data, isLoading, error } = useQuery({ queryKey: ["invoices"], queryFn: () => apiFetch("/invoices?per_page=20") });

  const s = summary as any;
  const invoices = (data as any)?.data ?? [];

  return (
    <div className="space-y-6">
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
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="font-semibold text-slate-800">Lista faktura</p>
        </div>
        {isLoading && <div className="p-8 space-y-2 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="bg-slate-200 rounded h-14" />)}</div>}
        {error && <div className="text-center py-16 text-slate-400"><p className="text-sm">Greška pri dohvaćanju faktura</p></div>}
        {!isLoading && !error && (
          invoices.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {invoices.map((inv: any) => (
                <div key={inv.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition">
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
          ) : (
            <div className="text-center py-16 text-slate-400"><p className="text-3xl mb-2">🧾</p><p className="text-sm">Nema faktura</p></div>
          )
        )}
      </div>
    </div>
  );
}
