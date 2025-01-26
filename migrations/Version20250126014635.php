<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250126014635 extends AbstractMigration
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
        $this->addSql('CREATE SEQUENCE user_entity_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE user_profile_entity_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE category_entity (id INT NOT NULL, user_entity_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_1C08E1381C5F0B9 ON category_entity (user_entity_id)');
        $this->addSql('CREATE TABLE expense_entity (id INT NOT NULL, user_entity_id INT NOT NULL, category_entity_id INT DEFAULT NULL, user_profile_entity_id INT DEFAULT NULL, subcategory_entity_id INT DEFAULT NULL, amount INT NOT NULL, name VARCHAR(255) NOT NULL, type VARCHAR(255) DEFAULT NULL, date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_C887957D81C5F0B9 ON expense_entity (user_entity_id)');
        $this->addSql('CREATE INDEX IDX_C887957D4645AF6D ON expense_entity (category_entity_id)');
        $this->addSql('CREATE INDEX IDX_C887957DC5A52F0D ON expense_entity (user_profile_entity_id)');
        $this->addSql('CREATE INDEX IDX_C887957DC8F94A67 ON expense_entity (subcategory_entity_id)');
        $this->addSql('CREATE TABLE income_entity (id INT NOT NULL, user_entity_id INT NOT NULL, category_entity_id INT DEFAULT NULL, user_profile_entity_id INT DEFAULT NULL, subcategory_entity_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, amount INT NOT NULL, type VARCHAR(255) DEFAULT NULL, date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_F1FB325F81C5F0B9 ON income_entity (user_entity_id)');
        $this->addSql('CREATE INDEX IDX_F1FB325F4645AF6D ON income_entity (category_entity_id)');
        $this->addSql('CREATE INDEX IDX_F1FB325FC5A52F0D ON income_entity (user_profile_entity_id)');
        $this->addSql('CREATE INDEX IDX_F1FB325FC8F94A67 ON income_entity (subcategory_entity_id)');
        $this->addSql('CREATE TABLE subcategory_entity (id INT NOT NULL, category_entity_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_BC1D81884645AF6D ON subcategory_entity (category_entity_id)');
        $this->addSql('CREATE TABLE user_entity (id INT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, is_verified BOOLEAN NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, wallet INT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL ON user_entity (email)');
        $this->addSql('CREATE TABLE user_profile_entity (id INT NOT NULL, user_entity_id INT DEFAULT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_D87FC5681C5F0B9 ON user_profile_entity (user_entity_id)');
        $this->addSql('CREATE TABLE messenger_messages (id BIGSERIAL NOT NULL, body TEXT NOT NULL, headers TEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, available_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, delivered_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_75EA56E0FB7336F0 ON messenger_messages (queue_name)');
        $this->addSql('CREATE INDEX IDX_75EA56E0E3BD61CE ON messenger_messages (available_at)');
        $this->addSql('CREATE INDEX IDX_75EA56E016BA31DB ON messenger_messages (delivered_at)');
        $this->addSql('COMMENT ON COLUMN messenger_messages.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN messenger_messages.available_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN messenger_messages.delivered_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE OR REPLACE FUNCTION notify_messenger_messages() RETURNS TRIGGER AS $$
            BEGIN
                PERFORM pg_notify(\'messenger_messages\', NEW.queue_name::text);
                RETURN NEW;
            END;
        $$ LANGUAGE plpgsql;');
        $this->addSql('DROP TRIGGER IF EXISTS notify_trigger ON messenger_messages;');
        $this->addSql('CREATE TRIGGER notify_trigger AFTER INSERT OR UPDATE ON messenger_messages FOR EACH ROW EXECUTE PROCEDURE notify_messenger_messages();');
        $this->addSql('ALTER TABLE category_entity ADD CONSTRAINT FK_1C08E1381C5F0B9 FOREIGN KEY (user_entity_id) REFERENCES user_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE expense_entity ADD CONSTRAINT FK_C887957D81C5F0B9 FOREIGN KEY (user_entity_id) REFERENCES user_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE expense_entity ADD CONSTRAINT FK_C887957D4645AF6D FOREIGN KEY (category_entity_id) REFERENCES category_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE expense_entity ADD CONSTRAINT FK_C887957DC5A52F0D FOREIGN KEY (user_profile_entity_id) REFERENCES user_profile_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE expense_entity ADD CONSTRAINT FK_C887957DC8F94A67 FOREIGN KEY (subcategory_entity_id) REFERENCES subcategory_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE income_entity ADD CONSTRAINT FK_F1FB325F81C5F0B9 FOREIGN KEY (user_entity_id) REFERENCES user_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE income_entity ADD CONSTRAINT FK_F1FB325F4645AF6D FOREIGN KEY (category_entity_id) REFERENCES category_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE income_entity ADD CONSTRAINT FK_F1FB325FC5A52F0D FOREIGN KEY (user_profile_entity_id) REFERENCES user_profile_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE income_entity ADD CONSTRAINT FK_F1FB325FC8F94A67 FOREIGN KEY (subcategory_entity_id) REFERENCES subcategory_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE subcategory_entity ADD CONSTRAINT FK_BC1D81884645AF6D FOREIGN KEY (category_entity_id) REFERENCES category_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE user_profile_entity ADD CONSTRAINT FK_D87FC5681C5F0B9 FOREIGN KEY (user_entity_id) REFERENCES user_entity (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE category_entity_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE expense_entity_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE income_entity_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE subcategory_entity_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE user_entity_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE user_profile_entity_id_seq CASCADE');
        $this->addSql('ALTER TABLE category_entity DROP CONSTRAINT FK_1C08E1381C5F0B9');
        $this->addSql('ALTER TABLE expense_entity DROP CONSTRAINT FK_C887957D81C5F0B9');
        $this->addSql('ALTER TABLE expense_entity DROP CONSTRAINT FK_C887957D4645AF6D');
        $this->addSql('ALTER TABLE expense_entity DROP CONSTRAINT FK_C887957DC5A52F0D');
        $this->addSql('ALTER TABLE expense_entity DROP CONSTRAINT FK_C887957DC8F94A67');
        $this->addSql('ALTER TABLE income_entity DROP CONSTRAINT FK_F1FB325F81C5F0B9');
        $this->addSql('ALTER TABLE income_entity DROP CONSTRAINT FK_F1FB325F4645AF6D');
        $this->addSql('ALTER TABLE income_entity DROP CONSTRAINT FK_F1FB325FC5A52F0D');
        $this->addSql('ALTER TABLE income_entity DROP CONSTRAINT FK_F1FB325FC8F94A67');
        $this->addSql('ALTER TABLE subcategory_entity DROP CONSTRAINT FK_BC1D81884645AF6D');
        $this->addSql('ALTER TABLE user_profile_entity DROP CONSTRAINT FK_D87FC5681C5F0B9');
        $this->addSql('DROP TABLE category_entity');
        $this->addSql('DROP TABLE expense_entity');
        $this->addSql('DROP TABLE income_entity');
        $this->addSql('DROP TABLE subcategory_entity');
        $this->addSql('DROP TABLE user_entity');
        $this->addSql('DROP TABLE user_profile_entity');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
