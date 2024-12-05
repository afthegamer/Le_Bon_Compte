<?php

namespace App\DataFixtures;

use App\Entity\Income;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class IncomeFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $income = new Income();
            $income->setName('Income ' . $i);
            $income->setAmount(rand(100, 1000));
            $income->setDate($this->getRandomDate());

            // Récupère un utilisateur aléatoire
            $user = $this->getReference(UserFixtures::USER_REFERENCE . rand(1, 10));
            $income->setRelatedUser($user);

            $manager->persist($income);
        }

        $manager->flush();
    }

    // Dépendances pour s'assurer que UserFixtures est chargée avant
    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
        ];
    }

    // Génère une date aléatoire dans les six derniers mois
    private function getRandomDate(): \DateTimeImmutable
    {
        $timestamp = rand(strtotime('-6 months'), time());
        return new \DateTimeImmutable('@' . $timestamp);
    }
}
