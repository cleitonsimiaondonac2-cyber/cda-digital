<?php

namespace Tests\Feature;

use App\Models\MembroPublico;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Autor: Leonardo (leonardoaderito-cmyk)
class PortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_paginas_publicas_respondem(): void
    {
        foreach (['/', '/noticias', '/actividades', '/documentos', '/membros', '/contactos', '/entrar', '/registar', '/instituicao', '/historia', '/orgaos', '/estatutos', '/parceiros'] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_area_de_administracao_bloqueia_nao_admin(): void
    {
        $this->get('/admin')->assertRedirect();

        $membro = User::factory()->create(['is_admin' => false]);
        $this->actingAs($membro)->get('/admin')->assertForbidden();
    }

    public function test_cabecalhos_e_auditoria(): void
    {
        $this->get('/')->assertHeader('X-Frame-Options', 'DENY');

        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true, 'ativo' => true])->save();
        $this->actingAs($admin)->post('/admin/noticias', ['titulo' => 'T', 'texto' => 'X', 'data' => '2026-01-01']);
        $this->assertDatabaseHas('auditoria', ['accao' => 'admin.noticias.guardar', 'user_id' => $admin->id]);
    }

    public function test_conta_inactiva_nao_entra(): void
    {
        $user = User::factory()->create(['email' => 'a@b.mz', 'password' => 'segredo123']);
        $user->forceFill(['ativo' => false])->save();

        $this->post('/entrar', ['identificador' => 'a@b.mz', 'password' => 'segredo123'])->assertSessionHasErrors();
        $this->assertGuest();
    }
}
