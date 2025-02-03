<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250203145645 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE expense_entity ALTER amount TYPE DOUBLE PRECISION');
        $this->addSql('ALTER TABLE income_entity ALTER amount TYPE DOUBLE PRECISION');
        $this->addSql('ALTER TABLE user_entity ALTER wallet TYPE DOUBLE PRECISION');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE income_entity ALTER amount TYPE INT');
        $this->addSql('ALTER TABLE user_entity ALTER wallet TYPE INT');
        $this->addSql('ALTER TABLE expense_entity ALTER amount TYPE INT');
    }
}
