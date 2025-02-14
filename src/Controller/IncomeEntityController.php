<?php

namespace App\Controller;

use App\Entity\IncomeEntity;
use App\Form\IncomeEntityType;
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
        SubCategoryService $subCategoryService
    ): Response {
        $user = $this->getUser();

        if (!$user) {
            throw $this->createAccessDeniedException('Vous devez être connecté pour créer un revenu.');
        }

        $incomeEntity = new IncomeEntity();
        /** @var \App\Entity\UserEntity $user */
        $categories = $categoryService->getMergedCategories($user);

        $form = $this->createForm(IncomeEntityType::class, $incomeEntity, [
            'connected_user' => $user,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $categoryName = $form->get('categoryEntity')->getData();

            $category = $categoryService->findOrCreateCategory($categoryName, $user);

            $subCategoryName = $form->get('subcategoryEntity')->getData();
            if ($subCategoryName) {
                $subcategory = $subCategoryService->findOrCreateSubCategory($subCategoryName, $category);
                $incomeEntity->setSubcategoryEntity($subcategory);
            }

            $incomeEntity->setCategoryEntity($category);
            $incomeEntity->setUserEntity($user);

            $entityManager->persist($incomeEntity);
            $entityManager->flush();

            return $this->redirectToRoute('app_home_index');
        }

        return $this->render('income_entity/new.html.twig', [
            'form' => $form->createView(),
            'categories' => $categories,
        ]);
    }


    #[Route('/{id}', name: 'app_income_entity_show', methods: ['GET'])]
    public function show(IncomeEntity $incomeEntity,
                         RequestStack $requestStack): Response
    {
        if ($incomeEntity->getUserEntity() !== $this->getUser()) {
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
        SubCategoryService $subCategoryService
    ): Response {
        $user = $this->getUser();

        if ($incomeEntity->getUserEntity() !== $user) {
            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }

        $categories = $categoryService->getMergedCategories($user);

        // Pass the current category associated with React
        $currentCategory = $incomeEntity->getCategoryEntity() ? $incomeEntity->getCategoryEntity()->getName() : '';
        $currentSubcategory = $incomeEntity->getSubcategoryEntity() ? $incomeEntity->getSubcategoryEntity()->getName() : '';

        $form = $this->createForm(IncomeEntityType::class, $incomeEntity, [
            'connected_user' => $user,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $categoryName = $form->get('categoryEntity')->getData();
            if ($categoryName) {
                $category = $categoryService->findOrCreateCategory($categoryName, $user);
                $incomeEntity->setCategoryEntity($category);
            } else {
                // Reset the category only so explicitly empty
                if (!$incomeEntity->getCategoryEntity()) {
                    $incomeEntity->setCategoryEntity(null);
                }
            }

            // Subcategory management
            $subCategoryName = $form->get('subcategoryEntity')->getData();
            if ($subCategoryName) {
                $subcategory = $subCategoryService->findOrCreateSubCategory($subCategoryName, $incomeEntity->getCategoryEntity());
                $incomeEntity->setSubcategoryEntity($subcategory);
            } else {
                // Reset only the subcategory
                $incomeEntity->setSubcategoryEntity(null);
            }

            $entityManager->flush();

            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('income_entity/edit.html.twig', [
            'income_entity' => $incomeEntity,
            'form' => $form->createView(),
            'categories' => $categories,
            'currentCategory' => $currentCategory,
            'currentSubcategory' => $currentSubcategory,
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
