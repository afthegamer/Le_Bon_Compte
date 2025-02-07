<?php

namespace App\Controller;

use App\Entity\CategoryEntity;
use App\Entity\SubcategoryEntity;
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
        // Utiliser la méthode getMergedSubCategoriesByCategoryId pour récupérer les sous-catégories
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

        // Récupérer la catégorie par son nom via l'EntityManager injecté
        $category = $entityManager->getRepository(CategoryEntity::class)
            ->findOneBy(['name' => $categoryName]);

        if (!$category) {
            return new JsonResponse(['error' => 'Catégorie introuvable'], 404);
        }

        // Utiliser la méthode getMergedSubCategories pour obtenir l'objet fusionné
        $mergedSubcategories = $subCategoryService->getMergedSubCategories($category);

        // La réponse renvoyée aura la structure :
        // { "predefined": [ {id:null, name: "banana"}, {id:null, name:"petit commerce"} ], "user": [ ... ] }
        return new JsonResponse($mergedSubcategories);
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
            $expense->setSubcategoryEntity(null);
        }

        // Dissocier la sous-catégorie des entités Income
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
