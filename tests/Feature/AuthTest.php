<?php
namespace Tests\Feature;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        foreach (['admin','doctor','receptionist','nurse'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
    }

    public function test_register_kliniku_i_admina(): void
    {
        $response = $this->postJson('/api/register', [
            'clinic_name'          => 'Test Poliklinika Zagreb',
            'clinic_email'         => 'info@test-klinika.hr',
            'first_name'           => 'Test',
            'last_name'            => 'Admin',
            'email'                => 'admin@test-klinika.hr',
            'password'             => 'tajnalozinka123',
            'password_confirmation'=> 'tajnalozinka123',
        ]);
        $response->assertStatus(201)
                 ->assertJsonStructure(['user','clinic','token']);
    }

    public function test_login_s_tocnim_podacima(): void
    {
        $clinic = Clinic::create(['name' => 'Test', 'slug' => 'test-abc12', 'plan' => 'trial']);
        $user   = User::create([
            'clinic_id'  => $clinic->id, 'first_name' => 'Test', 'last_name' => 'User',
            'email'      => 'test@test-klinika.hr', 'password' => bcrypt('lozinka123'),
            'role'       => 'admin', 'is_active' => true,
        ]);
        $user->assignRole('admin');

        $response = $this->postJson('/api/login', ['email' => 'test@test-klinika.hr', 'password' => 'lozinka123']);
        $response->assertStatus(200)->assertJsonStructure(['user','token']);
    }

    public function test_login_s_pogresnom_lozinkom(): void
    {
        $clinic = Clinic::create(['name' => 'Test2', 'slug' => 'test-abc13', 'plan' => 'trial']);
        User::create([
            'clinic_id' => $clinic->id, 'first_name' => 'Test', 'last_name' => 'User',
            'email' => 'test2@test-klinika.hr', 'password' => bcrypt('ispravnalozinka'),
            'role' => 'admin', 'is_active' => true,
        ]);

        $this->postJson('/api/login', ['email' => 'test2@test-klinika.hr', 'password' => 'pogresna'])
             ->assertStatus(401);
    }

    public function test_dohvat_profila_me(): void
    {
        $clinic = Clinic::create(['name' => 'Test3', 'slug' => 'test-abc14', 'plan' => 'trial']);
        $user = User::create([
            'clinic_id' => $clinic->id, 'first_name' => 'Test', 'last_name' => 'User',
            'email' => 'test3@test-klinika.hr', 'password' => bcrypt('lozinka'),
            'role' => 'admin', 'is_active' => true,
        ]);
        $user->assignRole('admin');

        $this->actingAs($user)->getJson('/api/me')
             ->assertStatus(200)->assertJsonPath('email', 'test3@test-klinika.hr');
    }

    public function test_odjava(): void
    {
        $clinic = Clinic::create(['name' => 'Test4', 'slug' => 'test-abc15', 'plan' => 'trial']);
        $user = User::create([
            'clinic_id' => $clinic->id, 'first_name' => 'Test', 'last_name' => 'User',
            'email' => 'test4@test-klinika.hr', 'password' => bcrypt('lozinka'),
            'role' => 'admin', 'is_active' => true,
        ]);
        $user->assignRole('admin');
        $user->createToken('test');

        $this->actingAs($user)->postJson('/api/logout')
             ->assertStatus(200);
    }
}
