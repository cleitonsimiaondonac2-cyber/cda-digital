<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membros_publicos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('n_carta', 40)->unique();
            $table->string('empresa')->nullable();
            $table->string('situacao')->nullable();
            $table->string('provincia')->nullable();
            $table->string('delegacao')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('quotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('ano');
            $table->unsignedInteger('valor')->default(0);
            $table->string('estado', 30)->default('pendente');
            $table->string('referencia', 120)->nullable();
            $table->date('data_pagamento')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'ano']);
        });

        Schema::create('requerimentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('tipo', 80);
            $table->text('descricao')->nullable();
            $table->string('estado', 30)->default('em_analise');
            $table->text('resposta')->nullable();
            $table->timestamps();
        });

        Schema::create('actividades', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 300);
            $table->string('categoria', 80)->nullable();
            $table->date('data')->nullable();
            $table->string('local', 160)->nullable();
            $table->text('descricao')->nullable();
            $table->boolean('destaque')->default(false);
            $table->timestamps();
        });

        Schema::create('noticias', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 300);
            $table->string('slug')->unique();
            $table->string('categoria', 80)->nullable();
            $table->date('data')->nullable();
            $table->text('resumo')->nullable();
            $table->longText('texto')->nullable();
            $table->string('imagem', 300)->nullable();
            $table->foreignId('actividade_id')->nullable()->constrained('actividades')->nullOnDelete();
            $table->boolean('publicada')->default(true);
            $table->timestamps();
        });

        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->string('ficheiro', 300)->unique();
            $table->string('titulo', 400);
            $table->string('tipo', 80)->nullable();
            $table->string('entidade', 160)->nullable();
            $table->unsignedSmallInteger('ano')->nullable();
            $table->string('categoria', 80)->nullable();
            $table->string('status', 40)->default('vigente');
            $table->timestamps();
        });

        Schema::create('contacto_mensagens', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 160);
            $table->string('email', 200);
            $table->string('assunto', 200)->nullable();
            $table->text('mensagem');
            $table->string('ip', 80)->nullable();
            $table->boolean('lida')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['contacto_mensagens', 'documentos', 'noticias', 'actividades', 'requerimentos', 'quotas', 'membros_publicos'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
