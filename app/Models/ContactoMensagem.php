<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nome', 'email', 'assunto', 'mensagem', 'ip', 'lida'])]
class ContactoMensagem extends Model
{
    protected $table = 'contacto_mensagens';

    protected function casts(): array
    {
        return ['lida' => 'boolean'];
    }
}
