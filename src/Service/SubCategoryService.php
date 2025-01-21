<?php

namespace App\Service;

use App\Entity\SubcategoryEntity;
use App\Entity\CategoryEntity;
use Doctrine\ORM\EntityManagerInterface;

class SubCategoryService
{
    private EntityManagerInterface $entityManager;

    private array $predefinedSubcategories = [
        'Nourriture',
        'Transports publics',
        'Carburant',
        'Loisirs sportifs',
        'Investissements'
    ];

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function getMergedSubCategories(CategoryEntity $category): array
    {
        $userSubCategories = $this->entityManager
            ->getRepository(SubcategoryEntity::class)
            ->findBy(['categoryEntity' => $category]);

        $userSubCategoryNames = array_map(fn($sub) => $sub->getName(), $userSubCategories);

        return array_unique(array_merge($this->predefinedSubcategories, $userSubCategoryNames), SORT_STRING);
    }
   /* public function getMergedCategories(UserEntity $user): array
    {
        $userCategories = $this->entityManager->getRepository(CategoryEntity::class)
            ->findBy(['userEntity' => $user]);

        return $userCategories; // Retourne directement les objets
    }*/


    public function findOrCreateSubCategory(string $name, CategoryEntity $category): SubcategoryEntity
    {
        $subCategory = $this->entityManager->getRepository(SubcategoryEntity::class)
            ->createQueryBuilder('s')
            ->where('LOWER(s.name) = LOWER(:name)')
            ->andWhere('s.categoryEntity = :category')
            ->setParameter('name', $name)
            ->setParameter('category', $category)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$subCategory) {
            $subCategory = new SubcategoryEntity();
            $subCategory->setName($name);
            $subCategory->setCategoryEntity($category);
            $this->entityManager->persist($subCategory);
            $this->entityManager->flush();
        }

        return $subCategory;
    }
}
