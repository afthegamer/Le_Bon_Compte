<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250120135116 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE category_entity DROP CONSTRAINT fk_1c08e13c6bed3a9');
        $this->addSql('ALTER TABLE category_entity DROP CONSTRAINT fk_1c08e1345825627');
        $this->addSql('DROP INDEX uniq_1c08e1345825627');
        $this->addSql('DROP INDEX uniq_1c08e13c6bed3a9');
        $this->addSql('ALTER TABLE category_entity ADD users_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE category_entity DROP income_entity_id');
        $this->addSql('ALTER TABLE category_entity DROP expense_entity_id');
        $this->addSql('ALTER TABLE category_entity ADD CONSTRAINT FK_1C08E1367B3B43D FOREIGN KEY (users_id) REFERENCES user_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_1C08E1367B3B43D ON category_entity (users_id)');
        $this->addSql('ALTER TABLE expense_entity ADD category_entity_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE expense_entity ADD CONSTRAINT FK_C887957D4645AF6D FOREIGN KEY (category_entity_id) REFERENCES category_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_C887957D4645AF6D ON expense_entity (category_entity_id)');
        $this->addSql('ALTER TABLE income_entity ADD category_entity_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE income_entity ADD CONSTRAINT FK_F1FB325F4645AF6D FOREIGN KEY (category_entity_id) REFERENCES category_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_F1FB325F4645AF6D ON income_entity (category_entity_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE category_entity DROP CONSTRAINT FK_1C08E1367B3B43D');
        $this->addSql('DROP INDEX IDX_1C08E1367B3B43D');
        $this->addSql('ALTER TABLE category_entity ADD expense_entity_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE category_entity RENAME COLUMN users_id TO income_entity_id');
        $this->addSql('ALTER TABLE category_entity ADD CONSTRAINT fk_1c08e13c6bed3a9 FOREIGN KEY (income_entity_id) REFERENCES income_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE category_entity ADD CONSTRAINT fk_1c08e1345825627 FOREIGN KEY (expense_entity_id) REFERENCES expense_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE UNIQUE INDEX uniq_1c08e1345825627 ON category_entity (expense_entity_id)');
        $this->addSql('CREATE UNIQUE INDEX uniq_1c08e13c6bed3a9 ON category_entity (income_entity_id)');
        $this->addSql('ALTER TABLE expense_entity DROP CONSTRAINT FK_C887957D4645AF6D');
        $this->addSql('DROP INDEX IDX_C887957D4645AF6D');
        $this->addSql('ALTER TABLE expense_entity DROP category_entity_id');
        $this->addSql('ALTER TABLE income_entity DROP CONSTRAINT FK_F1FB325F4645AF6D');
        $this->addSql('DROP INDEX IDX_F1FB325F4645AF6D');
        $this->addSql('ALTER TABLE income_entity DROP category_entity_id');
    }
}
