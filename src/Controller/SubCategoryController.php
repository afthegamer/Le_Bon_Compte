<?php

namespace App\Controller;

use App\Entity\CategoryEntity;
use App\Entity\SubcategoryEntity;
use App\Entity\UserEntity;
use App\Service\SubCategoryService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SubCategoryController extends AbstractController
{
    #[Route('/api/subcategories/{categoryId}', name: 'get_subcategories', methods: ['GET'])]
    public function getSubcategories(int $categoryId, SubCategoryService $subCategoryService): JsonResponse
    {
        // Utiliser le service pour récupérer les sous-catégories liées à la catégorie
        $subcategories = $subCategoryService->getMergedSubCategoriesByCategoryId($categoryId);

        // Construire la réponse JSON
        $response = array_map(fn(SubcategoryEntity $sub) => [
            'id' => $sub->getId(),
            'name' => $sub->getName(),
        ], $subcategories);

        return new JsonResponse($response);
    }


    #[Route('/api/subcategories/by-name/{categoryName}', name: 'get_subcategories_by_name', methods: ['GET'])]
    public function getSubcategoriesByName(string $categoryName, SubCategoryService $subCategoryService): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non connecté'], 401);
        }

        try {
            // Obtenir les sous-catégories via le service
            $subcategories = $subCategoryService->getSubCategoriesByCategoryNameAndUser($categoryName, $user);

            return new JsonResponse(array_map(fn($sub) => [
                'id' => $sub->getId(),
                'name' => $sub->getName(),
            ], $subcategories));
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 404);
        }
    }
    #[Route('/api/subcategories/{id}', name: 'delete_subcategory', methods: ['DELETE'])]
    public function deleteSubcategory(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        // Récupérer la sous-catégorie à supprimer
        $subcategory = $entityManager->getRepository(SubcategoryEntity::class)->find($id);
        if (!$subcategory) {
            return new JsonResponse(['error' => 'Sous-catégorie non trouvée'], 404);
        }

        // Dissocier la sous-catégorie des entités Expense
        foreach ($subcategory->getExpenseEntity() as $expense) {
            // La méthode removeExpenseEntity() de la sous-catégorie gère la dissociation
            // ou vous pouvez appeler directement le setter du côté Expense
            $expense->setSubcategoryEntity(null);
        }

        // Dissocier la sous-catégorie des entités Income
        foreach ($subcategory->getIncomeEntity() as $income) {
            $income->setSubcategoryEntity(null);
        }

        // Maintenant, on peut supprimer la sous-catégorie
        $entityManager->remove($subcategory);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Sous-catégorie supprimée et dissociée avec succès']);
    }

    #[Route('/api/subcategories', name: 'create_subcategory', methods: ['POST'])]
    public function createSubcategory(Request $request, SubCategoryService $subCategoryService): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non connecté'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $categoryName = $data['categoryName'] ?? null;
        $subcategoryName = $data['subcategoryName'] ?? null;

        if (!$categoryName || !$subcategoryName) {
            return new JsonResponse(['error' => 'Nom de la catégorie ou sous-catégorie manquant'], 400);
        }

        try {
            // Créer la sous-catégorie via le service
            $subcategory = $subCategoryService->createSubCategory($categoryName, $subcategoryName, $user);

            return new JsonResponse([
                'id' => $subcategory->getId(),
                'name' => $subcategory->getName(),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }



}
