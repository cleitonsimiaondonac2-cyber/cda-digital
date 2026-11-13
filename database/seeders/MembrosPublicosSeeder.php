<?php

namespace Database\Seeders;

use App\Models\MembroPublico;
use Illuminate\Database\Seeder;

class MembrosPublicosSeeder extends Seeder
{
    public function run(): void
    {
        $ficheiro = base_path('legado/site/data/membros.json');
        $dados = json_decode(file_get_contents($ficheiro), true) ?: [];

        foreach ($dados as $m) {
            $carta = preg_replace('/\D/', '', (string) ($m['nCarta'] ?? ''));
            if ($carta === '') {
                continue;
            }
            MembroPublico::updateOrCreate(['n_carta' => $carta], [
                'nome' => $m['nome'] ?? '',
                'empresa' => $m['empresa'] ?? null,
                'situacao' => $m['situacao'] ?? null,
                'provincia' => $m['provincia'] ?? null,
                'delegacao' => $m['delegacao'] ?? null,
                'activo' => $m['activo'] ?? true,
            ]);
        }
    }
}
