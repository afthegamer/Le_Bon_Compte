<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250122014812 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE income_entity ADD subcategory_entity_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE income_entity ADD CONSTRAINT FK_F1FB325FC8F94A67 FOREIGN KEY (subcategory_entity_id) REFERENCES subcategory_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_F1FB325FC8F94A67 ON income_entity (subcategory_entity_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE income_entity DROP CONSTRAINT FK_F1FB325FC8F94A67');
        $this->addSql('DROP INDEX UNIQ_F1FB325FC8F94A67');
        $this->addSql('ALTER TABLE income_entity DROP subcategory_entity_id');
    }
}
