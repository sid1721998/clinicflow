<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use HasFactory;
    protected $fillable = ['appointment_id','patient_id','channel','scheduled_at','sent_at','status','message'];
    protected $casts = ['scheduled_at' => 'datetime', 'sent_at' => 'datetime'];

    public function appointment() { return $this->belongsTo(Appointment::class)->withoutGlobalScopes(); }
    public function patient() { return $this->belongsTo(Patient::class)->withoutGlobalScopes(); }
}
