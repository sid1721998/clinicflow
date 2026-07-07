<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MedicalRecordController extends Controller
{
    public function index() { return response()->json(MedicalRecord::with('patient','doctor.user')->paginate(15)); }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id'     => 'required|integer',
            'appointment_id' => 'nullable|integer',
            'doctor_id'      => 'required|integer',
            'subjective'     => 'nullable|string',
            'objective'      => 'nullable|string',
            'assessment'     => 'nullable|string',
            'plan'           => 'nullable|string',
            'icd_codes'      => 'nullable|array',
            'vitals'         => 'nullable|array',
        ]);
        $data['clinic_id']     = $request->user()->clinic_id;
        $data['record_number'] = 'MR-' . strtoupper(Str::random(8));
        $record = MedicalRecord::create($data);
        return response()->json($record, 201);
    }

    public function show(MedicalRecord $medicalRecord) { return response()->json($medicalRecord->load('patient','doctor.user','prescriptions')); }

    public function update(Request $request, MedicalRecord $medicalRecord)
    {
        if ($medicalRecord->status === 'signed') { return response()->json(['message' => 'Potpisani karton se ne može uređivati.'], 422); }
        $data = $request->validate(['subjective' => 'nullable|string','objective' => 'nullable|string','assessment' => 'nullable|string','plan' => 'nullable|string','icd_codes' => 'nullable|array','vitals' => 'nullable|array']);
        $medicalRecord->update($data);
        return response()->json($medicalRecord);
    }

    public function sign(Request $request, MedicalRecord $medicalRecord)
    {
        if ($medicalRecord->status === 'signed') { return response()->json(['message' => 'Karton je već potpisan.'], 422); }
        $medicalRecord->update(['status' => 'signed', 'signed_by' => $request->user()->id, 'signed_at' => now()]);
        return response()->json($medicalRecord->load('signer'));
    }
}
