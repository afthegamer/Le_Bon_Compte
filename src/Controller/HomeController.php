<?php

namespace App\Controller;

use App\Entity\UserEntity;
use App\Form\UserEntityType;
use App\Repository\ExpenseEntityRepository;
use App\Repository\IncomeEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home_index', methods: ['GET'])]
    public function index(
        IncomeEntityRepository $incomeRepository,
        ExpenseEntityRepository $expenseRepository,
        UrlGeneratorInterface $urlGenerator,
        CsrfTokenManagerInterface $csrfTokenManager
    ): Response
    {
        // Récupérer l'utilisateur connecté
        $user = $this->getUser();
        if (!$user) {
            throw $this->createAccessDeniedException('Vous devez être connecté pour accéder à cette page.');
        }

        // Récupérer les revenus et dépenses liés à cet utilisateur
        $incomes = $incomeRepository->findAllByUser($user);
        $expenses = $expenseRepository->findAllByUser($user);

        // Combiner et normaliser les données
        $combinedList = [];
        foreach ($incomes as $income) {
            $combinedList[] = [
                'type' => 'income',
                'id' => 'income-' . $income->getId(),
                'name' => $income->getName(),
                'amount' => $income->getAmount(),
                'date' => $income->getDate()->format('Y-m-d H:i:s'),
                'userProfileEntity' => $income->getUserProfileEntity()->getFirstName() . ' ' . $income->getUserProfileEntity()->getLastName(),
                'category' => $income->getCategoryEntity()?$income->getCategoryEntity()->getName():'Autre',
                'showUrl' => $urlGenerator->generate('app_income_entity_show', ['id' => $income->getId()]),
                'editUrl' => $urlGenerator->generate('app_income_entity_edit', ['id' => $income->getId()]),
                'deleteUrl' => $urlGenerator->generate('app_income_entity_delete', ['id' => $income->getId()]),
                'csrfToken' => $csrfTokenManager->getToken('delete' . $income->getId())->getValue(),
            ];
        }
        foreach ($expenses as $expense) {
            $combinedList[] = [
                'type' => 'expense',
                'id' => 'expense-' . $expense->getId(),
                'name' => $expense->getName(),
                'amount' => $expense->getAmount(),
                'date' => $expense->getDate()->format('Y-m-d H:i:s'),
                'userProfileEntity' => $expense->getUserProfileEntity()->getFirstName() . ' ' . $expense->getUserProfileEntity()->getLastName(),
                'category' => $expense->getCategoryEntity()?$expense->getCategoryEntity()->getName():'Autre',
                'showUrl' => $urlGenerator->generate('app_expense_entity_show', ['id' => $expense->getId()]),
                'editUrl' => $urlGenerator->generate('app_expense_entity_edit', ['id' => $expense->getId()]),
                'deleteUrl' => $urlGenerator->generate('app_expense_entity_delete', ['id' => $expense->getId()]),
                'csrfToken' => $csrfTokenManager->getToken('delete' . $expense->getId())->getValue(),
            ];
        }

        // Trier par date
        usort($combinedList, fn($a, $b) => $b['date'] <=> $a['date']);

        // Passez la liste triée à la vue
        return $this->render('home/index.html.twig', [
            'combinedList' => $combinedList,
        ]);
    }

}
