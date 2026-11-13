@extends('layouts.app')
@section('titulo', 'Contactos')
@section('conteudo')
<h1 class="text-2xl font-semibold mb-4">Contactos</h1>
<div class="flex flex-wrap gap-8">
    <div class="flex-[1_1_16rem] text-sm leading-relaxed">
        <p><strong>Telefones:</strong> +258 21 305 504 / 305 506</p>
        <p class="mt-2 text-zinc-600">Use o formulario para enviar uma mensagem a Camara.</p>
    </div>
    <form method="POST" action="{{ route('contactos.enviar') }}" class="flex-[2_1_24rem] bg-white border border-zinc-200 rounded-lg p-5 flex flex-col gap-4">
        @csrf
        @foreach ([['nome','Nome'],['email','Email'],['assunto','Assunto']] as [$c, $r])
            <label class="flex flex-col gap-1 text-sm">{{ $r }}
                <input name="{{ $c }}" value="{{ old($c) }}" class="border border-zinc-300 rounded px-3 py-2">
            </label>
        @endforeach
        <label class="flex flex-col gap-1 text-sm">Mensagem
            <textarea name="mensagem" rows="5" class="border border-zinc-300 rounded px-3 py-2">{{ old('mensagem') }}</textarea>
        </label>
        <button class="bg-blue-950 text-white rounded px-4 py-2 self-start">Enviar</button>
    </form>
</div>
@endsection
