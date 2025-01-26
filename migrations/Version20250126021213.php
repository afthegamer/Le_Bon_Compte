<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250126021213 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX uniq_1c08e135e237e06');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_1C08E135E237E0681C5F0B9 ON category_entity (name, user_entity_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP INDEX UNIQ_1C08E135E237E0681C5F0B9');
        $this->addSql('CREATE UNIQUE INDEX uniq_1c08e135e237e06 ON category_entity (name)');
    }
}
