<!DOCTYPE html>
<html lang="hr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #333; }
  .header { background: #0f766e; color: white; padding: 20px; border-radius: 4px; }
  .header h1 { margin: 0; font-size: 22px; }
  .header p { margin: 4px 0; font-size: 11px; }
  .section { margin: 20px 0; }
  .section h2 { color: #0f766e; font-size: 14px; border-bottom: 2px solid #0f766e; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f0fdf4; color: #0f766e; text-align: left; padding: 8px; font-size: 11px; }
  td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
  .total-row { font-weight: bold; background: #f0fdf4; }
  .badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
  .paid { background: #dcfce7; color: #166534; }
  .draft { background: #fef9c3; color: #854d0e; }
  .footer { margin-top: 40px; font-size: 10px; color: #6b7280; text-align: center; }
</style>
</head>
<body>
<div class="header">
  <h1>{{ $invoice->clinic->name }}</h1>
  <p>{{ $invoice->clinic->address }}</p>
  <p>Tel: {{ $invoice->clinic->phone }} | Email: {{ $invoice->clinic->email }}</p>
</div>

<div style="display:flex; justify-content:space-between; margin-top:20px;">
  <div>
    <h3 style="color:#0f766e; margin:0 0 6px 0;">Pacijent</h3>
    <p style="margin:2px 0;"><strong>{{ $invoice->patient->full_name }}</strong></p>
    <p style="margin:2px 0;">{{ $invoice->patient->phone }}</p>
    <p style="margin:2px 0;">{{ $invoice->patient->email }}</p>
  </div>
  <div style="text-align:right;">
    <h2 style="color:#0f766e; margin:0;">FAKTURA</h2>
    <p><strong>Broj:</strong> {{ $invoice->invoice_number }}</p>
    <p><strong>Datum:</strong> {{ $invoice->created_at->format('d.m.Y') }}</p>
    <p><strong>Status:</strong> <span class="badge {{ $invoice->status }}">{{ strtoupper($invoice->status) }}</span></p>
    @if($invoice->paid_at)
    <p><strong>Plaćeno:</strong> {{ $invoice->paid_at->format('d.m.Y') }}</p>
    @endif
  </div>
</div>

<div class="section">
  <h2>Stavke</h2>
  <table>
    <thead><tr><th>Opis</th><th>Kol.</th><th>Cijena</th><th>Iznos</th></tr></thead>
    <tbody>
    @foreach($invoice->line_items as $item)
    <tr>
      <td>{{ $item['description'] ?? '-' }}</td>
      <td>{{ $item['quantity'] ?? 1 }}</td>
      <td>{{ number_format($item['unit_price'] ?? 0, 2) }} {{ $invoice->currency }}</td>
      <td>{{ number_format(($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0), 2) }} {{ $invoice->currency }}</td>
    </tr>
    @endforeach
    </tbody>
  </table>
</div>

<div style="width:260px; margin-left:auto; margin-top:16px;">
  <table>
    <tr><td>Međuzbir:</td><td style="text-align:right;">{{ number_format($invoice->subtotal, 2) }} {{ $invoice->currency }}</td></tr>
    @if($invoice->discount > 0)
    <tr><td>Popust:</td><td style="text-align:right;">- {{ number_format($invoice->discount, 2) }} {{ $invoice->currency }}</td></tr>
    @endif
    <tr><td>PDV ({{ $invoice->tax_rate }}%):</td><td style="text-align:right;">{{ number_format($invoice->tax_amount, 2) }} {{ $invoice->currency }}</td></tr>
    <tr class="total-row" style="font-size:14px;">
      <td>UKUPNO:</td><td style="text-align:right;">{{ number_format($invoice->total, 2) }} {{ $invoice->currency }}</td>
    </tr>
  </table>
</div>

@if($invoice->notes)
<div class="section">
  <h2>Napomena</h2>
  <p>{{ $invoice->notes }}</p>
</div>
@endif

<div class="footer">
  <p>{{ $invoice->clinic->name }} | {{ $invoice->clinic->address }} | {{ $invoice->clinic->email }}</p>
  <p>Dokument generiran: {{ now()->format('d.m.Y H:i') }}</p>
</div>
</body>
</html>
