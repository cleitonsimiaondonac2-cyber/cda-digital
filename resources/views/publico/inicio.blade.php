@extends('layouts.app')
@section('conteudo')
<section class="rounded-lg bg-cda-preto border-l-8 border-cda-vermelho text-white px-6 py-10 mb-8">
    <h1 class="text-3xl font-bold mb-2">Camara dos Despachantes Aduaneiros de Mocambique</h1>
    <p class="text-zinc-200 max-w-2xl">Portal institucional: noticias, documentacao oficial, directorio de membros e area reservada aos despachantes.</p>
    <div class="flex flex-wrap gap-3 mt-6 text-center">
        @foreach ([['Membros activos', $totais['membros']], ['Documentos', $totais['documentos']], ['Noticias', $totais['noticias']]] as [$r, $n])
            <div class="bg-white/10 rounded px-5 py-3 min-w-32"><div class="text-2xl font-bold">{{ $n }}</div><div class="text-xs">{{ $r }}</div></div>
        @endforeach
    </div>
</section>

<div class="flex flex-wrap gap-8">
    <section class="flex-[2_1_28rem]">
        <h2 class="text-xl font-semibold mb-3">Ultimas noticias</h2>
        <div class="flex flex-col gap-4">
            @forelse ($noticias as $n)
                <article class="bg-white border border-zinc-200 rounded-lg p-4">
                    <div class="text-xs text-zinc-500">{{ $n->categoria }} &middot; {{ $n->data?->format('d/m/Y') }}</div>
                    <a href="{{ route('noticia', $n->slug) }}" class="font-semibold hover:underline">{{ $n->titulo }}</a>
                    <p class="text-sm text-zinc-600 mt-1">{{ $n->resumo }}</p>
                </article>
            @empty
                <p class="text-zinc-500">Sem noticias publicadas.</p>
            @endforelse
        </div>
    </section>
    <section class="flex-[1_1_18rem]">
        <h2 class="text-xl font-semibold mb-3">Actividades</h2>
        <ul class="flex flex-col gap-3">
            @foreach ($actividades as $a)
                <li class="bg-white border border-zinc-200 rounded-lg p-3 text-sm">
                    <div class="text-xs text-zinc-500">{{ $a->data?->format('d/m/Y') }} @if ($a->local) &middot; {{ $a->local }} @endif</div>
                    {{ $a->titulo }}
                </li>
            @endforeach
        </ul>
    </section>
</div>
@endsection
