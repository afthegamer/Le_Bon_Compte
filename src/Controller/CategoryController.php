<?php

namespace App\Controller;

use App\Entity\CategoryEntity;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class CategoryController extends AbstractController
{
    #[Route('/api/categories/{id}', name: 'delete_category', methods: ['DELETE'])]
    public function deleteCategory(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        // Récupérer la catégorie par son identifiant
        $category = $entityManager->getRepository(CategoryEntity::class)->find($id);
        if (!$category) {
            return new JsonResponse(['error' => 'Catégorie non trouvée'], 404);
        }

        // Dissocier les revenus associés à cette catégorie
        foreach ($category->getIncomeEntity() as $income) {
            $income->setCategoryEntity(null);
        }

        // Dissocier les dépenses associées à cette catégorie
        foreach ($category->getExpenseEntity() as $expense) {
            $expense->setCategoryEntity(null);
        }

        // Dissocier les sous-catégories associées à cette catégorie
        foreach ($category->getSubcategoryEntities() as $subcat) {
            // Vous pouvez soit décider de dissocier, soit supprimer la sous-catégorie en fonction de votre logique
            $subcat->setCategoryEntity(null);
        }

        // Supprimer la catégorie
        $entityManager->remove($category);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Catégorie supprimée et dissociée avec succès']);
    }
}
