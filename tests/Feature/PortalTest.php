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
        foreach (['/', '/noticias', '/actividades', '/documentos', '/membros', '/contactos', '/entrar', '/registar'] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_area_de_administracao_bloqueia_nao_admin(): void
    {
        $this->get('/admin')->assertRedirect();

        $membro = User::factory()->create(['is_admin' => false]);
        $this->actingAs($membro)->get('/admin')->assertForbidden();
    }

    public function test_conta_inactiva_nao_entra(): void
    {
        $user = User::factory()->create(['email' => 'a@b.mz', 'password' => 'segredo123']);
        $user->forceFill(['ativo' => false])->save();

        $this->post('/entrar', ['identificador' => 'a@b.mz', 'password' => 'segredo123'])->assertSessionHasErrors();
        $this->assertGuest();
    }
}
