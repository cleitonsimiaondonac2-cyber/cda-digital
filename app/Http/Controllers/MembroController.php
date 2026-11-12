<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MembroController extends Controller
{
    public function area(Request $request)
    {
        $membro = $request->user();

        return view('membro.area', [
            'membro' => $membro,
            'registo' => \App\Models\MembroPublico::where('n_carta', $membro->carteira)->first(),
            'quotas' => $membro->quotas()->orderByDesc('ano')->get(),
            'requerimentos' => $membro->requerimentos()->latest()->get(),
        ]);
    }

    public function requerimento(Request $request): RedirectResponse
    {
        $dados = $request->validate([
            'tipo' => ['required', 'string', 'min:2', 'max:80'],
            'descricao' => ['nullable', 'string', 'max:2000'],
        ]);

        $request->user()->requerimentos()->create($dados);

        return back()->with('estado', 'Requerimento submetido.');
    }
}
