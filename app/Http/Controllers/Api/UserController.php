<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('clinic_id', $request->user()->clinic_id)->with('roles')->paginate(15);
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string', 'last_name' => 'required|string',
            'email'      => 'required|email|unique:users',
            'password'   => 'required|min:8',
            'role'       => 'required|in:admin,doctor,receptionist,nurse',
        ]);
        $user = User::create([
            'clinic_id'  => $request->user()->clinic_id,
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
            'role'       => $data['role'],
        ]);
        $user->assignRole($data['role']);
        return response()->json($user->load('roles'), 201);
    }

    public function show(User $user) { return response()->json($user->load('roles')); }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'first_name' => 'sometimes|string', 'last_name' => 'sometimes|string',
            'is_active'  => 'sometimes|boolean', 'role' => 'sometimes|in:admin,doctor,receptionist,nurse',
        ]);
        if (isset($data['role'])) { $user->syncRoles([$data['role']]); }
        $user->update($data);
        return response()->json($user->load('roles'));
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) { return response()->json(['message' => 'Ne možete obrisati vlastiti račun.'], 422); }
        $user->delete();
        return response()->json(['message' => 'Korisnik obrisan.']);
    }
}
