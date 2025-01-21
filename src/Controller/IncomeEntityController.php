<?php

namespace App\Controller;

use App\Entity\CategoryEntity;
use App\Entity\IncomeEntity;
use App\Form\IncomeEntityType;
use App\Repository\IncomeEntityRepository;
use App\Service\CategoryService;
use App\Service\SubCategoryService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/income')]
final class IncomeEntityController extends AbstractController
{

    #[Route('/new', name: 'app_income_entity_new', methods: ['GET', 'POST'])]
    public function new(
        Request $request,
        EntityManagerInterface $entityManager,
        CategoryService $categoryService,
        SubCategoryService $subCategoryService // Ajout du service pour les sous-catégories
    ): Response {
        $user = $this->getUser();

        if (!$user) {
            throw $this->createAccessDeniedException('Vous devez être connecté pour créer un revenu.');
        }

        $incomeEntity = new IncomeEntity();

        // Récupérer les catégories fusionnées
        $categories = $categoryService->getMergedCategories($user);

        // Créer le formulaire
        $form = $this->createForm(IncomeEntityType::class, $incomeEntity, [
            'connected_user' => $user,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $categoryName = $form->get('categoryEntity')->getData();

            // Vérifier ou créer la catégorie
            $category = $categoryService->findOrCreateCategory($categoryName, $user);

            // Gestion de la sous-catégorie
            $subCategoryName = $form->get('subcategoryEntity')->getData();
            if ($subCategoryName) {
                $subCategoryService->findOrCreateSubCategory($subCategoryName, $category);
            }

            $incomeEntity->setCategoryEntity($category);
            $incomeEntity->setUserEntity($user);

            $entityManager->persist($incomeEntity);
            $entityManager->flush();

            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }

        // Sous-catégories dynamiques (en fonction de la première catégorie par défaut)
        $defaultCategory = isset($categories[0])
            ? $entityManager->getRepository(CategoryEntity::class)->findOneBy(['name' => $categories[0]])
            : null;

        $subcategories = $defaultCategory
            ? $subCategoryService->getMergedSubCategories($defaultCategory)
            : [];


        return $this->render('income_entity/new.html.twig', [
            'form' => $form->createView(),
            'income_entity' => $incomeEntity,
            'categories' => $categories,
            'selectedCategory' =>  null, // Ajoute la première catégorie comme sélectionnée par défaut
            'subcategories' => $subcategories, // Ajout des sous-catégories pour React
        ]);
    }

    #[Route('/{id}', name: 'app_income_entity_show', methods: ['GET'])]
    public function show(IncomeEntity $incomeEntity,
                         RequestStack $requestStack): Response
    {
        if ($incomeEntity->getUserEntity() !== $this->getUser()) {
            $request = $requestStack->getCurrentRequest();
            $referer = $request->headers->get('referer');

            if ($referer) {
                // Redirige vers la page précédente si disponible
                return $this->redirect($referer);
            }

            // Sinon, redirige vers une route par défaut
            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('income_entity/show.html.twig', [
            'income_entity' => $incomeEntity,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_income_entity_edit', methods: ['GET', 'POST'])]
    public function edit(
        Request $request,
        IncomeEntity $incomeEntity,
        EntityManagerInterface $entityManager,
        RequestStack $requestStack,
        CategoryService $categoryService,
        SubCategoryService $subCategoryService // Ajout du service pour les sous-catégories
    ): Response {
        $user = $this->getUser();

        if ($incomeEntity->getUserEntity() !== $user) {
            $referer = $requestStack->getCurrentRequest()->headers->get('referer');
            return $referer
                ? $this->redirect($referer)
                : $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }

        // Récupérer les catégories fusionnées
        $categories = $categoryService->getMergedCategories($user);

        // Récupérer les sous-catégories de la catégorie actuelle
        $currentCategory = $incomeEntity->getCategoryEntity();
        $subcategories = $currentCategory
            ? $subCategoryService->getMergedSubCategories($currentCategory)
            : [];

        // Créer le formulaire
        $form = $this->createForm(IncomeEntityType::class, $incomeEntity, [
            'connected_user' => $user,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $categoryName = $form->get('categoryEntity')->getData();

            // Vérifier ou créer la catégorie
            $category = $categoryService->findOrCreateCategory($categoryName, $user);

            // Gestion de la sous-catégorie
            $subCategoryName = $form->get('subcategoryEntity')->getData();
            if ($subCategoryName) {
                $subCategoryService->findOrCreateSubCategory($subCategoryName, $category);
            }

            $incomeEntity->setCategoryEntity($category);

            $entityManager->flush();

            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('income_entity/edit.html.twig', [
            'income_entity' => $incomeEntity,
            'form' => $form->createView(),
            'categories' => $categories,
            'currentCategory' => $currentCategory ? $currentCategory->getName() : '',
            'subcategories' => $subcategories, // Ajout des sous-catégories pour React
        ]);
    }
    #[Route('/{id}', name: 'app_income_entity_delete', methods: ['POST'])]
    public function delete(Request $request, IncomeEntity $incomeEntity, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$incomeEntity->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($incomeEntity);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
    }
}
