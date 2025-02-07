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
     * Renvoie un tableau associatif contenant deux clés :
     * - 'predefined' : les catégories prédéfinies
     * - 'user'       : les catégories créées par l'utilisateur
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
     * Vérifie si une catégorie existe pour l'utilisateur ou la crée.
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
