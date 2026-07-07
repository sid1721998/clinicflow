<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Specialization;
use Illuminate\Http\Request;

class SpecializationController extends Controller
{
    public function index() { return response()->json(Specialization::all()); }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string', 'description' => 'nullable|string', 'color' => 'nullable|string']);
        return response()->json(Specialization::create($data), 201);
    }

    public function show(Specialization $specialization) { return response()->json($specialization); }
    public function update(Request $request, Specialization $specialization) { $specialization->update($request->only('name','description','color')); return response()->json($specialization); }
    public function destroy(Specialization $specialization) { $specialization->delete(); return response()->json(['message' => 'Obrisano.']); }
}
