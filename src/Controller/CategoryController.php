<?php

namespace App\Controller;

use App\Entity\CategoryEntity;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\User\UserInterface;

class CategoryController extends AbstractController
{
    #[Route('/api/categories/{name}', name: 'delete_category', methods: ['DELETE'])]
    public function deleteCategory(string $name, EntityManagerInterface $entityManager, UserInterface $user): JsonResponse
    {
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }

        // Find the category by name and user
        $category = $entityManager->getRepository(CategoryEntity::class)->findOneBy([
            'name' => $name,
            'userEntity' => $user
        ]);

        if (!$category) {
            return new JsonResponse(['error' => 'Catégorie non trouvée'], 404);
        }

        // ** 1. Recursive abolition of subcategories **
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

        // ** 2. Dissociate all the incomes and expense entities connected to the category **
        foreach ($category->getIncomeEntity() as $income) {
            $income->setCategoryEntity(null);
        }
        foreach ($category->getExpenseEntity() as $expense) {
            $expense->setCategoryEntity(null);
        }

        // ** 3. Delete the category now that it has no more attachments **
        $entityManager->remove($category);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Catégorie et ses sous-catégories supprimées avec succès, mais les transactions associées ont été conservées.']);
    }
}
