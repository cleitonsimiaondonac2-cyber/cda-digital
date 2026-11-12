<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_core_tables_exist(): void
    {
        $this->assertTrue(Schema::hasTable('users'));
        $this->assertTrue(Schema::hasTable('migrations'));
    }
}
