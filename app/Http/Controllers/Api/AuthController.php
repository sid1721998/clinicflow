<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FALaravel\Support\Authenticator;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(Request $request)
    {
        $data = $request->validate([
            'clinic_name'    => 'required|string|max:255',
            'clinic_phone'   => 'nullable|string',
            'clinic_email'   => 'nullable|email',
            'clinic_address' => 'nullable|string',
            'first_name'     => 'required|string',
            'last_name'      => 'required|string',
            'email'          => 'required|email|unique:users',
            'password'       => 'required|min:8|confirmed',
        ]);

        $result = $this->authService->register($data);
        $token  = $result['user']->createToken('api')->plainTextToken;

        return response()->json(['user' => $result['user'], 'clinic' => $result['clinic'], 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $request->validate(['email' => 'required|email', 'password' => 'required']);

        if (!Auth::attempt($request->only('email','password'))) {
            return response()->json(['message' => 'Pogrešni podaci za prijavu.'], 401);
        }

        $user  = Auth::user();
        if (!$user->is_active) {
            Auth::logout();
            return response()->json(['message' => 'Korisnički račun je deaktiviran.'], 403);
        }

        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['user' => $user->load('clinic'), 'token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Uspješno ste se odjavili.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('clinic','roles'));
    }

    public function setup2fa(Request $request)
    {
        $google2fa = app('pragmarx.google2fa');
        $secret    = $google2fa->generateSecretKey();
        $request->user()->update(['two_factor_secret' => $secret]);
        $qrCode = $google2fa->getQRCodeUrl(config('app.name'), $request->user()->email, $secret);
        return response()->json(['secret' => $secret, 'qr_code_url' => $qrCode]);
    }

    public function verify2fa(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        $google2fa = app('pragmarx.google2fa');
        $user      = $request->user();
        $valid     = $google2fa->verifyKey($user->two_factor_secret, $request->code);
        if (!$valid) { return response()->json(['message' => 'Nevažeći kôd.'], 422); }
        $user->update(['two_factor_enabled' => true]);
        return response()->json(['message' => 'Dvofaktorska autentifikacija aktivirana.']);
    }

    public function disable2fa(Request $request)
    {
        $request->validate(['password' => 'required']);
        if (!Hash::check($request->password, $request->user()->password)) {
            return response()->json(['message' => 'Pogrešna lozinka.'], 422);
        }
        $request->user()->update(['two_factor_enabled' => false, 'two_factor_secret' => null]);
        return response()->json(['message' => 'Dvofaktorska autentifikacija deaktivirana.']);
    }
}
