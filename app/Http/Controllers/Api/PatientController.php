<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Services\PatientService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\QueryBuilder;

class PatientController extends Controller
{
    public function __construct(private PatientService $patientService) {}

    public function index(Request $request)
    {
        $patients = QueryBuilder::for(Patient::class)
            ->allowedFilters(['first_name','last_name','email','phone','blood_type','gender'])
            ->allowedSorts(['first_name','last_name','created_at'])
            ->with('clinic')
            ->paginate($request->get('per_page', 15));
        return response()->json($patients);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name'        => 'required|string',
            'last_name'         => 'required|string',
            'dob'               => 'nullable|date',
            'gender'            => 'nullable|in:male,female,other',
            'phone'             => 'nullable|string',
            'email'             => 'nullable|email',
            'address'           => 'nullable|string',
            'blood_type'        => 'nullable|string',
            'allergies'         => 'nullable|array',
            'chronic_conditions'=> 'nullable|array',
            'insurance_number'  => 'nullable|string',
            'emergency_contact' => 'nullable|array',
            'notes'             => 'nullable|string',
        ]);

        $data['clinic_id']      = $request->user()->clinic_id;
        $data['patient_number'] = 'PAT-' . strtoupper(Str::random(8));

        $patient = Patient::create($data);
        return response()->json($patient, 201);
    }

    public function show(Patient $patient) { return response()->json($patient); }

    public function update(Request $request, Patient $patient)
    {
        $data = $request->validate([
            'first_name' => 'sometimes|string', 'last_name' => 'sometimes|string',
            'dob' => 'nullable|date', 'gender' => 'nullable|string',
            'phone' => 'nullable|string', 'email' => 'nullable|email',
            'address' => 'nullable|string', 'blood_type' => 'nullable|string',
            'allergies' => 'nullable|array', 'chronic_conditions' => 'nullable|array',
            'insurance_number' => 'nullable|string', 'emergency_contact' => 'nullable|array',
            'notes' => 'nullable|string', 'is_active' => 'sometimes|boolean',
        ]);
        $patient->update($data);
        return response()->json($patient);
    }

    public function destroy(Patient $patient) { $patient->delete(); return response()->json(['message' => 'Pacijent uspješno obrisan.']); }

    public function timeline(Patient $patient) { return response()->json($this->patientService->timeline($patient)); }
}
