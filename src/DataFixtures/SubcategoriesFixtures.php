<?php

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\Subcategories;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class SubcategoriesFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $categoryRepository = $manager->getRepository(Category::class);
        $categories = $categoryRepository->findAll();

        for ($i = 1; $i <= 10; $i++) {
            $subcategory = new Subcategories();
            $subcategory->setType('Subcategory ' . $i);
            $subcategory->setCategory($categories[array_rand($categories)]);

            $manager->persist($subcategory);
        }

        $manager->flush();
    }
}
