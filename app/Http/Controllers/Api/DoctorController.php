<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Spatie\QueryBuilder\QueryBuilder;

class DoctorController extends Controller
{
    public function index()
    {
        $doctors = QueryBuilder::for(Doctor::class)
            ->allowedFilters(['specialization_id'])
            ->allowedSorts(['created_at'])
            ->with('user','specialization')
            ->paginate(15);
        return response()->json($doctors);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name'            => 'required|string',
            'last_name'             => 'required|string',
            'email'                 => 'required|email|unique:users',
            'password'              => 'required|min:8',
            'specialization_id'     => 'nullable|exists:specializations,id',
            'license_number'        => 'nullable|string',
            'working_hours'         => 'nullable|array',
            'consultation_duration' => 'nullable|integer|min:5',
            'price'                 => 'nullable|numeric|min:0',
        ]);

        $user = User::create([
            'clinic_id'  => $request->user()->clinic_id,
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
            'role'       => 'doctor',
        ]);
        $user->assignRole('doctor');

        $doctor = Doctor::create([
            'clinic_id'             => $request->user()->clinic_id,
            'user_id'               => $user->id,
            'specialization_id'     => $data['specialization_id'] ?? null,
            'license_number'        => $data['license_number'] ?? null,
            'working_hours'         => $data['working_hours'] ?? null,
            'consultation_duration' => $data['consultation_duration'] ?? 30,
            'price'                 => $data['price'] ?? 0,
        ]);

        return response()->json($doctor->load('user','specialization'), 201);
    }

    public function show(Doctor $doctor) { return response()->json($doctor->load('user','specialization')); }

    public function update(Request $request, Doctor $doctor)
    {
        $data = $request->validate([
            'specialization_id'     => 'nullable|exists:specializations,id',
            'license_number'        => 'nullable|string',
            'working_hours'         => 'nullable|array',
            'consultation_duration' => 'nullable|integer',
            'price'                 => 'nullable|numeric',
        ]);
        $doctor->update($data);
        return response()->json($doctor->load('user','specialization'));
    }

    public function destroy(Doctor $doctor) { $doctor->user()->delete(); $doctor->delete(); return response()->json(['message' => 'Doktor obrisan.']); }

    public function availability(Request $request, Doctor $doctor)
    {
        $request->validate(['date' => 'required|date']);
        $date = Carbon::parse($request->date);
        $appointments = Appointment::withoutGlobalScopes()
            ->where('doctor_id', $doctor->id)
            ->whereDate('starts_at', $date)
            ->whereNotIn('status', ['cancelled','no_show'])
            ->get(['starts_at','ends_at']);

        $slots = [];
        $start = $date->copy()->setHour(8)->setMinute(0);
        $end   = $date->copy()->setHour(18)->setMinute(0);

        while ($start->lt($end)) {
            $slotEnd = $start->copy()->addMinutes($doctor->consultation_duration);
            $busy = $appointments->first(fn($a) => $a->starts_at < $slotEnd && $a->ends_at > $start);
            $slots[] = ['starts_at' => $start->toIso8601String(), 'ends_at' => $slotEnd->toIso8601String(), 'available' => !$busy];
            $start->addMinutes($doctor->consultation_duration);
        }

        return response()->json(['slots' => $slots]);
    }
}
