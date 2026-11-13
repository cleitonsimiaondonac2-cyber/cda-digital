<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['titulo', 'slug', 'categoria', 'data', 'resumo', 'texto', 'imagem', 'actividade_id', 'publicada'])]
class Noticia extends Model
{
    protected function casts(): array
    {
        return ['data' => 'date', 'publicada' => 'boolean'];
    }
}
