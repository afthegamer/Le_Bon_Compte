<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241205174945 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE category_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE expense_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE income_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE subcategories_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE "user_id_seq" INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE category (id INT NOT NULL, income_id INT DEFAULT NULL, expense_id INT DEFAULT NULL, type VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_64C19C1640ED2C0 ON category (income_id)');
        $this->addSql('CREATE INDEX IDX_64C19C1F395DB7B ON category (expense_id)');
        $this->addSql('CREATE TABLE expense (id INT NOT NULL, related_user_id INT DEFAULT NULL, date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, amount INT NOT NULL, name VARCHAR(255) NOT NULL, type VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_2D3A8DA698771930 ON expense (related_user_id)');
        $this->addSql('COMMENT ON COLUMN expense.date IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE income (id INT NOT NULL, related_user_id INT DEFAULT NULL, date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, name VARCHAR(255) NOT NULL, type VARCHAR(255) DEFAULT NULL, amount INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_3FA862D098771930 ON income (related_user_id)');
        $this->addSql('COMMENT ON COLUMN income.date IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE subcategories (id INT NOT NULL, category_id INT DEFAULT NULL, type VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_6562A1CB12469DE2 ON subcategories (category_id)');
        $this->addSql('CREATE TABLE "user" (id INT NOT NULL, name VARCHAR(255) NOT NULL, wallet INT DEFAULT NULL, PRIMARY KEY(id))');
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
        $this->addSql('ALTER TABLE category ADD CONSTRAINT FK_64C19C1640ED2C0 FOREIGN KEY (income_id) REFERENCES income (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE category ADD CONSTRAINT FK_64C19C1F395DB7B FOREIGN KEY (expense_id) REFERENCES expense (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE expense ADD CONSTRAINT FK_2D3A8DA698771930 FOREIGN KEY (related_user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE income ADD CONSTRAINT FK_3FA862D098771930 FOREIGN KEY (related_user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE subcategories ADD CONSTRAINT FK_6562A1CB12469DE2 FOREIGN KEY (category_id) REFERENCES category (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE category_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE expense_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE income_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE subcategories_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE "user_id_seq" CASCADE');
        $this->addSql('ALTER TABLE category DROP CONSTRAINT FK_64C19C1640ED2C0');
        $this->addSql('ALTER TABLE category DROP CONSTRAINT FK_64C19C1F395DB7B');
        $this->addSql('ALTER TABLE expense DROP CONSTRAINT FK_2D3A8DA698771930');
        $this->addSql('ALTER TABLE income DROP CONSTRAINT FK_3FA862D098771930');
        $this->addSql('ALTER TABLE subcategories DROP CONSTRAINT FK_6562A1CB12469DE2');
        $this->addSql('DROP TABLE category');
        $this->addSql('DROP TABLE expense');
        $this->addSql('DROP TABLE income');
        $this->addSql('DROP TABLE subcategories');
        $this->addSql('DROP TABLE "user"');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
