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
    public function deleteCategory(string $id, EntityManagerInterface $entityManager): JsonResponse
    {
        // Ici, on suppose que $id correspond au nom de la catégorie
        // Vous devrez adapter la logique de recherche selon votre entité
        $category = $entityManager->getRepository(CategoryEntity::class)->findOneBy(['name' => $id]);

        if (!$category) {
            return new JsonResponse(['error' => 'Catégorie non trouvée'], 404);
        }

        $entityManager->remove($category);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Catégorie supprimée avec succès']);
    }
}
