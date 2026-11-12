<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

// Autor: Leonardo (leonardoaderito-cmyk)
class Auditoria extends Model
{
    protected $table = 'auditoria';

    public $timestamps = false;

    protected $guarded = [];

    public static function registar(string $accao, ?string $detalhe = null, ?int $userId = null): void
    {
        static::create([
            'user_id' => $userId ?? Auth::id(),
            'accao' => $accao,
            'detalhe' => $detalhe,
            'ip' => request()->ip(),
        ]);
    }
}
