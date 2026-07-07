<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $reportService) {}

    public function revenue(Request $request)
    {
        $request->validate(['from' => 'required|date', 'to' => 'required|date']);
        return response()->json($this->reportService->revenue($request->from, $request->to, $request->user()->clinic_id));
    }

    public function doctors(Request $request)
    {
        return response()->json($this->reportService->doctors($request->user()->clinic_id));
    }

    public function export(Request $request)
    {
        $request->validate(['type' => 'required|in:revenue,appointments']);
        $csv = $this->reportService->exportCsv($request->type, $request->user()->clinic_id);
        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"izvjestaj-{$request->type}.csv\"",
        ]);
    }
}
