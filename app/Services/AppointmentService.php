<?php
namespace App\Services;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Reminder;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class AppointmentService
{
    public function create(array $data, int $clinicId): Appointment
    {
        $doctor = Doctor::withoutGlobalScopes()->findOrFail($data['doctor_id']);
        $startsAt = Carbon::parse($data['starts_at']);
        $endsAt = $startsAt->copy()->addMinutes($doctor->consultation_duration);

        $conflict = Appointment::withoutGlobalScopes()
            ->where('doctor_id', $data['doctor_id'])
            ->whereNotIn('status', ['cancelled','no_show'])
            ->where(function ($q) use ($startsAt, $endsAt) {
                $q->whereBetween('starts_at', [$startsAt, $endsAt])
                  ->orWhereBetween('ends_at', [$startsAt, $endsAt])
                  ->orWhere(function ($q2) use ($startsAt, $endsAt) {
                      $q2->where('starts_at', '<=', $startsAt)->where('ends_at', '>=', $endsAt);
                  });
            })->exists();

        if ($conflict) {
            throw ValidationException::withMessages(['starts_at' => ['Doktor nije dostupan u odabranom terminu.']]);
        }

        $appointment = Appointment::create(array_merge($data, [
            'clinic_id' => $clinicId,
            'ends_at'   => $endsAt,
            'status'    => 'scheduled',
        ]));

        Reminder::create([
            'appointment_id' => $appointment->id,
            'patient_id'     => $appointment->patient_id,
            'channel'        => 'email',
            'scheduled_at'   => $startsAt->copy()->subHours(24),
            'status'         => 'pending',
            'message'        => "Podsjetnik za Vaš termin {$startsAt->format('d.m.Y H:i')}.",
        ]);

        return $appointment;
    }
}
