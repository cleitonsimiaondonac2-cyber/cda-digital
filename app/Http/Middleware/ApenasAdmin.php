<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApenasAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $utilizador = $request->user();

        abort_unless($utilizador && $utilizador->is_admin && $utilizador->ativo, 403);

        return $next($request);
    }
}
