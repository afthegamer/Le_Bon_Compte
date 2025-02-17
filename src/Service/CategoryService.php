<?php

namespace App\Service;

use App\Entity\CategoryEntity;
use App\Entity\UserEntity;
use Doctrine\ORM\EntityManagerInterface;

class CategoryService
{
    private EntityManagerInterface $entityManager;

    private array $predefinedCategories = [
        "Alimentation",
        "Logement",
        "Transports",
        "Loisirs",
        "Santé",
        "Impôts",
        "Assurances",
        "Épargne",
        "Salaire",
        "Autre",
    ];

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * Returns an associative table containing two keys:
     * - 'predefined': predefined categories
     * - 'User': the categories created by the user
     */
    public function getMergedCategories(UserEntity $user): array
    {
        $userCategories = $this->entityManager
            ->getRepository(CategoryEntity::class)
            ->findByUser($user);

        $userCategoryNames = array_map(function (CategoryEntity $category) {
            return $category->getName();
        }, $userCategories);

        return [
            'predefined' => $this->predefinedCategories,
            'user'       => $userCategoryNames,
        ];
    }

    /**
     * Check if a category exists for the user or created it.
     */
    public function findOrCreateCategory(string $name, UserEntity $user): CategoryEntity
    {
        $category = $this->entityManager->getRepository(CategoryEntity::class)
            ->createQueryBuilder('c')
            ->where('LOWER(c.name) = LOWER(:name)')
            ->andWhere('c.userEntity = :user')
            ->setParameter('name', $name)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$category) {
            $category = new CategoryEntity();
            $category->setName($name);
            $category->setUserEntity($user);
            $this->entityManager->persist($category);
            $this->entityManager->flush();
        }

        return $category;
    }
    public function addPredefinedCategories(UserEntity $user): void
    {
        foreach ($this->predefinedCategories as $categoryName) {
            $this->findOrCreateCategory($categoryName, $user);
        }
    }
}
