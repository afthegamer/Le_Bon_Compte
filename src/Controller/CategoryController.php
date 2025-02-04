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

        // **1. Suppression récursive des sous-catégories**
        foreach (clone $category->getSubcategoryEntities() as $subcat) {
            foreach (clone $subcat->getExpenseEntity() as $expense) {
                $expense->setSubcategoryEntity(null);
            }
            foreach (clone $subcat->getIncomeEntity() as $income) {
                $income->setSubcategoryEntity(null);
            }
            $category->removeSubcategoryEntity($subcat);
            $entityManager->remove($subcat);
        }

        // **2. Dissocier toutes les entités Income et Expense reliées à la catégorie**
        foreach ($category->getIncomeEntity() as $income) {
            $income->setCategoryEntity(null);
        }
        foreach ($category->getExpenseEntity() as $expense) {
            $expense->setCategoryEntity(null);
        }

        // **3. Supprimer la catégorie maintenant qu'elle n'a plus d'attachements**
        $entityManager->remove($category);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Catégorie et ses sous-catégories supprimées avec succès, mais les transactions associées ont été conservées.']);
    }
}
