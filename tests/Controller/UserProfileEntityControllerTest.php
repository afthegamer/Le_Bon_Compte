<?php

namespace App\Tests\Controller;

use App\Entity\UserProfileEntity;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class UserProfileEntityControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $manager;
    private EntityRepository $repository;
    private string $path = '/user/profile/entity/';

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->manager = static::getContainer()->get('doctrine')->getManager();
        $this->repository = $this->manager->getRepository(UserProfileEntity::class);

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
        self::assertPageTitleContains('UserProfileEntity index');

        // Use the $crawler to perform additional assertions e.g.
        // self::assertSame('Some text on the page', $crawler->filter('.p')->first());
    }

    public function testNew(): void
    {
        $this->markTestIncomplete();
        $this->client->request('GET', sprintf('%snew', $this->path));

        self::assertResponseStatusCodeSame(200);

        $this->client->submitForm('Save', [
            'user_profile_entity[firstName]' => 'Testing',
            'user_profile_entity[lastName]' => 'Testing',
            'user_profile_entity[userEntity]' => 'Testing',
        ]);

        self::assertResponseRedirects($this->path);

        self::assertSame(1, $this->repository->count([]));
    }

    public function testShow(): void
    {
        $this->markTestIncomplete();
        $fixture = new UserProfileEntity();
        $fixture->setFirstName('My Title');
        $fixture->setLastName('My Title');
        $fixture->setUserEntity('My Title');

        $this->manager->persist($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s', $this->path, $fixture->getId()));

        self::assertResponseStatusCodeSame(200);
        self::assertPageTitleContains('UserProfileEntity');

        // Use assertions to check that the properties are properly displayed.
    }

    public function testEdit(): void
    {
        $this->markTestIncomplete();
        $fixture = new UserProfileEntity();
        $fixture->setFirstName('Value');
        $fixture->setLastName('Value');
        $fixture->setUserEntity('Value');

        $this->manager->persist($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s/edit', $this->path, $fixture->getId()));

        $this->client->submitForm('Update', [
            'user_profile_entity[firstName]' => 'Something New',
            'user_profile_entity[lastName]' => 'Something New',
            'user_profile_entity[userEntity]' => 'Something New',
        ]);

        self::assertResponseRedirects('/user/profile/entity/');

        $fixture = $this->repository->findAll();

        self::assertSame('Something New', $fixture[0]->getFirstName());
        self::assertSame('Something New', $fixture[0]->getLastName());
        self::assertSame('Something New', $fixture[0]->getUserEntity());
    }

    public function testRemove(): void
    {
        $this->markTestIncomplete();
        $fixture = new UserProfileEntity();
        $fixture->setFirstName('Value');
        $fixture->setLastName('Value');
        $fixture->setUserEntity('Value');

        $this->manager->persist($fixture);
        $this->manager->flush();

        $this->client->request('GET', sprintf('%s%s', $this->path, $fixture->getId()));
        $this->client->submitForm('Delete');

        self::assertResponseRedirects('/user/profile/entity/');
        self::assertSame(0, $this->repository->count([]));
    }
}
