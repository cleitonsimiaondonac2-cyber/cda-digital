<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('titulo', 'CDA Digital') - Camara dos Despachantes Aduaneiros de Mocambique</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-zinc-50 text-zinc-800 antialiased min-h-screen flex flex-col">
<header class="bg-cda-preto text-white border-b-4 border-cda-vermelho">
    <div class="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <a href="{{ route('inicio') }}" class="flex items-center gap-3 font-bold text-lg tracking-wide">
            <img src="{{ asset('img/cda-logo.jpg') }}" alt="CDA" class="h-11 w-11 rounded-full bg-white object-cover">
            CDA Digital
        </a>
        <nav class="flex flex-wrap gap-x-4 gap-y-1 text-sm flex-1">
            <a href="{{ route('noticias') }}" class="hover:underline">Noticias</a>
            <a href="{{ route('actividades') }}" class="hover:underline">Actividades</a>
            <a href="{{ route('documentos') }}" class="hover:underline">Documentos</a>
            <a href="{{ route('directorio') }}" class="hover:underline">Membros</a>
            <a href="{{ route('contactos') }}" class="hover:underline">Contactos</a>
        </nav>
        <div class="flex items-center gap-3 text-sm">
            @auth
                @if (auth()->user()->is_admin)
                    <a href="{{ route('admin.painel') }}" class="hover:underline">Administracao</a>
                @endif
                <a href="{{ route('membro.area') }}" class="hover:underline">{{ auth()->user()->name }}</a>
                <form method="POST" action="{{ route('logout') }}">@csrf
                    <button class="bg-white/10 hover:bg-white/20 rounded px-3 py-1">Sair</button>
                </form>
            @else
                <a href="{{ route('login') }}" class="hover:underline">Entrar</a>
                <a href="{{ route('registo') }}" class="bg-cda-vermelho text-white rounded px-3 py-1 font-semibold">Registar</a>
            @endauth
        </div>
    </div>
</header>

<main class="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
    @if (session('estado'))
        <div class="mb-6 rounded border border-green-300 bg-green-50 text-green-900 px-4 py-3">{{ session('estado') }}</div>
    @endif
    @if ($errors->any())
        <div class="mb-6 rounded border border-red-300 bg-red-50 text-red-900 px-4 py-3">
            <ul class="list-disc pl-5">@foreach ($errors->all() as $erro)<li>{{ $erro }}</li>@endforeach</ul>
        </div>
    @endif
    @yield('conteudo')
</main>

<footer class="bg-cda-preto text-zinc-200 text-sm border-t-4 border-cda-vermelho">
    <div class="max-w-6xl mx-auto px-4 py-6 flex flex-wrap justify-between gap-2">
        <span>Camara dos Despachantes Aduaneiros de Mocambique</span>
        <span>Tel. +258 21 305 504 / 305 506</span>
    </div>
</footer>
</body>
</html>
