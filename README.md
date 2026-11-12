# CDA Digital (Laravel + SQLite)

Portal e plataforma da Câmara dos Despachantes Aduaneiros de Moçambique, em migração para Laravel 13 com SQLite.

## Arrancar
```
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed   # importa a lista pública de membros
php artisan serve
```

## Estado da migração
- [x] Fase 1: estrutura Laravel, modelos, migrações, importação de membros
- [ ] Fase 2: autenticação, aprovação de contas, quotas e requerimentos
- [ ] Fase 3: painel admin e centro documental
- [ ] Fase 4: páginas públicas em Blade
- [ ] Fase 5: assistente de IA, CI e deploy

O código anterior (site estático + API Python) está em `legado/` como referência e fonte de dados.
