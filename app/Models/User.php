<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = ['clinic_id','first_name','last_name','email','password','role','two_factor_secret','two_factor_enabled','is_active'];
    protected $hidden = ['password','remember_token','two_factor_secret'];
    protected $casts = ['two_factor_enabled' => 'boolean', 'is_active' => 'boolean'];

    public function clinic() { return $this->belongsTo(Clinic::class); }
    public function doctor() { return $this->hasOne(Doctor::class); }
    public function getFullNameAttribute() { return "{$this->first_name} {$this->last_name}"; }
}
