<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use App\Services\PrescriptionService;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    public function __construct(private PrescriptionService $prescriptionService) {}

    public function index() { return response()->json(Prescription::with('patient','doctor.user','items')->paginate(15)); }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id'       => 'required|integer',
            'doctor_id'        => 'required|integer',
            'medical_record_id'=> 'nullable|integer',
            'valid_until'      => 'nullable|date',
            'notes'            => 'nullable|string',
            'items'            => 'required|array|min:1',
            'items.*.medication_name' => 'required|string',
            'items.*.dosage'          => 'required|string',
            'items.*.frequency'       => 'required|string',
            'items.*.route'           => 'nullable|string',
            'items.*.duration_days'   => 'nullable|integer',
            'items.*.instructions'    => 'nullable|string',
        ]);
        $prescription = $this->prescriptionService->create($data, $request->user()->clinic_id);
        return response()->json($prescription, 201);
    }

    public function show(Prescription $prescription) { return response()->json($prescription->load('patient','doctor.user','items')); }

    public function update(Request $request, Prescription $prescription)
    {
        $data = $request->validate(['status' => 'sometimes|in:active,dispensed,expired,cancelled', 'notes' => 'nullable|string', 'valid_until' => 'nullable|date']);
        $prescription->update($data);
        return response()->json($prescription);
    }

    public function pdf(Prescription $prescription)
    {
        $pdf = $this->prescriptionService->generatePdf($prescription);
        return $pdf->download("recept-{$prescription->prescription_number}.pdf");
    }
}
