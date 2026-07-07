<?php
namespace App\Services;

use App\Models\Prescription;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class PrescriptionService
{
    public function create(array $data, int $clinicId): Prescription
    {
        $prescription = Prescription::create(array_merge($data, [
            'clinic_id'           => $clinicId,
            'prescription_number' => 'RX-' . strtoupper(Str::random(8)),
        ]));

        if (!empty($data['items'])) {
            foreach ($data['items'] as $item) {
                $prescription->items()->create($item);
            }
        }

        return $prescription->load('items','patient','doctor.user','clinic');
    }

    public function generatePdf(Prescription $prescription): \Barryvdh\DomPDF\PDF
    {
        $prescription->load('items','patient','doctor.user','doctor.specialization','clinic');
        return Pdf::loadView('prescriptions.pdf', compact('prescription'));
    }
}
