<?php

namespace App\Controller;

use App\Entity\CategoryEntity;
use App\Entity\SubcategoryEntity;
use App\Service\SubCategoryService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class SubCategoryController extends AbstractController
{
    #[Route('/api/subcategories/{categoryId}', name: 'get_subcategories', methods: ['GET'])]
    public function getSubcategories(
        int $categoryId,
        EntityManagerInterface $entityManager,
        SubCategoryService $subCategoryService
    ): JsonResponse {
        // Rechercher la catégorie
        $category = $entityManager->getRepository(CategoryEntity::class)->find($categoryId);

        if (!$category) {
            return new JsonResponse(['error' => 'Catégorie non trouvée'], 404);
        }

        // Obtenir les sous-catégories fusionnées
        $subcategories = $subCategoryService->getMergedSubCategories($category);

        // Construire une réponse JSON
        $response = array_map(fn(SubcategoryEntity $sub) => [
            'id' => $sub->getId(),
            'name' => $sub->getName(),
        ], $subcategories);

        return new JsonResponse($response);
    }
}
