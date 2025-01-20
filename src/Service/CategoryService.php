<?php

namespace App\Service;

use App\Entity\CategoryEntity;
use App\Entity\UserEntity;
use Doctrine\ORM\EntityManagerInterface;

class CategoryService
{
    private EntityManagerInterface $entityManager;

    private array $predefinedCategories = [];

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * Fusionne les catégories prédéfinies et celles de l'utilisateur.
     */
    public function getMergedCategories(UserEntity $user): array
    {
        $userCategories = $this->entityManager
            ->getRepository(CategoryEntity::class)
            ->findByUser($user);

        $userCategoryNames = array_map(fn($category) => $category->getName(), $userCategories);

        return array_unique(array_merge($this->predefinedCategories, $userCategoryNames), SORT_STRING);
    }

    /**
     * Vérifie si une catégorie existe ou la crée.
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
}
