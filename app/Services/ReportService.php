<?php
namespace App\Services;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Invoice;
use Carbon\Carbon;
use League\Csv\Writer;

class ReportService
{
    public function revenue(string $from, string $to, int $clinicId): array
    {
        $invoices = Invoice::withoutGlobalScopes()
            ->where('clinic_id', $clinicId)
            ->where('status', 'paid')
            ->whereBetween('paid_at', [Carbon::parse($from)->startOfDay(), Carbon::parse($to)->endOfDay()])
            ->get();

        return [
            'total'    => $invoices->sum('total'),
            'count'    => $invoices->count(),
            'currency' => 'EUR',
            'invoices' => $invoices,
        ];
    }

    public function doctors(int $clinicId): array
    {
        $doctors = Doctor::withoutGlobalScopes()
            ->where('clinic_id', $clinicId)
            ->with('user','specialization')
            ->withCount('appointments')
            ->get()
            ->map(function ($doctor) {
                $revenue = Invoice::withoutGlobalScopes()
                    ->whereHas('appointment', fn($q) => $q->where('doctor_id', $doctor->id))
                    ->where('status','paid')->sum('total');
                return array_merge($doctor->toArray(), ['revenue' => $revenue]);
            });

        return ['doctors' => $doctors];
    }

    public function exportCsv(string $type, int $clinicId): string
    {
        $writer = Writer::createFromString('');

        if ($type === 'revenue') {
            $writer->insertOne(['Broj fakture','Pacijent','Datum plaćanja','Iznos','Valuta']);
            $rows = Invoice::withoutGlobalScopes()
                ->where('clinic_id', $clinicId)->where('status','paid')
                ->with('patient')->get();
            foreach ($rows as $row) {
                $writer->insertOne([$row->invoice_number, $row->patient?->full_name, $row->paid_at?->format('d.m.Y'), $row->total, $row->currency]);
            }
        } elseif ($type === 'appointments') {
            $writer->insertOne(['Datum','Pacijent','Doktor','Status','Vrsta']);
            $rows = Appointment::withoutGlobalScopes()
                ->where('clinic_id', $clinicId)
                ->with('patient','doctor.user')->get();
            foreach ($rows as $row) {
                $writer->insertOne([$row->starts_at->format('d.m.Y H:i'), $row->patient?->full_name, $row->doctor?->full_name, $row->status, $row->type]);
            }
        }

        return $writer->toString();
    }
}
