<?php

namespace App\Tests\Controller;

use App\Entity\IncomeEntity;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class IncomeEntityControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $manager;
    private EntityRepository $repository;
    private string $path = '/income/entity/';

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->manager = static::getContainer()->get('doctrine')->getManager();
        $this->repository = $this->manager->getRepository(IncomeEntity::class);

        foreach ($this->repository->findAll() as $object) {
            $this->manager->remove($object);
        }

        $this->manager->flush();
    }

    public function testIndex(): void
    {
        $this->client->followRedirects();
        $crawler = $this->client->request('GET', $this->path);

        self::assertResponseStatusCodeSame(200);
        self::assertPageTitleContains('IncomeEntity index');

        // Use the $crawler to perform additional assertions e.g.
        // self::assertSame('Some text on the page', $crawler->filter('.p')->first());
    }

    public function testNew(): void
    {
        $this->markTestIncomplete();
        $this->client->request('GET', sprintf('%snew', $this->path));

        self::assertResponseStatusCodeSame(200);

        $this->client->submitForm('Save', [
            'income_entity[name]' => 'Testing',
            'income_entity[amount]' => 'Testing',
            'income_entity[type]' => 'Testing',
            'income_entity[date]' => 'Testing',
            'income_entity[userEntity]' => 'Testing',
            'income_entity[categoryEntity]' => 'Testing',
            'income_entity[userProfileEntity]' => 'Testing',
        ]);

        self::assertResponseRedirects($this->path);

        self::assertSame(1, $this->repository->count([]));
    }

    public function testShow(): void
    {
        $this->markTestIncomplete();
        $fixture = new IncomeEntity();
        $fixture->setName('My Title');
        $fixture->setAmount('My Title');
        $fixture->setType('My Title');
        $fixture->setDate('My Title');
        $fixture->setUserEntity('My Title');
        $fixture->setCategoryEntity('My Title');
        $fixture->setUserProfileEntity('My Title');

        $this->manager->persist($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s', $this->path, $fixture->getId()));

        self::assertResponseStatusCodeSame(200);
        self::assertPageTitleContains('IncomeEntity');

        // Use assertions to check that the properties are properly displayed.
    }

    public function testEdit(): void
    {
        $this->markTestIncomplete();
        $fixture = new IncomeEntity();
        $fixture->setName('Value');
        $fixture->setAmount('Value');
        $fixture->setType('Value');
        $fixture->setDate('Value');
        $fixture->setUserEntity('Value');
        $fixture->setCategoryEntity('Value');
        $fixture->setUserProfileEntity('Value');

        $this->manager->persist($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s/edit', $this->path, $fixture->getId()));

        $this->client->submitForm('Update', [
            'income_entity[name]' => 'Something New',
            'income_entity[amount]' => 'Something New',
            'income_entity[type]' => 'Something New',
            'income_entity[date]' => 'Something New',
            'income_entity[userEntity]' => 'Something New',
            'income_entity[categoryEntity]' => 'Something New',
            'income_entity[userProfileEntity]' => 'Something New',
        ]);

        self::assertResponseRedirects('/income/entity/');

        $fixture = $this->repository->findAll();

        self::assertSame('Something New', $fixture[0]->getName());
        self::assertSame('Something New', $fixture[0]->getAmount());
        self::assertSame('Something New', $fixture[0]->getType());
        self::assertSame('Something New', $fixture[0]->getDate());
        self::assertSame('Something New', $fixture[0]->getUserEntity());
        self::assertSame('Something New', $fixture[0]->getCategoryEntity());
        self::assertSame('Something New', $fixture[0]->getUserProfileEntity());
    }

    public function testRemove(): void
    {
        $this->markTestIncomplete();
        $fixture = new IncomeEntity();
        $fixture->setName('Value');
        $fixture->setAmount('Value');
        $fixture->setType('Value');
        $fixture->setDate('Value');
        $fixture->setUserEntity('Value');
        $fixture->setCategoryEntity('Value');
        $fixture->setUserProfileEntity('Value');

        $this->manager->persist($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s', $this->path, $fixture->getId()));
        $this->client->submitForm('Delete');

        self::assertResponseRedirects('/income/entity/');
        self::assertSame(0, $this->repository->count([]));
    }
}
