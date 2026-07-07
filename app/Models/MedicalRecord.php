<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = ['clinic_id','patient_id','appointment_id','doctor_id','record_number','subjective','objective','assessment','plan','icd_codes','vitals','status','signed_by','signed_at'];
    protected $casts = ['icd_codes' => 'array', 'vitals' => 'array', 'signed_at' => 'datetime'];

    protected static function booted(): void {
        static::addGlobalScope('clinic', function ($builder) {
            if (auth()->check()) { $builder->where('clinic_id', auth()->user()->clinic_id); }
        });
    }

    public function clinic() { return $this->belongsTo(Clinic::class); }
    public function patient() { return $this->belongsTo(Patient::class)->withoutGlobalScopes(); }
    public function appointment() { return $this->belongsTo(Appointment::class)->withoutGlobalScopes(); }
    public function doctor() { return $this->belongsTo(Doctor::class)->withoutGlobalScopes(); }
    public function signer() { return $this->belongsTo(User::class, 'signed_by'); }
    public function prescriptions() { return $this->hasMany(Prescription::class); }
    public function documents() { return $this->morphMany(Document::class, 'documentable'); }
}
