<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250115132102 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE user_profile_entity_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE user_profile_entity (id INT NOT NULL, user_entity_id INT DEFAULT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_D87FC5681C5F0B9 ON user_profile_entity (user_entity_id)');
        $this->addSql('ALTER TABLE user_profile_entity ADD CONSTRAINT FK_D87FC5681C5F0B9 FOREIGN KEY (user_entity_id) REFERENCES user_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE expense_entity ADD user_profile_entity_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE expense_entity ADD CONSTRAINT FK_C887957DC5A52F0D FOREIGN KEY (user_profile_entity_id) REFERENCES user_profile_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_C887957DC5A52F0D ON expense_entity (user_profile_entity_id)');
        $this->addSql('ALTER TABLE income_entity ADD user_profile_entity_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE income_entity ADD CONSTRAINT FK_F1FB325FC5A52F0D FOREIGN KEY (user_profile_entity_id) REFERENCES user_profile_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_F1FB325FC5A52F0D ON income_entity (user_profile_entity_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE expense_entity DROP CONSTRAINT FK_C887957DC5A52F0D');
        $this->addSql('ALTER TABLE income_entity DROP CONSTRAINT FK_F1FB325FC5A52F0D');
        $this->addSql('DROP SEQUENCE user_profile_entity_id_seq CASCADE');
        $this->addSql('ALTER TABLE user_profile_entity DROP CONSTRAINT FK_D87FC5681C5F0B9');
        $this->addSql('DROP TABLE user_profile_entity');
        $this->addSql('DROP INDEX IDX_C887957DC5A52F0D');
        $this->addSql('ALTER TABLE expense_entity DROP user_profile_entity_id');
        $this->addSql('DROP INDEX IDX_F1FB325FC5A52F0D');
        $this->addSql('ALTER TABLE income_entity DROP user_profile_entity_id');
    }
}
