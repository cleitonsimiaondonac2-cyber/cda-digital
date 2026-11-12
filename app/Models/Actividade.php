<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['titulo', 'categoria', 'data', 'local', 'descricao', 'destaque'])]
class Actividade extends Model
{
    protected $table = 'actividades';

    protected function casts(): array
    {
        return ['data' => 'date', 'destaque' => 'boolean'];
    }
}
