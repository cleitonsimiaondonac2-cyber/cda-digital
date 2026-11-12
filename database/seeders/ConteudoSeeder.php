<?php

namespace Database\Seeders;

use App\Models\Actividade;
use App\Models\Documento;
use App\Models\Noticia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ConteudoSeeder extends Seeder
{
    public function run(): void
    {
        foreach (json_decode(file_get_contents(database_path('data/documentos.json')), true) as $d) {
            Documento::updateOrCreate(['ficheiro' => $d['ficheiro']], [
                'titulo' => $d['titulo'],
                'tipo' => $d['tipo'] ?? null,
                'entidade' => $d['emissor'] ?? null,
                'ano' => $d['ano'] ?? null,
                'categoria' => $d['tipo'] ?? null,
            ]);
        }

        $dados = json_decode(file_get_contents(database_path('data/dados_legado.json')), true);

        foreach ($dados['actividades'] as $a) {
            Actividade::updateOrCreate(['titulo' => $a['titulo']], [
                'categoria' => $a['categoria'] ?? null,
                'data' => $a['data'] ?? null,
                'local' => $a['local'] ?? null,
                'descricao' => $a['descricao'] ?? null,
                'destaque' => (bool) ($a['destaque'] ?? false),
            ]);
        }

        foreach ($dados['noticias'] as $n) {
            Noticia::updateOrCreate(['slug' => Str::slug($n['titulo'])], [
                'titulo' => $n['titulo'],
                'categoria' => $n['categoria'] ?? null,
                'data' => $n['data'] ?? null,
                'resumo' => Str::limit($n['texto'] ?? '', 220),
                'texto' => $n['texto'] ?? null,
            ]);
        }
    }
}
