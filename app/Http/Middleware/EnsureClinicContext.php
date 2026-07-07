<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureClinicContext
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check() && !auth()->user()->clinic_id) {
            return response()->json(['message' => 'Klinički kontekst nije pronađen.'], 403);
        }
        return $next($request);
    }
}
