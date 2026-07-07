<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;

class InvoiceController extends Controller
{
    public function __construct(private InvoiceService $invoiceService) {}

    public function index()
    {
        $invoices = QueryBuilder::for(Invoice::class)
            ->allowedFilters(['status','currency'])
            ->with('patient','appointment')
            ->paginate(15);
        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id'     => 'required|integer',
            'appointment_id' => 'nullable|integer',
            'line_items'     => 'required|array',
            'tax_rate'       => 'nullable|numeric',
            'discount'       => 'nullable|numeric',
            'currency'       => 'nullable|in:EUR,HRK,USD',
            'notes'          => 'nullable|string',
        ]);
        $invoice = $this->invoiceService->create($data, $request->user()->clinic_id);
        return response()->json($invoice, 201);
    }

    public function show(Invoice $invoice) { return response()->json($invoice->load('patient','appointment')); }

    public function update(Request $request, Invoice $invoice)
    {
        $data = $request->validate(['status' => 'sometimes|in:draft,sent,paid,cancelled,refunded', 'notes' => 'nullable|string']);
        $invoice->update($data);
        return response()->json($invoice);
    }

    public function markPaid(Invoice $invoice)
    {
        $invoice->update(['status' => 'paid', 'paid_at' => now()]);
        return response()->json($invoice);
    }

    public function pdf(Invoice $invoice)
    {
        $pdf = $this->invoiceService->generatePdf($invoice);
        return $pdf->download("faktura-{$invoice->invoice_number}.pdf");
    }

    public function summary(Request $request)
    {
        $clinicId = $request->user()->clinic_id;
        $statuses  = ['draft','sent','paid','cancelled','refunded'];
        $summary   = [];
        foreach ($statuses as $status) {
            $q = Invoice::withoutGlobalScopes()->where('clinic_id', $clinicId)->where('status', $status);
            $summary[$status] = ['count' => $q->count(), 'total' => $q->sum('total')];
        }
        return response()->json($summary);
    }
}
