<?php
namespace Tests\Feature;

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PatientTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Clinic $clinic;

    protected function setUp(): void
    {
        parent::setUp();
        foreach (['admin','doctor','receptionist','nurse'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
        $this->clinic = Clinic::create(['name' => 'Test Klinika', 'slug' => 'test-klinika-hr', 'plan' => 'trial']);
        $this->user   = User::create([
            'clinic_id' => $this->clinic->id, 'first_name' => 'Admin', 'last_name' => 'Test',
            'email' => 'admin@test.hr', 'password' => bcrypt('lozinka'), 'role' => 'admin', 'is_active' => true,
        ]);
        $this->user->assignRole('admin');
    }

    public function test_kreiranje_pacijenta(): void
    {
        $this->actingAs($this->user)->postJson('/api/patients', [
            'first_name' => 'Ivan', 'last_name' => 'Horvat', 'gender' => 'male', 'phone' => '+385911234567',
        ])->assertStatus(201)->assertJsonPath('first_name', 'Ivan');
    }

    public function test_lista_pacijenata(): void
    {
        Patient::create(['clinic_id' => $this->clinic->id, 'patient_number' => 'PAT-001', 'first_name' => 'Ana', 'last_name' => 'Novak']);
        $this->actingAs($this->user)->getJson('/api/patients')->assertStatus(200);
    }

    public function test_multi_tenant_izolacija(): void
    {
        $clinic2 = Clinic::create(['name' => 'Druga Klinika', 'slug' => 'druga-klinika-hr', 'plan' => 'trial']);
        Patient::create(['clinic_id' => $clinic2->id, 'patient_number' => 'PAT-002', 'first_name' => 'Tajni', 'last_name' => 'Pacijent']);

        $result = $this->actingAs($this->user)->getJson('/api/patients');
        $result->assertStatus(200);
        $this->assertEquals(0, $result->json('total'));
    }

    public function test_soft_delete_pacijenta(): void
    {
        $patient = Patient::create(['clinic_id' => $this->clinic->id, 'patient_number' => 'PAT-003', 'first_name' => 'Marko', 'last_name' => 'Marić']);
        $this->actingAs($this->user)->deleteJson("/api/patients/{$patient->id}")->assertStatus(200);
        $this->assertSoftDeleted('patients', ['id' => $patient->id]);
    }
}
