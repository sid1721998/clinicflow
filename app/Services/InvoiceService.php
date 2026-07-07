<?php
namespace App\Services;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class InvoiceService
{
    public function create(array $data, int $clinicId): Invoice
    {
        $lineItems = $data['line_items'] ?? [];
        $subtotal  = collect($lineItems)->sum(fn($i) => ($i['quantity'] ?? 1) * ($i['unit_price'] ?? 0));
        $taxRate   = $data['tax_rate'] ?? 25;
        $discount  = $data['discount'] ?? 0;
        $taxAmount = ($subtotal - $discount) * ($taxRate / 100);
        $total     = $subtotal - $discount + $taxAmount;

        return Invoice::create(array_merge($data, [
            'clinic_id'      => $clinicId,
            'invoice_number' => 'INV-' . date('Y') . '-' . strtoupper(Str::random(6)),
            'subtotal'       => $subtotal,
            'tax_rate'       => $taxRate,
            'tax_amount'     => $taxAmount,
            'discount'       => $discount,
            'total'          => $total,
        ]));
    }

    public function generatePdf(Invoice $invoice): \Barryvdh\DomPDF\PDF
    {
        $invoice->load('patient','appointment','clinic');
        return Pdf::loadView('invoices.pdf', compact('invoice'));
    }
}
