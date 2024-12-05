<?php

namespace App\Controller;

use App\Repository\ExpenseRepository;
use App\Repository\IncomeRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home_index', methods: ['GET'])]
    public function index(
        IncomeRepository $incomeRepository,
        ExpenseRepository $expenseRepository,
        UrlGeneratorInterface $urlGenerator // Injection du générateur d'URL
    ): Response
    {
        // Récupère les revenus et dépenses triés par date
        $incomes = $incomeRepository->findAllByDateAsc();
        $expenses = $expenseRepository->findAllByDateAsc();

        // Combine les listes en normalisant les données
        $combinedList = [];

        foreach ($incomes as $income) {
            $combinedList[] = [
                'type' => 'income',
                'id' => 'income-' . $income->getId(),
                'name' => $income->getName(),
                'amount' => $income->getAmount(),
                'date' => $income->getDate()->format('Y-m-d H:i:s'), // Assurez-vous que c'est un objet DateTime
                'showUrl' => $urlGenerator->generate('app_income_show', ['id' => $income->getId()]),
                'editUrl' => $urlGenerator->generate('app_income_edit', ['id' => $income->getId()])
            ];
        }

        foreach ($expenses as $expense) {
            $combinedList[] = [
                'type' => 'expense',
                'id' => 'expense-' . $expense->getId(),
                'name' => $expense->getName(),
                'amount' => $expense->getAmount(),
                'date' => $expense->getDate()->format('Y-m-d H:i:s'), // Assurez-vous que c'est un objet DateTime
                'showUrl' => $urlGenerator->generate('app_expense_show', ['id' => $expense->getId()]),
                'editUrl' => $urlGenerator->generate('app_expense_edit', ['id' => $expense->getId()])
            ];
        }

        // Trier par date en utilisant usort
        usort($combinedList, function($a, $b) {
            return $b['date'] <=> $a['date']; // Comparaison d'objets DateTime
        });

        // Passez $combinedList à la vue
        return $this->render('home/index.html.twig', [
            'combinedList' => $combinedList
        ]);
    }
}
