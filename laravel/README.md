# CDA Digital 3.0 — Laravel 13

Fundação Laravel do projecto, isolada do site actual (`../site/`).

## Versões

| Ferramenta | Versão |
| --- | --- |
| PHP | 8.3.6 |
| Composer | 2.7.1 |
| Laravel | 13.42.0 |
| Filament | 5.11.2 |
| Node | 20.20.2 |
| npm | 10.8.2 |
| PostgreSQL | 16.15 |

## Arranque

```bash
php artisan serve
php artisan migrate
php artisan test
npm run build
```

Em deploy, publicar os assets do Filament:

```bash
php artisan filament:assets
```

## Base de dados local (PostgreSQL, porta 5433)

Cluster em espaço de utilizador, sem `sudo`:

```bash
# arrancar
/usr/lib/postgresql/16/bin/pg_ctl \
  -D /home/cleiton/.local/share/cda-pgdata \
  -l /home/cleiton/.local/share/cda-pgdata/server.log \
  -o "-p 5433 -h 127.0.0.1 -k /home/cleiton/.local/share/cda-pgdata" start

# parar
/usr/lib/postgresql/16/bin/pg_ctl \
  -D /home/cleiton/.local/share/cda-pgdata stop

# verificar
/usr/lib/postgresql/16/bin/pg_isready -h 127.0.0.1 -p 5433
```

Bases: `cda_digital` (desenvolvimento) e `cda_digital_test` (testes PHPUnit).
Configuração em `.env` (não versionado): `DB_CONNECTION=pgsql`,
`DB_HOST=127.0.0.1`, `DB_PORT=5433`, `DB_USERNAME=cleiton`, `DB_PASSWORD`
vazio (autenticação `trust` apenas neste cluster local).

## Locale e timezone

`APP_LOCALE=pt_PT`, `APP_FALLBACK_LOCALE=en`, `APP_FAKER_LOCALE=pt_PT` e
`APP_TIMEZONE=Africa/Maputo` (lido por `config/app.php` via
`env('APP_TIMEZONE', 'UTC')`).

## Estado

- Migrações: OK (`migrate` e `migrate:status`).
- Testes: OK (`php artisan test`, incluindo smoke test da base PostgreSQL).
- Build frontend: OK (`npm run build`).
- Filament instalado com painel (`app/Providers/Filament/AdminPanelProvider.php`).

## Limitações

- Extensões `bcmath` e `pdo_sqlite` ausentes no PHP do sistema; sem impacto
  imediato porque o projecto usa PostgreSQL e não SQLite.
- Não usar `sudo`; o cluster PostgreSQL corre em espaço de utilizador e não
  arranca automaticamente.
