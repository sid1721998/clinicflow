<?php
namespace App\Services;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    public function register(array $data): array
    {
        $clinic = Clinic::create([
            'name'          => $data['clinic_name'],
            'slug'          => Str::slug($data['clinic_name']) . '-' . Str::random(5),
            'phone'         => $data['clinic_phone'] ?? null,
            'email'         => $data['clinic_email'] ?? null,
            'address'       => $data['clinic_address'] ?? null,
            'plan'          => 'trial',
            'trial_ends_at' => now()->addDays(30),
        ]);

        $user = User::create([
            'clinic_id'  => $clinic->id,
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
            'role'       => 'admin',
            'is_active'  => true,
        ]);

        $user->assignRole('admin');

        return ['clinic' => $clinic, 'user' => $user];
    }
}
