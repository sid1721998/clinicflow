<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Patient extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = ['clinic_id','patient_number','first_name','last_name','dob','gender','phone','email','address','blood_type','allergies','chronic_conditions','insurance_number','emergency_contact','notes','is_active'];
    protected $casts = ['dob' => 'date', 'allergies' => 'array', 'chronic_conditions' => 'array', 'emergency_contact' => 'array', 'is_active' => 'boolean'];

    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }

    protected static function booted(): void {
        static::addGlobalScope('clinic', function ($builder) {
            if (auth()->check()) { $builder->where('clinic_id', auth()->user()->clinic_id); }
        });
    }

    public function clinic() { return $this->belongsTo(Clinic::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
    public function medicalRecords() { return $this->hasMany(MedicalRecord::class); }
    public function prescriptions() { return $this->hasMany(Prescription::class); }
    public function labResults() { return $this->hasMany(LabResult::class); }
    public function invoices() { return $this->hasMany(Invoice::class); }
    public function documents() { return $this->morphMany(Document::class, 'documentable'); }
    public function getFullNameAttribute() { return "{$this->first_name} {$this->last_name}"; }
}
