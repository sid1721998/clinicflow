<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\Patient;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $totalPatients  = Patient::withoutGlobalScopes()->where('clinic_id', $clinicId)->count();
        $totalDoctors   = Doctor::withoutGlobalScopes()->where('clinic_id', $clinicId)->count();
        $todayAppts     = Appointment::withoutGlobalScopes()->where('clinic_id', $clinicId)->whereDate('starts_at', today())->count();
        $monthAppts     = Appointment::withoutGlobalScopes()->where('clinic_id', $clinicId)->whereMonth('starts_at', now()->month)->whereYear('starts_at', now()->year)->count();
        $monthRevenue   = Invoice::withoutGlobalScopes()->where('clinic_id', $clinicId)->where('status','paid')->whereMonth('paid_at', now()->month)->sum('total');
        $totalRevenue   = Invoice::withoutGlobalScopes()->where('clinic_id', $clinicId)->where('status','paid')->sum('total');

        $statusStats = Appointment::withoutGlobalScopes()->where('clinic_id', $clinicId)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')->pluck('count','status');

        $todayDetails = Appointment::withoutGlobalScopes()
            ->where('clinic_id', $clinicId)
            ->whereDate('starts_at', today())
            ->with('patient','doctor.user')
            ->orderBy('starts_at')
            ->get();

        return response()->json(compact(
            'totalPatients','totalDoctors','todayAppts','monthAppts',
            'monthRevenue','totalRevenue','statusStats','todayDetails'
        ));
    }
}
