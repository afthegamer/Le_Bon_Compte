<?php

namespace App\Controller;

use App\Entity\Income;
use App\Form\IncomeType;
use App\Repository\IncomeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/income')]
final class IncomeController extends AbstractController
{
    #[Route(name: 'app_income_index', methods: ['GET'])]
    public function index(IncomeRepository $incomeRepository): Response
    {
        return $this->render('income/index.html.twig', [
            'incomes' => $incomeRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_income_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $income = new Income();
        $form = $this->createForm(IncomeType::class, $income);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($income);
            $entityManager->flush();

            return $this->redirectToRoute('app_income_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('income/new.html.twig', [
            'income' => $income,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_income_show', methods: ['GET'])]
    public function show(Income $income): Response
    {
        return $this->render('income/show.html.twig', [
            'income' => $income,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_income_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Income $income, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(IncomeType::class, $income);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_income_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('income/edit.html.twig', [
            'income' => $income,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_income_delete', methods: ['POST'])]
    public function delete(Request $request, Income $income, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$income->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($income);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_income_index', [], Response::HTTP_SEE_OTHER);
    }
}
