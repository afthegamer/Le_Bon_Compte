<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250125224807 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX uniq_c887957dc8f94a67');
        $this->addSql('CREATE INDEX IDX_C887957DC8F94A67 ON expense_entity (subcategory_entity_id)');
        $this->addSql('DROP INDEX uniq_f1fb325fc8f94a67');
        $this->addSql('CREATE INDEX IDX_F1FB325FC8F94A67 ON income_entity (subcategory_entity_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP INDEX IDX_F1FB325FC8F94A67');
        $this->addSql('CREATE UNIQUE INDEX uniq_f1fb325fc8f94a67 ON income_entity (subcategory_entity_id)');
        $this->addSql('DROP INDEX IDX_C887957DC8F94A67');
        $this->addSql('CREATE UNIQUE INDEX uniq_c887957dc8f94a67 ON expense_entity (subcategory_entity_id)');
    }
}
