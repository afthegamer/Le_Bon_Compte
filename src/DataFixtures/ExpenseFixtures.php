<?php


namespace App\DataFixtures;

use App\Entity\Expense;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class ExpenseFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $expense = new Expense();
            $expense->setName('Expense ' . $i);
            $expense->setAmount(rand(50, 500));
            $expense->setDate($this->getRandomDate());

            // Récupère un utilisateur aléatoire
            $user = $this->getReference(UserFixtures::USER_REFERENCE . rand(1, 10));
            $expense->setRelatedUser($user);

            $manager->persist($expense);
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
