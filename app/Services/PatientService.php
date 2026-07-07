<?php
namespace App\Services;

use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\LabResult;

class PatientService
{
    public function timeline(Patient $patient): array
    {
        $appointments = Appointment::withoutGlobalScopes()
            ->where('patient_id', $patient->id)
            ->with(['doctor.user','doctor.specialization'])
            ->orderByDesc('starts_at')->get();

        $records = MedicalRecord::withoutGlobalScopes()
            ->where('patient_id', $patient->id)
            ->with('doctor.user')
            ->orderByDesc('created_at')->get();

        $prescriptions = Prescription::withoutGlobalScopes()
            ->where('patient_id', $patient->id)
            ->with(['doctor.user','items'])
            ->orderByDesc('created_at')->get();

        $labResults = LabResult::withoutGlobalScopes()
            ->where('patient_id', $patient->id)
            ->with(['doctor.user','items'])
            ->orderByDesc('ordered_at')->get();

        return compact('appointments','records','prescriptions','labResults');
    }
}
