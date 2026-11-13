<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nome', 'n_carta', 'empresa', 'situacao', 'provincia', 'delegacao', 'activo'])]
class MembroPublico extends Model
{
    protected $table = 'membros_publicos';

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
    }
}
