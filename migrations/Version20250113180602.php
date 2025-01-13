<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250113180602 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE category_entity_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE expense_entity_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE income_entity_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE subcategory_entity_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE category_entity (id INT NOT NULL, income_entity_id INT DEFAULT NULL, expense_entity_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_1C08E13C6BED3A9 ON category_entity (income_entity_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_1C08E1345825627 ON category_entity (expense_entity_id)');
        $this->addSql('CREATE TABLE expense_entity (id INT NOT NULL, user_entity_id INT DEFAULT NULL, amount INT NOT NULL, name VARCHAR(255) NOT NULL, type VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_C887957D81C5F0B9 ON expense_entity (user_entity_id)');
        $this->addSql('CREATE TABLE income_entity (id INT NOT NULL, user_entity_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, amount INT NOT NULL, type VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_F1FB325F81C5F0B9 ON income_entity (user_entity_id)');
        $this->addSql('CREATE TABLE subcategory_entity (id INT NOT NULL, category_entity_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_BC1D81884645AF6D ON subcategory_entity (category_entity_id)');
        $this->addSql('ALTER TABLE category_entity ADD CONSTRAINT FK_1C08E13C6BED3A9 FOREIGN KEY (income_entity_id) REFERENCES income_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE category_entity ADD CONSTRAINT FK_1C08E1345825627 FOREIGN KEY (expense_entity_id) REFERENCES expense_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE expense_entity ADD CONSTRAINT FK_C887957D81C5F0B9 FOREIGN KEY (user_entity_id) REFERENCES user_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE income_entity ADD CONSTRAINT FK_F1FB325F81C5F0B9 FOREIGN KEY (user_entity_id) REFERENCES user_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE subcategory_entity ADD CONSTRAINT FK_BC1D81884645AF6D FOREIGN KEY (category_entity_id) REFERENCES category_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE user_entity ADD first_name VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE user_entity ADD last_name VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE user_entity ADD wallet INT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE category_entity_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE expense_entity_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE income_entity_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE subcategory_entity_id_seq CASCADE');
        $this->addSql('ALTER TABLE category_entity DROP CONSTRAINT FK_1C08E13C6BED3A9');
        $this->addSql('ALTER TABLE category_entity DROP CONSTRAINT FK_1C08E1345825627');
        $this->addSql('ALTER TABLE expense_entity DROP CONSTRAINT FK_C887957D81C5F0B9');
        $this->addSql('ALTER TABLE income_entity DROP CONSTRAINT FK_F1FB325F81C5F0B9');
        $this->addSql('ALTER TABLE subcategory_entity DROP CONSTRAINT FK_BC1D81884645AF6D');
        $this->addSql('DROP TABLE category_entity');
        $this->addSql('DROP TABLE expense_entity');
        $this->addSql('DROP TABLE income_entity');
        $this->addSql('DROP TABLE subcategory_entity');
        $this->addSql('ALTER TABLE user_entity DROP first_name');
        $this->addSql('ALTER TABLE user_entity DROP last_name');
        $this->addSql('ALTER TABLE user_entity DROP wallet');
    }
}
