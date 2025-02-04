<?php

namespace App\Controller;

use App\Entity\CategoryEntity;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

class CategoryController extends AbstractController
{
    #[Route('/api/categories/{name}', name: 'delete_category', methods: ['DELETE'])]
    public function deleteCategory(string $name, EntityManagerInterface $entityManager, UserInterface $user): JsonResponse
    {
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }

        // Trouver la catégorie par son nom et l'utilisateur
        $category = $entityManager->getRepository(CategoryEntity::class)->findOneBy([
            'name' => $name,
            'userEntity' => $user
        ]);

        if (!$category) {
            return new JsonResponse(['error' => 'Catégorie non trouvée'], 404);
        }

        // Supprimer les sous-catégories associées
        foreach (clone $category->getSubcategoryEntities() as $subcat) {
            $category->removeSubcategoryEntity($subcat);
            $entityManager->remove($subcat);
        }

        // Dissocier les entités Income et Expense associées
        foreach ($category->getIncomeEntity() as $income) {
            $income->setCategoryEntity(null);
        }
        foreach ($category->getExpenseEntity() as $expense) {
            $expense->setCategoryEntity(null);
        }

        // Supprimer la catégorie
        $entityManager->remove($category);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Catégorie supprimée avec succès']);
    }
}
