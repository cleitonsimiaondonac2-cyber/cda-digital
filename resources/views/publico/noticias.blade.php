@extends('layouts.app')
@section('titulo', 'Noticias')
@section('conteudo')
<h1 class="text-2xl font-semibold mb-4">Noticias</h1>
<div class="flex flex-wrap gap-4">
    @foreach ($noticias as $n)
        <article class="bg-white border border-zinc-200 rounded-lg p-4 flex-[1_1_20rem] max-w-full">
            <div class="text-xs text-zinc-500">{{ $n->categoria }} &middot; {{ $n->data?->format('d/m/Y') }}</div>
            <a href="{{ route('noticia', $n->slug) }}" class="font-semibold hover:underline">{{ $n->titulo }}</a>
            <p class="text-sm text-zinc-600 mt-1">{{ $n->resumo }}</p>
        </article>
    @endforeach
</div>
<div class="mt-6">{{ $noticias->links() }}</div>
@endsection
