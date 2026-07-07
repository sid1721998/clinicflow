<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Appointment extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = ['clinic_id','patient_id','doctor_id','starts_at','ends_at','type','status','chief_complaint','notes','cancellation_reason','cancelled_at'];
    protected $casts = ['starts_at' => 'datetime', 'ends_at' => 'datetime', 'cancelled_at' => 'datetime'];

    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }

    protected static function booted(): void {
        static::addGlobalScope('clinic', function ($builder) {
            if (auth()->check()) { $builder->where('clinic_id', auth()->user()->clinic_id); }
        });
    }

    public function clinic() { return $this->belongsTo(Clinic::class); }
    public function patient() { return $this->belongsTo(Patient::class)->withoutGlobalScopes(); }
    public function doctor() { return $this->belongsTo(Doctor::class)->withoutGlobalScopes(); }
    public function medicalRecord() { return $this->hasOne(MedicalRecord::class); }
    public function invoice() { return $this->hasOne(Invoice::class); }
    public function reminders() { return $this->hasMany(Reminder::class); }
    public function documents() { return $this->morphMany(Document::class, 'documentable'); }
}
