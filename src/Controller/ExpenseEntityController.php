<?php

namespace App\Controller;

use App\Entity\ExpenseEntity;
use App\Form\ExpenseEntityType;
use App\Repository\ExpenseEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/expense/entity')]
final class ExpenseEntityController extends AbstractController
{
    #[Route(name: 'app_expense_entity_index', methods: ['GET'])]
    public function index(ExpenseEntityRepository $expenseEntityRepository): Response
    {
        return $this->render('expense_entity/index.html.twig', [
            'expense_entities' => $expenseEntityRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_expense_entity_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $expenseEntity = new ExpenseEntity();
        $form = $this->createForm(ExpenseEntityType::class, $expenseEntity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($expenseEntity);
            $entityManager->flush();

            return $this->redirectToRoute('app_expense_entity_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('expense_entity/new.html.twig', [
            'expense_entity' => $expenseEntity,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_expense_entity_show', methods: ['GET'])]
    public function show(ExpenseEntity $expenseEntity): Response
    {
        return $this->render('expense_entity/show.html.twig', [
            'expense_entity' => $expenseEntity,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_expense_entity_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, ExpenseEntity $expenseEntity, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(ExpenseEntityType::class, $expenseEntity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_expense_entity_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('expense_entity/edit.html.twig', [
            'expense_entity' => $expenseEntity,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_expense_entity_delete', methods: ['POST'])]
    public function delete(Request $request, ExpenseEntity $expenseEntity, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$expenseEntity->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($expenseEntity);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_expense_entity_index', [], Response::HTTP_SEE_OTHER);
    }
}
