<?php
namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Uloge
        foreach (['admin','doctor','receptionist','nurse'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // Demo klinika — Hrvatska
        $clinic = Clinic::firstOrCreate(['slug' => 'demo-poliklinika-zagreb'], [
            'name'          => 'Demo Poliklinika Zagreb',
            'slug'          => 'demo-poliklinika-zagreb',
            'phone'         => '+385 1 234 5678',
            'email'         => 'info@demo-klinika.hr',
            'address'       => 'Ilica 10, 10000 Zagreb, Hrvatska',
            'plan'          => 'pro',
            'trial_ends_at' => now()->addYear(),
            'settings'      => ['currency' => 'EUR', 'timezone' => 'Europe/Zagreb'],
        ]);

        // Admin korisnik
        $admin = User::firstOrCreate(['email' => 'admin@demo-klinika.hr'], [
            'clinic_id'  => $clinic->id,
            'first_name' => 'Marko',
            'last_name'  => 'Horvat',
            'email'      => 'admin@demo-klinika.hr',
            'password'   => Hash::make('demo1234'),
            'role'       => 'admin',
            'is_active'  => true,
        ]);
        $admin->assignRole('admin');

        // Specijalizacije
        $specs = [
            ['name' => 'Opća medicina',      'color' => '#3B82F6'],
            ['name' => 'Kardiologija',        'color' => '#EF4444'],
            ['name' => 'Pedijatrija',         'color' => '#10B981'],
            ['name' => 'Dermatologija',       'color' => '#F59E0B'],
            ['name' => 'Ortopedija',          'color' => '#8B5CF6'],
        ];
        $specModels = [];
        foreach ($specs as $s) {
            $specModels[] = Specialization::firstOrCreate(['name' => $s['name']], $s);
        }

        // 3 doktora
        $doctorData = [
            ['first_name' => 'Ana',   'last_name' => 'Novak',   'email' => 'ana.novak@demo-klinika.hr',   'spec' => 0],
            ['first_name' => 'Ivan',  'last_name' => 'Petrović','email' => 'ivan.petrovic@demo-klinika.hr','spec' => 1],
            ['first_name' => 'Maja',  'last_name' => 'Kovač',   'email' => 'maja.kovac@demo-klinika.hr',  'spec' => 2],
        ];

        $doctors = [];
        foreach ($doctorData as $dd) {
            $user = User::firstOrCreate(['email' => $dd['email']], [
                'clinic_id'  => $clinic->id,
                'first_name' => $dd['first_name'],
                'last_name'  => $dd['last_name'],
                'email'      => $dd['email'],
                'password'   => Hash::make('demo1234'),
                'role'       => 'doctor',
                'is_active'  => true,
            ]);
            $user->assignRole('doctor');

            $doctor = Doctor::firstOrCreate(['user_id' => $user->id], [
                'clinic_id'             => $clinic->id,
                'user_id'               => $user->id,
                'specialization_id'     => $specModels[$dd['spec']]->id,
                'license_number'        => 'HR-' . strtoupper(Str::random(6)),
                'consultation_duration' => 30,
                'price'                 => rand(40, 100),
                'working_hours'         => ['mon-fri' => '08:00-16:00'],
            ]);
            $doctors[] = $doctor;
        }

        // 10 pacijenata
        $patientNames = [
            ['Tomislav','Jurić'], ['Petra','Blažević'], ['Luka','Marić'],
            ['Marina','Šimić'],  ['Stjepan','Babić'],   ['Ivana','Knežević'],
            ['Damir','Vuković'],  ['Antonija','Popović'],['Filip','Đurić'],
            ['Katarina','Radić'],
        ];

        $patients = [];
        foreach ($patientNames as $i => [$fn, $ln]) {
            $patient = Patient::firstOrCreate(['patient_number' => 'PAT-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT)], [
                'clinic_id'      => $clinic->id,
                'patient_number' => 'PAT-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'first_name'     => $fn,
                'last_name'      => $ln,
                'dob'            => Carbon::now()->subYears(rand(20, 75)),
                'gender'         => $i % 2 === 0 ? 'male' : 'female',
                'phone'          => '+385 9' . rand(1000000, 9999999),
                'email'          => strtolower($fn . '.' . $ln . '@email.hr'),
                'blood_type'     => ['A+','A-','B+','B-','AB+','O+','O-'][rand(0,6)],
                'is_active'      => true,
            ]);
            $patients[] = $patient;
        }

        // 20 termina
        $statuses = ['scheduled','confirmed','in_progress','completed','cancelled','no_show'];
        for ($i = 0; $i < 20; $i++) {
            $patient = $patients[$i % count($patients)];
            $doctor  = $doctors[$i % count($doctors)];
            $startsAt = Carbon::now()->addDays(rand(-10, 30))->setHour(rand(8,16))->setMinute(0)->setSecond(0);

            Appointment::firstOrCreate([
                'patient_id' => $patient->id,
                'doctor_id'  => $doctor->id,
                'starts_at'  => $startsAt,
            ], [
                'clinic_id'      => $clinic->id,
                'patient_id'     => $patient->id,
                'doctor_id'      => $doctor->id,
                'starts_at'      => $startsAt,
                'ends_at'        => $startsAt->copy()->addMinutes(30),
                'type'           => 'consultation',
                'status'         => $statuses[$i % count($statuses)],
                'chief_complaint' => 'Rutinski pregled',
            ]);
        }

        $this->command->info('✅ Demo podaci za Hrvatsku su seeded!');
        $this->command->info('📧 Email: admin@demo-klinika.hr');
        $this->command->info('🔑 Lozinka: demo1234');
    }
}
