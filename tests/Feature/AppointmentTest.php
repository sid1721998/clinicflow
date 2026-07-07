<?php
namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Carbon\Carbon;

class AppointmentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Clinic $clinic;
    private Doctor $doctor;
    private Patient $patient;

    protected function setUp(): void
    {
        parent::setUp();
        foreach (['admin','doctor','receptionist','nurse'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
        $this->clinic  = Clinic::create(['name' => 'Test Klinika', 'slug' => 'test-appt-hr', 'plan' => 'trial']);
        $this->user    = User::create(['clinic_id' => $this->clinic->id, 'first_name' => 'Admin', 'last_name' => 'Test', 'email' => 'admin@appt.hr', 'password' => bcrypt('lozinka'), 'role' => 'admin', 'is_active' => true]);
        $this->user->assignRole('admin');

        $spec = Specialization::create(['name' => 'Opća medicina', 'color' => '#333']);
        $docUser = User::create(['clinic_id' => $this->clinic->id, 'first_name' => 'Dr', 'last_name' => 'Test', 'email' => 'dr@appt.hr', 'password' => bcrypt('lozinka'), 'role' => 'doctor', 'is_active' => true]);
        $this->doctor  = Doctor::create(['clinic_id' => $this->clinic->id, 'user_id' => $docUser->id, 'specialization_id' => $spec->id, 'consultation_duration' => 30, 'price' => 50]);
        $this->patient = Patient::create(['clinic_id' => $this->clinic->id, 'patient_number' => 'PAT-001', 'first_name' => 'Pero', 'last_name' => 'Perić']);
    }

    public function test_kreiranje_termina(): void
    {
        $this->actingAs($this->user)->postJson('/api/appointments', [
            'patient_id' => $this->patient->id,
            'doctor_id'  => $this->doctor->id,
            'starts_at'  => Carbon::now()->addDays(3)->setHour(10)->setMinute(0)->toIso8601String(),
            'type'       => 'consultation',
        ])->assertStatus(201)->assertJsonPath('status', 'scheduled');
    }

    public function test_lista_termina(): void
    {
        $this->actingAs($this->user)->getJson('/api/appointments')->assertStatus(200);
    }

    public function test_termini_danas(): void
    {
        $this->actingAs($this->user)->getJson('/api/appointments/today')->assertStatus(200);
    }

    public function test_otkazivanje_termina(): void
    {
        $appt = Appointment::create(['clinic_id' => $this->clinic->id, 'patient_id' => $this->patient->id, 'doctor_id' => $this->doctor->id, 'starts_at' => Carbon::now()->addDays(5), 'ends_at' => Carbon::now()->addDays(5)->addMinutes(30), 'status' => 'scheduled']);
        $this->actingAs($this->user)->deleteJson("/api/appointments/{$appt->id}", ['cancellation_reason' => 'Pacijent otkazao.'])
             ->assertStatus(200);
        $this->assertDatabaseHas('appointments', ['id' => $appt->id, 'status' => 'cancelled']);
    }
}
