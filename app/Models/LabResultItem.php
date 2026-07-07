<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabResultItem extends Model
{
    use HasFactory;
    protected $fillable = ['lab_result_id','test_name','value','unit','reference_range','flag'];
    public function labResult() { return $this->belongsTo(LabResult::class); }
}
