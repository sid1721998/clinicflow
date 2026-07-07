<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Invoice extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = ['clinic_id','patient_id','appointment_id','invoice_number','line_items','subtotal','tax_rate','tax_amount','discount','total','currency','status','paid_at','notes'];
    protected $casts = ['line_items' => 'array', 'paid_at' => 'datetime', 'subtotal' => 'decimal:2', 'tax_rate' => 'decimal:2', 'tax_amount' => 'decimal:2', 'discount' => 'decimal:2', 'total' => 'decimal:2'];

    public function getActivitylogOptions(): LogOptions { return LogOptions::defaults()->logAll()->logOnlyDirty(); }

    protected static function booted(): void {
        static::addGlobalScope('clinic', function ($builder) {
            if (auth()->check()) { $builder->where('clinic_id', auth()->user()->clinic_id); }
        });
    }

    public function clinic() { return $this->belongsTo(Clinic::class); }
    public function patient() { return $this->belongsTo(Patient::class)->withoutGlobalScopes(); }
    public function appointment() { return $this->belongsTo(Appointment::class)->withoutGlobalScopes(); }
}
