<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250126015248 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE UNIQUE INDEX UNIQ_1C08E135E237E06 ON category_entity (name)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BC1D81885E237E064645AF6D ON subcategory_entity (name, category_entity_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP INDEX UNIQ_BC1D81885E237E064645AF6D');
        $this->addSql('DROP INDEX UNIQ_1C08E135E237E06');
    }
}
