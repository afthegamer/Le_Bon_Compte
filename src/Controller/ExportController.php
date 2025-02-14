<?php

namespace App\Controller;

use App\Service\ExportService;
use App\Repository\IncomeEntityRepository;
use App\Repository\ExpenseEntityRepository;
use App\Service\CategoryService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ExportController extends AbstractController
{
    private ExportService $exportService;
    private IncomeEntityRepository $incomeEntityRepository;
    private ExpenseEntityRepository $expenseEntityRepository;
    private CategoryService $categoryService;

    public function __construct(
        ExportService           $exportService,
        IncomeEntityRepository  $incomeEntityRepository,
        ExpenseEntityRepository $expenseEntityRepository,
        CategoryService         $categoryService
    )
    {
        $this->exportService = $exportService;
        $this->incomeEntityRepository = $incomeEntityRepository;
        $this->expenseEntityRepository = $expenseEntityRepository;
        $this->categoryService = $categoryService;
    }

    #[Route('/export', name: 'export_csv')]
    public function index(): Response
    {
        $user = $this->getUser();
        if (!$user) {
            throw $this->createAccessDeniedException('Vous devez être connecté pour accéder à cette page.');
        }

        /** @var \App\Entity\UserEntity $user */
        $categories = $this->categoryService->getMergedCategories($user);

        return $this->render('export/index.html.twig', [
            'categories' => $categories,
        ]);
    }

    #[Route('/api/export', name: 'export_generate', methods: ['POST'])]
    public function export(Request $request): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $filters = json_decode($request->getContent(), true);
        if (!$filters) {
            return $this->json(['error' => 'Filtres invalides'], Response::HTTP_BAD_REQUEST);
        }

        $filters['userId'] = $user->getId();
        $format = $filters['format'] ?? 'csv';

        try {
            switch ($filters['transactionType']) {
                case 'income':
                    $data = $this->incomeEntityRepository->filterTransactions($filters);
                    break;
                case 'expense':
                    $data = $this->expenseEntityRepository->filterTransactions($filters);
                    break;
                default:
                    $incomes = $this->incomeEntityRepository->filterTransactions($filters);
                    $expenses = $this->expenseEntityRepository->filterTransactions($filters);
                    $data = array_merge($incomes, $expenses);
                    break;
            }

            if (empty($data)) {
                return $this->json(['error' => 'Aucune donnée à exporter'], Response::HTTP_NO_CONTENT);
            }

            return $this->exportService->generateExport($data, $format);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de l\'export : ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/export/preview', name: 'export_preview', methods: ['POST'])]
    public function preview(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $filters = json_decode($request->getContent(), true);
        if (!$filters) {
            return $this->json(['error' => 'Filtres invalides'], Response::HTTP_BAD_REQUEST);
        }

        $filters['userId'] = $user->getId();

        try {
            switch ($filters['transactionType']) {
                case 'income':
                    $data = $this->incomeEntityRepository->filterTransactions($filters);
                    break;
                case 'expense':
                    $data = $this->expenseEntityRepository->filterTransactions($filters);
                    break;
                default:
                    $incomes = $this->incomeEntityRepository->filterTransactions($filters);
                    $expenses = $this->expenseEntityRepository->filterTransactions($filters);
                    $data = array_merge($incomes, $expenses);
                    break;
            }

            // Sorting transactions by decreasing date
            usort($data, function ($a, $b) {
                $dateA = $a['date'] instanceof \DateTime ? $a['date']->format('Y-m-d H:i:s') : $a['date'];
                $dateB = $b['date'] instanceof \DateTime ? $b['date']->format('Y-m-d H:i:s') : $b['date'];
                return strtotime($dateB) - strtotime($dateA);
            });

            return $this->json(array_slice($data, 0, 10), Response::HTTP_OK, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

}
