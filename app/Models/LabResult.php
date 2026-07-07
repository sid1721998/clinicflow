<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabResult extends Model
{
    use HasFactory;

    protected $fillable = ['clinic_id','patient_id','doctor_id','order_number','test_name','lab_name','ordered_at','collected_at','resulted_at','status','notes'];
    protected $casts = ['ordered_at' => 'datetime', 'collected_at' => 'datetime', 'resulted_at' => 'datetime'];

    protected static function booted(): void {
        static::addGlobalScope('clinic', function ($builder) {
            if (auth()->check()) { $builder->where('clinic_id', auth()->user()->clinic_id); }
        });
    }

    public function clinic() { return $this->belongsTo(Clinic::class); }
    public function patient() { return $this->belongsTo(Patient::class)->withoutGlobalScopes(); }
    public function doctor() { return $this->belongsTo(Doctor::class)->withoutGlobalScopes(); }
    public function items() { return $this->hasMany(LabResultItem::class); }
}
