<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = ['clinic_id','patient_id','doctor_id','medical_record_id','prescription_number','notes','valid_until','status'];
    protected $casts = ['valid_until' => 'date'];

    protected static function booted(): void {
        static::addGlobalScope('clinic', function ($builder) {
            if (auth()->check()) { $builder->where('clinic_id', auth()->user()->clinic_id); }
        });
    }

    public function clinic() { return $this->belongsTo(Clinic::class); }
    public function patient() { return $this->belongsTo(Patient::class)->withoutGlobalScopes(); }
    public function doctor() { return $this->belongsTo(Doctor::class)->withoutGlobalScopes(); }
    public function medicalRecord() { return $this->belongsTo(MedicalRecord::class)->withoutGlobalScopes(); }
    public function items() { return $this->hasMany(PrescriptionItem::class); }
}
