<?php

namespace App\Controller;

use App\Entity\ExpenseEntity;
use App\Entity\UserEntity;
use App\Form\ExpenseEntityType;
use App\Repository\ExpenseEntityRepository;
use App\Service\CategoryService;
use App\Service\SubCategoryService;
use App\Service\UserProfileService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/expense')]
final class ExpenseEntityController extends AbstractController
{

    #[Route('/new', name: 'app_expense_entity_new', methods: ['GET', 'POST'])]
    public function new(
        Request $request,
        EntityManagerInterface $entityManager,
        CategoryService $categoryService,
        SubCategoryService $subCategoryService
    ): Response {
        $user = $this->getUser();

        if (!$user) {
            throw $this->createAccessDeniedException('Vous devez être connecté pour créer un revenu.');
        }

        $expenseEntity = new ExpenseEntity();
        /** @var \App\Entity\UserEntity $user */

        $categories = $categoryService->getMergedCategories($user);

        $form = $this->createForm(ExpenseEntityType::class, $expenseEntity, [
            'connected_user' => $user,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $categoryName = $form->get('categoryEntity')->getData();

            // Check or create the category
            /** @var userEntity $user*/
            $category = $categoryService->findOrCreateCategory($categoryName, $user);

            $subCategoryName = $form->get('subcategoryEntity')->getData();
            if ($subCategoryName) {
                $subcategory = $subCategoryService->findOrCreateSubCategory($subCategoryName, $category);
                $expenseEntity->setSubcategoryEntity($subcategory);
            }

            $expenseEntity->setCategoryEntity($category);
            $expenseEntity->setUserEntity($user);

            $entityManager->persist($expenseEntity);
            $entityManager->flush();

            return $this->redirectToRoute('app_home_index');
        }

        return $this->render('expense_entity/new.html.twig', [
            'form' => $form->createView(),
            'categories' => $categories,
        ]);
    }


    #[Route('/{id}', name: 'app_expense_entity_show', methods: ['GET'])]
    public function show(ExpenseEntity $expenseEntity): Response
    {

        if ($expenseEntity->getUserEntity() !== $this->getUser()) {
            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }
        return $this->render('expense_entity/show.html.twig', [
            'expense_entity' => $expenseEntity,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_expense_entity_edit', methods: ['GET', 'POST'])]
    public function edit(
        Request $request,
        ExpenseEntity $expenseEntity,
        EntityManagerInterface $entityManager,
        RequestStack $requestStack,
        CategoryService $categoryService,
        SubCategoryService $subCategoryService
    ): Response {
        $user = $this->getUser();

        if ($expenseEntity->getUserEntity() !== $user) {
            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }

        $categories = $categoryService->getMergedCategories($user);

        // Pass the current category associated with React
        $currentCategory = $expenseEntity->getCategoryEntity() ? $expenseEntity->getCategoryEntity()->getName() : '';
        $currentSubcategory = $expenseEntity->getSubcategoryEntity() ? $expenseEntity->getSubcategoryEntity()->getName() : '';

        $form = $this->createForm(ExpenseEntityType::class, $expenseEntity, [
            'connected_user' => $user,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $categoryName = $form->get('categoryEntity')->getData();
            if ($categoryName) {
                $category = $categoryService->findOrCreateCategory($categoryName, $user);
                $expenseEntity->setCategoryEntity($category);
            } else {
                if (!$expenseEntity->getCategoryEntity()) {
                    $expenseEntity->setCategoryEntity(null);
                }
            }

            // Subcategory management
            $subCategoryName = $form->get('subcategoryEntity')->getData();
            if ($subCategoryName) {
                $subcategory = $subCategoryService->findOrCreateSubCategory($subCategoryName, $expenseEntity->getCategoryEntity());
                $expenseEntity->setSubcategoryEntity($subcategory);
            } else {
                // Reset only the subcategory
                $expenseEntity->setSubcategoryEntity(null);
            }

            $entityManager->flush();

            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('expense_entity/edit.html.twig', [
            'expense_entity' => $expenseEntity,
            'form' => $form->createView(),
            'categories' => $categories,
            'currentCategory' => $currentCategory,
            'currentSubcategory' => $currentSubcategory,
        ]);
    }


    #[Route('/{id}', name: 'app_expense_entity_delete', methods: ['POST'])]
    public function delete(Request $request, ExpenseEntity $expenseEntity, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$expenseEntity->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($expenseEntity);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
    }
}
