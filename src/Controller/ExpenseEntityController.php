<?php

namespace App\Controller;

use App\Entity\ExpenseEntity;
use App\Form\ExpenseEntityType;
use App\Repository\ExpenseEntityRepository;
use App\Service\CategoryService;
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
        CategoryService $categoryService
    ): Response {
        $user = $this->getUser();

        if (!$user) {
            throw $this->createAccessDeniedException('Vous devez être connecté pour créer une dépense.');
        }

        $expenseEntity = new ExpenseEntity();

        // Récupérer les catégories fusionnées
        $categories = $categoryService->getMergedCategories($user);

        // Créer le formulaire
        $form = $this->createForm(ExpenseEntityType::class, $expenseEntity, [
            'connected_user' => $user,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $categoryName = $form->get('categoryEntity')->getData();

            // Vérifier ou créer la catégorie
            $category = $categoryService->findOrCreateCategory($categoryName, $user);

            $expenseEntity->setCategoryEntity($category);
            $expenseEntity->setUserEntity($user);

            $entityManager->persist($expenseEntity);
            $entityManager->flush();

            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('expense_entity/new.html.twig', [
            'form' => $form->createView(),
            'categories' => $categories, // Passer les catégories fusionnées
        ]);
    }


    #[Route('/{id}', name: 'app_expense_entity_show', methods: ['GET'])]
    public function show(ExpenseEntity $expenseEntity,
                         RequestStack $requestStack): Response
    {

        if ($expenseEntity->getUserEntity() !== $this->getUser()) {
            $request = $requestStack->getCurrentRequest();
            $referer = $request->headers->get('referer');

            if ($referer) {
                // Redirige vers la page précédente si disponible
                return $this->redirect($referer);
            }

            // Sinon, redirige vers une route par défaut
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
        CategoryService $categoryService
    ): Response {
        $user = $this->getUser();

        if ($expenseEntity->getUserEntity() !== $user) {
            $referer = $requestStack->getCurrentRequest()->headers->get('referer');
            return $referer
                ? $this->redirect($referer)
                : $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }

        // Récupérer les catégories fusionnées
        $categories = $categoryService->getMergedCategories($user);

        // Passer la catégorie actuelle associée à React
        $currentCategory = $expenseEntity->getCategoryEntity() ? $expenseEntity->getCategoryEntity()->getName() : '';

        // Créer le formulaire
        $form = $this->createForm(ExpenseEntityType::class, $expenseEntity, [
            'connected_user' => $user,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $categoryName = $form->get('categoryEntity')->getData();

            // Vérifier ou créer la catégorie
            $category = $categoryService->findOrCreateCategory($categoryName, $user);

            $expenseEntity->setCategoryEntity($category);

            $entityManager->flush();

            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('expense_entity/edit.html.twig', [
            'expense_entity' => $expenseEntity,
            'form' => $form->createView(),
            'categories' => $categories,
            'currentCategory' => $currentCategory, // Passer la catégorie actuelle
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
