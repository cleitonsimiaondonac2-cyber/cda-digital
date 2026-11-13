@extends('layouts.app')
@section('titulo', $noticia->titulo)
@section('conteudo')
<article class="max-w-3xl mx-auto bg-white border border-zinc-200 rounded-lg p-6">
    <div class="text-xs text-zinc-500">{{ $noticia->categoria }} &middot; {{ $noticia->data?->format('d/m/Y') }}</div>
    <h1 class="text-2xl font-semibold mt-1 mb-4">{{ $noticia->titulo }}</h1>
    <div class="leading-relaxed whitespace-pre-line">{{ $noticia->texto }}</div>
    <a href="{{ route('noticias') }}" class="inline-block mt-6 text-sm text-blue-800 hover:underline">&larr; Todas as noticias</a>
</article>
@endsection
