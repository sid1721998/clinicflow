<!DOCTYPE html>
<html lang="hr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #333; }
  .header { background: #1e40af; color: white; padding: 20px; border-radius: 4px; }
  .header h1 { margin: 0; font-size: 20px; }
  .header p { margin: 3px 0; font-size: 11px; }
  .rx-title { font-size: 48px; color: #1e40af; font-weight: bold; margin: 10px 0; }
  .section h2 { color: #1e40af; font-size: 13px; border-bottom: 2px solid #1e40af; padding-bottom: 4px; }
  .drug-card { background: #eff6ff; border-left: 4px solid #1e40af; padding: 10px; margin: 8px 0; border-radius: 2px; }
  .drug-name { font-size: 14px; font-weight: bold; color: #1e3a8a; }
  .drug-detail { font-size: 11px; color: #374151; margin: 2px 0; }
  .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 10px; color: #6b7280; }
  .signature-box { border: 1px solid #ccc; width: 200px; height: 60px; margin-top: 10px; text-align: center; padding-top: 30px; font-size: 10px; color: #9ca3af; }
</style>
</head>
<body>
<div class="header">
  <h1>{{ $prescription->clinic->name }}</h1>
  <p>{{ $prescription->clinic->address }}</p>
  <p>Tel: {{ $prescription->clinic->phone }} | Email: {{ $prescription->clinic->email }}</p>
</div>

<div class="rx-title">℞</div>

<div style="display:flex; justify-content:space-between;">
  <div>
    <p><strong>Pacijent:</strong> {{ $prescription->patient->full_name }}</p>
    <p><strong>Datum rođenja:</strong> {{ $prescription->patient->dob?->format('d.m.Y') ?? '-' }}</p>
  </div>
  <div style="text-align:right;">
    <p><strong>Broj recepta:</strong> {{ $prescription->prescription_number }}</p>
    <p><strong>Datum:</strong> {{ $prescription->created_at->format('d.m.Y') }}</p>
    @if($prescription->valid_until)
    <p><strong>Vrijedi do:</strong> {{ $prescription->valid_until->format('d.m.Y') }}</p>
    @endif
  </div>
</div>

<div class="section" style="margin-top:16px;">
  <h2>Propisani lijekovi</h2>
  @foreach($prescription->items as $item)
  <div class="drug-card">
    <div class="drug-name">{{ $item->medication_name }}</div>
    <div class="drug-detail"><strong>Doza:</strong> {{ $item->dosage }}</div>
    <div class="drug-detail"><strong>Učestalost:</strong> {{ $item->frequency }}</div>
    @if($item->route)<div class="drug-detail"><strong>Način primjene:</strong> {{ $item->route }}</div>@endif
    @if($item->duration_days)<div class="drug-detail"><strong>Trajanje:</strong> {{ $item->duration_days }} dana</div>@endif
    @if($item->instructions)<div class="drug-detail"><strong>Upute:</strong> {{ $item->instructions }}</div>@endif
  </div>
  @endforeach
</div>

@if($prescription->notes)
<div class="section">
  <h2>Napomena</h2>
  <p>{{ $prescription->notes }}</p>
</div>
@endif

<div class="footer">
  <div style="display:flex; justify-content:space-between; align-items:flex-end;">
    <div>
      <p><strong>Doktor:</strong> {{ $prescription->doctor->full_name }}</p>
      <p><strong>Specijalizacija:</strong> {{ $prescription->doctor->specialization?->name ?? '-' }}</p>
      <p><strong>Licencni broj:</strong> {{ $prescription->doctor->license_number ?? '-' }}</p>
    </div>
    <div style="text-align:center;">
      <div class="signature-box">Potpis doktora</div>
    </div>
  </div>
  <p style="text-align:center; margin-top:10px;">Dokument generiran: {{ now()->format('d.m.Y H:i') }}</p>
</div>
</body>
</html>
