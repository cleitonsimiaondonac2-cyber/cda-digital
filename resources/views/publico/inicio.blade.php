@extends('layouts.app')
@section('conteudo')
@php $destaques = $noticias->take(4); $restantes = $noticias->slice(4); @endphp

{{-- Autor: Leonardo (leonardoaderito-cmyk) --}}
<section data-carrossel class="carrossel relative -mx-4 -mt-8 mb-10 overflow-hidden bg-cda-preto text-white">
    @foreach ($destaques as $n)
        <article data-slide class="slide">
            <div class="max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col gap-4">
                <span class="self-start bg-cda-vermelho px-3 py-1 text-sm font-semibold uppercase tracking-wide">{{ $n->categoria ?: 'Noticia' }}</span>
                <h1 class="text-3xl md:text-4xl font-bold max-w-3xl leading-tight">{{ $n->titulo }}</h1>
                <p class="max-w-2xl text-zinc-200">{{ \Illuminate\Support\Str::limit($n->resumo, 180) }}</p>
                <a href="{{ route('noticia', $n->slug) }}" class="self-start bg-white text-cda-preto font-semibold rounded px-5 py-2 hover:bg-cda-vermelho hover:text-white transition">Ler mais</a>
            </div>
        </article>
    @endforeach
    @if ($destaques->count() > 1)
        <div class="absolute bottom-4 left-0 right-0 max-w-6xl mx-auto px-4 flex items-center gap-3">
            <button data-anterior aria-label="Anterior" class="seta">&lsaquo;</button>
            @foreach ($destaques as $i => $n)<button data-ponto aria-label="Destaque {{ $i + 1 }}" class="ponto"></button>@endforeach
            <button data-seguinte aria-label="Seguinte" class="seta">&rsaquo;</button>
        </div>
    @endif
</section>

<section class="flex flex-wrap gap-4 mb-12" data-revelar>
    @foreach ([['Documentos','Legislacao, circulares e formularios','documentos','M6 2h9l5 5v15H6z'],['Directorio de membros','Despachantes aduaneiros registados','directorio','M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0'],['Area do membro','Quotas e requerimentos','login','M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4'],['Contactos','Fale com a CDA','contactos','M4 4h16v13H8l-4 4z']] as [$t,$d,$rota,$icone])
        <a href="{{ route($rota) }}" class="acesso flex-[1_1_14rem] flex items-center gap-4 bg-white border border-zinc-200 rounded-lg p-5">
            <svg viewBox="0 0 24 24" class="h-10 w-10 shrink-0 text-cda-vermelho" fill="none" stroke="currentColor" stroke-width="1.8"><path d="{{ $icone }}"/></svg>
            <span><strong class="block text-lg">{{ $t }}</strong><span class="text-zinc-600">{{ $d }}</span></span>
        </a>
    @endforeach
</section>

<section class="flex flex-wrap gap-4 mb-12 text-center" data-revelar>
    @foreach ([['Membros activos', $totais['membros']], ['Documentos publicados', $totais['documentos']], ['Noticias', $totais['noticias']]] as [$r, $n])
        <div class="flex-[1_1_12rem] bg-cda-preto text-white rounded-lg py-6">
            <div class="text-4xl font-bold" data-contador="{{ $n }}">0</div>
            <div class="text-zinc-300">{{ $r }}</div>
        </div>
    @endforeach
</section>

<div class="flex flex-wrap gap-10 mb-12">
    <section class="flex-[2_1_30rem]" data-revelar>
        <div class="flex items-baseline justify-between mb-4 border-b-2 border-cda-vermelho pb-2">
            <h2 class="text-2xl font-bold">Ultimas noticias</h2>
            <a href="{{ route('noticias') }}" class="text-cda-vermelho-escuro font-semibold hover:underline">Ver todas</a>
        </div>
        <div class="flex flex-wrap gap-4">
            @foreach (($restantes->count() ? $restantes : $noticias->take(3)) as $n)
                <article class="cartao flex-[1_1_16rem] bg-white border border-zinc-200 rounded-lg p-5 flex flex-col gap-2">
                    <div class="text-sm text-zinc-600">{{ $n->categoria }} &middot; {{ $n->data?->format('d/m/Y') }}</div>
                    <a href="{{ route('noticia', $n->slug) }}" class="font-bold text-lg hover:text-cda-vermelho">{{ $n->titulo }}</a>
                    <p class="text-zinc-700">{{ \Illuminate\Support\Str::limit($n->resumo, 120) }}</p>
                </article>
            @endforeach
        </div>
    </section>

    <section class="flex-[1_1_18rem]" data-revelar>
        <div class="flex items-baseline justify-between mb-4 border-b-2 border-cda-vermelho pb-2">
            <h2 class="text-2xl font-bold">Agenda</h2>
            <a href="{{ route('actividades') }}" class="text-cda-vermelho-escuro font-semibold hover:underline">Ver todas</a>
        </div>
        <ul class="flex flex-col gap-3">
            @foreach ($actividades as $a)
                <li class="cartao flex gap-4 bg-white border border-zinc-200 rounded-lg p-3">
                    <div class="shrink-0 w-16 text-center bg-cda-preto text-white rounded py-2">
                        <div class="text-2xl font-bold leading-none">{{ $a->data?->format('d') }}</div>
                        <div class="text-sm uppercase">{{ $a->data?->format('m/y') }}</div>
                    </div>
                    <div><strong>{{ $a->titulo }}</strong>@if ($a->local)<div class="text-sm text-zinc-600">{{ $a->local }}</div>@endif</div>
                </li>
            @endforeach
        </ul>
    </section>
</div>

<section class="mb-4" data-revelar>
    <h2 class="text-2xl font-bold mb-4 border-b-2 border-cda-vermelho pb-2">Parceiros</h2>
    <div class="flex flex-wrap items-center justify-center gap-6 bg-white border border-zinc-200 rounded-lg p-6">
        @foreach (['at.png','mic.png','mef.png','bancomoc.png','cta.png','apiex.png','wco.png'] as $logo)
            <img src="{{ asset('img/parceiros/'.$logo) }}" alt="Parceiro" class="h-14 w-auto grayscale hover:grayscale-0 transition" loading="lazy">
        @endforeach
    </div>
</section>
@endsection
