<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabResult;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LabResultController extends Controller
{
    public function index() { return response()->json(LabResult::with('patient','doctor.user','items')->paginate(15)); }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|integer', 'doctor_id' => 'required|integer',
            'test_name'  => 'required|string', 'lab_name' => 'nullable|string',
            'ordered_at' => 'nullable|date', 'notes' => 'nullable|string',
            'items'      => 'nullable|array',
            'items.*.test_name' => 'required|string', 'items.*.value' => 'nullable|string',
            'items.*.unit' => 'nullable|string', 'items.*.reference_range' => 'nullable|string',
            'items.*.flag' => 'nullable|in:normal,low,high,critical',
        ]);
        $data['clinic_id']    = $request->user()->clinic_id;
        $data['order_number'] = 'LAB-' . strtoupper(Str::random(8));
        $items = $data['items'] ?? [];
        unset($data['items']);
        $lab = LabResult::create($data);
        foreach ($items as $item) { $lab->items()->create($item); }
        return response()->json($lab->load('items'), 201);
    }

    public function show(LabResult $labResult) { return response()->json($labResult->load('patient','doctor.user','items')); }

    public function update(Request $request, LabResult $labResult)
    {
        $data = $request->validate(['status' => 'sometimes|in:ordered,collected,processing,completed,cancelled', 'resulted_at' => 'nullable|date', 'collected_at' => 'nullable|date', 'notes' => 'nullable|string']);
        $labResult->update($data);
        return response()->json($labResult);
    }
}
