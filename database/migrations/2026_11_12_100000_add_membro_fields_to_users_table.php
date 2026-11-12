<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('carteira', 40)->nullable()->unique();
            $table->string('telefone', 40)->nullable();
            $table->string('entidade', 160)->nullable();
            $table->boolean('is_admin')->default(false);
            $table->boolean('ativo')->default(false);
            $table->timestamp('aprovado_em')->nullable();
            $table->timestamp('ultimo_login')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['carteira', 'telefone', 'entidade', 'is_admin', 'ativo', 'aprovado_em', 'ultimo_login']);
        });
    }
};
