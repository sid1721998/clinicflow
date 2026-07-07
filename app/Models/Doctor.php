<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = ['clinic_id','user_id','specialization_id','license_number','working_hours','consultation_duration','price'];
    protected $casts = ['working_hours' => 'array', 'price' => 'decimal:2'];

    protected static function booted(): void {
        static::addGlobalScope('clinic', function ($builder) {
            if (auth()->check()) { $builder->where('clinic_id', auth()->user()->clinic_id); }
        });
    }

    public function clinic() { return $this->belongsTo(Clinic::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function specialization() { return $this->belongsTo(Specialization::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
    public function getFullNameAttribute() { return $this->user?->full_name ?? ''; }
}
