<?php

namespace App\Service;

use App\Entity\SubcategoryEntity;
use App\Entity\CategoryEntity;
use App\Entity\UserEntity;
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


    /**
     * Récupère les sous-catégories associées à une catégorie donnée.
     */
    public function getMergedSubCategoriesByCategoryId(int $categoryId): array
    {
        $category = $this->entityManager
            ->getRepository(CategoryEntity::class)
            ->find($categoryId);

        if (!$category) {
            throw new \InvalidArgumentException('La catégorie spécifiée est introuvable.');
        }

        return $this->entityManager
            ->getRepository(SubcategoryEntity::class)
            ->findBy(['categoryEntity' => $category]);
    }


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

    public function getSubCategoriesByCategoryNameAndUser(string $categoryName, UserEntity $user): array
    {
        // Rechercher la catégorie par nom et utilisateur
        $category = $this->entityManager
            ->getRepository(CategoryEntity::class)
            ->findOneBy(['name' => $categoryName, 'userEntity' => $user]);

        if (!$category) {
            throw new \InvalidArgumentException('Catégorie introuvable ou non accessible par cet utilisateur.');
        }

        // Retourner les sous-catégories associées
        return $this->entityManager
            ->getRepository(SubcategoryEntity::class)
            ->findBy(['categoryEntity' => $category]);
    }

    public function createSubCategory(string $categoryName, string $subcategoryName, UserEntity $user): SubcategoryEntity
    {
        $category = $this->entityManager
            ->getRepository(CategoryEntity::class)
            ->findOneBy(['name' => $categoryName, 'userEntity' => $user]);

        if (!$category) {
            throw new \InvalidArgumentException('Catégorie introuvable ou non accessible par cet utilisateur.');
        }

        // Vérifier si la sous-catégorie existe déjà
        $existingSubcategory = $this->entityManager
            ->getRepository(SubcategoryEntity::class)
            ->findOneBy(['name' => $subcategoryName, 'categoryEntity' => $category]);

        if ($existingSubcategory) {
            throw new \InvalidArgumentException('La sous-catégorie existe déjà.');
        }

        // Créer une nouvelle sous-catégorie
        $subcategory = new SubcategoryEntity();
        $subcategory->setName($subcategoryName);
        $subcategory->setCategoryEntity($category);

        $this->entityManager->persist($subcategory);
        $this->entityManager->flush();

        return $subcategory;
    }

}
