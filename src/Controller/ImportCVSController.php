<?php

namespace App\Controller;

use App\Entity\CategoryEntity;
use App\Entity\ExpenseEntity;
use App\Entity\IncomeEntity;
use App\Entity\SubcategoryEntity;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ImportCVSController extends AbstractController
{
    #[Route('/upload-csv', name: 'upload_csv', methods: ['POST'])]
    public function uploadCsv(Request $request, EntityManagerInterface $entityManager): Response
    {
        $csvFile = $request->files->get('csv_file');
        $mapping = json_decode($request->get('mapping'), true); // Récupération du mappage

        if ($csvFile === null || !$csvFile->isValid()) {
            return $this->json(['error' => 'Fichier CSV invalide'], Response::HTTP_BAD_REQUEST);
        }

        if (!$mapping || !is_array($mapping)) {
            return $this->json(['error' => 'Mappage des colonnes manquant ou invalide'], Response::HTTP_BAD_REQUEST);
        }

        $formattedData = [];
        $invalidRows = [];
        $headers = null;

        // Détection du séparateur
        $separator = $this->detectSeparator($csvFile->getPathname());

        if (($handle = fopen($csvFile->getPathname(), 'r')) !== false) {
            $rowNumber = 0;
            while (($row = fgetcsv($handle, 1000, $separator)) !== false) {
                $rowNumber++;

                if ($rowNumber === 1) {
                    $headers = $row;
                    continue;
                }

                if (count($row) !== count($headers)) {
                    $correctedRow = $this->correctRow($headers, $row);
                    if ($correctedRow) {
                        $this->processRow($entityManager, $mapping, $correctedRow, $formattedData);
                    } else {
                        $invalidRows[] = [
                            'row' => $rowNumber,
                            'data' => $row
                        ];
                    }
                    continue;
                }

                $this->processRow($entityManager, $mapping, array_combine($headers, $row), $formattedData);
            }

            fclose($handle);
        }

        $entityManager->flush();

        return $this->json([
            'status' => 'success',
            'importedRows' => count($formattedData),
            'invalidRows' => $invalidRows
        ]);
    }

    private function processRow(EntityManagerInterface $entityManager, array $mapping, array $row, array &$formattedData): void
    {
        $mappedRow = $this->mapRowToEntities($mapping, $row);

        // Reformater la date
        $date = !empty($mappedRow['Date']) ? \DateTime::createFromFormat('d/m/Y', $mappedRow['Date']) : null;

        // Rechercher ou créer une catégorie unique
        $categoryEntity = null;
        if (!empty($mappedRow['CategoryEntity'])) {
            $categoryRepository = $entityManager->getRepository(CategoryEntity::class);
            $categoryEntity = $categoryRepository->findOneBy(['name' => $mappedRow['CategoryEntity']]);

            if (!$categoryEntity) {
                $categoryEntity = new CategoryEntity();
                $categoryEntity->setName($mappedRow['CategoryEntity']);
                $entityManager->persist($categoryEntity);
                $entityManager->flush(); // Sauvegarder immédiatement pour éviter des doublons
            }
        }

        // Rechercher ou créer une sous-catégorie unique associée à la catégorie
        $subcategoryEntity = null;
        if (!empty($mappedRow['SubcategoryEntity'])) {
            $subcategoryRepository = $entityManager->getRepository(SubcategoryEntity::class);
            $subcategoryEntity = $subcategoryRepository->findOneBy([
                'name' => $mappedRow['SubcategoryEntity'],
                'categoryEntity' => $categoryEntity
            ]);

            if (!$subcategoryEntity) {
                $subcategoryEntity = new SubcategoryEntity();
                $subcategoryEntity->setName($mappedRow['SubcategoryEntity']);
                $subcategoryEntity->setCategoryEntity($categoryEntity);
                $entityManager->persist($subcategoryEntity);
                $entityManager->flush(); // Sauvegarder immédiatement pour éviter des doublons
            }
        }

        // Si c'est une dépense
        if (!empty($mappedRow['ExpenseEntity'])) {
            $amount = (int)(str_replace(',', '.', $mappedRow['ExpenseEntity']) * 100);

            $expense = new ExpenseEntity();
            $expense->setDate($date);
            $expense->setName($mappedRow['Name']);
            $expense->setType($mappedRow['Type']);
            $expense->setCategoryEntity($categoryEntity);
            $expense->setSubcategoryEntity($subcategoryEntity);
            $expense->setAmount($amount);

            // Associer à l'utilisateur actuel
            $expense->setUserEntity($this->getUser());

            $entityManager->persist($expense);
            $formattedData[] = $mappedRow;
        }

        // Si c'est un revenu
        if (!empty($mappedRow['IncomeEntity'])) {
            $amount = (int)(str_replace(',', '.', $mappedRow['IncomeEntity']) * 100);

            $income = new IncomeEntity();
            $income->setDate($date);
            $income->setName($mappedRow['Name']);
            $income->setType($mappedRow['Type']);
            $income->setCategoryEntity($categoryEntity);
            $income->setSubcategoryEntity($subcategoryEntity);
            $income->setAmount($amount);

            // Associer à l'utilisateur actuel
            $income->setUserEntity($this->getUser());

            $entityManager->persist($income);
            $formattedData[] = $mappedRow;
        }
    }

    /**
     * Mappe une ligne du fichier CSV aux entités définies dans le mappage.
     */
    private function mapRowToEntities(array $mapping, array $row): array
    {
        $mappedData = [];
        foreach ($mapping as $column => $entityField) {
            if (isset($row[$column])) {
                $mappedData[$entityField] = $row[$column];
            }
        }

        return $mappedData;
    }

    /**
     * Détecte automatiquement le séparateur utilisé dans le fichier CSV.
     */
    private function detectSeparator(string $filePath): string
    {
        $separators = [',', ';', '\t'];
        $handle = fopen($filePath, 'r');
        $line = fgets($handle);
        fclose($handle);

        $separatorCounts = [];
        foreach ($separators as $separator) {
            $separatorCounts[$separator] = substr_count($line, $separator);
        }

        return array_search(max($separatorCounts), $separatorCounts);
    }

    /**
     * Tente de corriger une ligne mal formatée.
     */
    private function correctRow(array $headers, array $row): ?array
    {
        if (count($row) > count($headers)) {
            $correctedRow = array_slice($row, 0, count($headers) - 1);
            $correctedRow[] = implode('', array_slice($row, count($headers) - 1));

            return count($correctedRow) === count($headers) ? array_combine($headers, $correctedRow) : null;
        }

        return null;
    }

    #[Route('/csv', name: 'import_csv', methods: ['GET'])]
    public function index(): Response
    {
        $user = $this->getUser();

        if ($user === null) {
            return $this->redirectToRoute('app_login');
        }
        return $this->render('import_cvs/index.html.twig', [
            'controller_name' => 'ImportCVSController',
        ]);
    }
}
