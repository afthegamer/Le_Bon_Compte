<?php

namespace App\Controller;

use App\Entity\CategoryEntity;
use App\Entity\SubcategoryEntity;
use App\Service\SubCategoryService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class SubCategoryController extends AbstractController
{
    #[Route('/api/subcategories/{categoryId}', name: 'get_subcategories', methods: ['GET'])]
    public function getSubcategories(int $categoryId, SubCategoryService $subCategoryService): JsonResponse
    {
        $subcategories = $subCategoryService->getMergedSubCategoriesByCategoryId($categoryId);

        $response = array_map(fn(SubcategoryEntity $sub) => [
            'id' => $sub->getId(),
            'name' => $sub->getName(),
        ], $subcategories);

        return new JsonResponse($response);
    }

    #[Route('/api/subcategories/by-name/{categoryName}', name: 'get_subcategories_by_name', methods: ['GET'])]
    public function getSubcategoriesByName(
        string $categoryName,
        SubCategoryService $subCategoryService,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non connecté'], 401);
        }

        // Recover the category by name via the injected entityManager
        $category = $entityManager->getRepository(CategoryEntity::class)
            ->findOneBy(['name' => $categoryName]);

        if (!$category) {
            return new JsonResponse(['error' => 'Catégorie introuvable'], 404);
        }

        // Use the Getmergedsubcategories method to obtain the merged object
        $mergedSubcategories = $subCategoryService->getMergedSubCategories($category);

        return new JsonResponse($mergedSubcategories);
    }

    #[Route('/api/subcategories/{id}', name: 'delete_subcategory', methods: ['DELETE'])]
    public function deleteSubcategory(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        // Recover the subcategory to delete
        $subcategory = $entityManager->getRepository(SubcategoryEntity::class)->find($id);
        if (!$subcategory) {
            return new JsonResponse(['error' => 'Sous-catégorie non trouvée'], 404);
        }

        // Dissociate the subcategory from Expense entities
        foreach ($subcategory->getExpenseEntity() as $expense) {
            $expense->setSubcategoryEntity(null);
        }

        // Dissociate the subcategory of incomes
        foreach ($subcategory->getIncomeEntity() as $income) {
            $income->setSubcategoryEntity(null);
        }

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
            /** @var \App\Entity\UserEntity $user */
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
