<?php

namespace App\Service;

use App\Entity\SubcategoryEntity;
use App\Entity\CategoryEntity;
use App\Entity\UserEntity;
use Doctrine\ORM\EntityManagerInterface;

class SubCategoryService
{
    private EntityManagerInterface $entityManager;

    // Structure pour les sous-catégories prédéfinies :
    // La clé correspond au nom de la catégorie et la valeur est un tableau de sous-catégories prédéfinies.
    private array $predefinedSubcategories = [
        "Alimentation"=> [
            "Courses",
            "Restaurants",
            "Fast-food",
            "Boissons",
            "Autre",
        ],
        "Logement"   => [
            "Loyer",
            "Électricité",
            "Eau",
            "Gaz",
            "Internet",
            "Téléphone",
            "Autre",
        ],
        "Transports" => [
            "Essence",
            "Parking",
            "Métro",
            "Bus",
            "Train",
            "Avion",
            "Taxi",
            "Vélo",
            "Autre",
        ],
        "Loisirs"   => [
            "Cinéma",
            "Sport",
            "Jeux vidéo",
            "Livres",
            "Musique",
            "Sorties",
            "Autre",
        ],
        "Santé"=> [
            "Médecin",
            "Pharmacie",
            "Hôpital",
            "Optique",
            "Dentiste",
            "Autre",
        ],
        "Impôts" => [
            "Taxe d'habitation",
            "Taxe foncière",
            "Impôt sur le revenu",
            "Autre",
        ],
        "Assurances"=> [
            "Auto",
            "Maison",
            "Santé",
            "Vie",
            "Autre",
        ],
        "Épargne"=> [
            "Livret A",
            "Assurance-vie",
            "PEA",
            "PEL",
            "Autre",
        ],
        "Salaire"=> [
            "Salaire net",
            "Salaire brut",
            "Primes",
            "Autre",
        ],
        "Autre"=> ["Autre"],
    ];

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * Fusionne les sous-catégories prédéfinies et celles de l'utilisateur pour une catégorie donnée.
     * Retourne un tableau associatif avec les clés "predefined" et "user".
     *
     * La structure de chaque sous-catégorie est un tableau avec les clés "id" et "name".
     *
     * @param CategoryEntity $category
     * @return array
     */
    public function getMergedSubCategories(CategoryEntity $category): array
    {
        $categoryName = $category->getName();

        // Récupérer les sous-catégories créées par l'utilisateur pour la catégorie donnée,
        // en les transformant en objets avec "id" et "name".
        $userSubCategories = $this->entityManager
            ->getRepository(SubcategoryEntity::class)
            ->findBy(['categoryEntity' => $category]);

        $userSubCategoryObjects = array_map(function(SubcategoryEntity $sub) {
            return [
                'id'   => $sub->getId(),
                'name' => $sub->getName()
            ];
        }, $userSubCategories);

        // Récupérer les sous-catégories prédéfinies pour cette catégorie, si elles existent.
        $predefinedNames = isset($this->predefinedSubcategories[$categoryName])
            ? $this->predefinedSubcategories[$categoryName]
            : [];

        $predefinedSubCategoryObjects = array_map(function($name) {
            return [
                'id'   => null,
                'name' => $name
            ];
        }, $predefinedNames);

        // Filtrer les sous-catégories utilisateur pour exclure celles déjà présentes dans la liste prédéfinie (comparaison insensible à la casse)
        $filteredUserSubCategoryObjects = array_filter($userSubCategoryObjects, function($subObj) use ($predefinedNames) {
            foreach ($predefinedNames as $pre) {
                if (strtolower($subObj['name']) === strtolower($pre)) {
                    return false;
                }
            }
            return true;
        });

        return [
            'predefined' => $predefinedSubCategoryObjects,
            'user'       => array_values($filteredUserSubCategoryObjects),
        ];
    }

    /**
     * Récupère les sous-catégories associées à une catégorie donnée via son identifiant.
     *
     * @param int $categoryId
     * @return array
     * @throws \InvalidArgumentException
     */
    public function getMergedSubCategoriesByCategoryId(int $categoryId): array
    {
        $category = $this->entityManager
            ->getRepository(CategoryEntity::class)
            ->find($categoryId);

        if (!$category) {
            throw new \InvalidArgumentException('La catégorie spécifiée est introuvable.');
        }

        // Ici, on retourne uniquement les entités SubcategoryEntity.
        // Vous pouvez adapter cette méthode selon vos besoins.
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
