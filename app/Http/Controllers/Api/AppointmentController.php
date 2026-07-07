<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;

class AppointmentController extends Controller
{
    public function __construct(private AppointmentService $appointmentService) {}

    public function index()
    {
        $appointments = QueryBuilder::for(Appointment::class)
            ->allowedFilters(['status','doctor_id','patient_id','type'])
            ->allowedSorts(['starts_at','created_at'])
            ->with('patient','doctor.user','doctor.specialization')
            ->paginate(15);
        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id'      => 'required|integer',
            'doctor_id'       => 'required|integer',
            'starts_at'       => 'required|date',
            'type'            => 'nullable|string',
            'chief_complaint' => 'nullable|string',
            'notes'           => 'nullable|string',
        ]);
        $appointment = $this->appointmentService->create($data, $request->user()->clinic_id);
        return response()->json($appointment->load('patient','doctor.user'), 201);
    }

    public function show(Appointment $appointment) { return response()->json($appointment->load('patient','doctor.user','reminders')); }

    public function update(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'status'  => 'sometimes|in:scheduled,confirmed,in_progress,completed,cancelled,no_show',
            'notes'   => 'nullable|string',
            'type'    => 'nullable|string',
        ]);
        $appointment->update($data);
        return response()->json($appointment);
    }

    public function destroy(Request $request, Appointment $appointment)
    {
        $data = $request->validate(['cancellation_reason' => 'nullable|string']);
        $appointment->update([
            'status'               => 'cancelled',
            'cancellation_reason'  => $data['cancellation_reason'] ?? null,
            'cancelled_at'         => now(),
        ]);
        return response()->json(['message' => 'Termin je otkazan.']);
    }

    public function today(Request $request)
    {
        $appointments = Appointment::whereDate('starts_at', today())
            ->with('patient','doctor.user')
            ->orderBy('starts_at')
            ->get();
        return response()->json($appointments);
    }

    public function calendar(Request $request)
    {
        $request->validate(['start' => 'required|date', 'end' => 'required|date']);
        $appointments = Appointment::whereBetween('starts_at', [$request->start, $request->end])
            ->with('patient','doctor.user')
            ->get();
        return response()->json($appointments);
    }
}
