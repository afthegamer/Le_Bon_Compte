<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250120140550 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE category_entity DROP CONSTRAINT fk_1c08e1367b3b43d');
        $this->addSql('DROP INDEX idx_1c08e1367b3b43d');
        $this->addSql('ALTER TABLE category_entity RENAME COLUMN users_id TO user_entity_id');
        $this->addSql('ALTER TABLE category_entity ADD CONSTRAINT FK_1C08E1381C5F0B9 FOREIGN KEY (user_entity_id) REFERENCES user_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_1C08E1381C5F0B9 ON category_entity (user_entity_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE category_entity DROP CONSTRAINT FK_1C08E1381C5F0B9');
        $this->addSql('DROP INDEX IDX_1C08E1381C5F0B9');
        $this->addSql('ALTER TABLE category_entity RENAME COLUMN user_entity_id TO users_id');
        $this->addSql('ALTER TABLE category_entity ADD CONSTRAINT fk_1c08e1367b3b43d FOREIGN KEY (users_id) REFERENCES user_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_1c08e1367b3b43d ON category_entity (users_id)');
    }
}
