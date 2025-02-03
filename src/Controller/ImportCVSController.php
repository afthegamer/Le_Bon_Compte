<?php

namespace App\Controller;

use App\Entity\CategoryEntity;
use App\Entity\ExpenseEntity;
use App\Entity\IncomeEntity;
use App\Entity\SubcategoryEntity;
use App\Entity\UserProfileEntity;
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
        $mapping = json_decode($request->get('mapping'), true);
        $profileId = $request->request->get('profile_id'); // Récupération de l'ID du profil utilisateur

        if ($csvFile === null || !$csvFile->isValid()) {
            return $this->json(['error' => 'Fichier CSV invalide'], Response::HTTP_BAD_REQUEST);
        }

        if (!$mapping || !is_array($mapping)) {
            return $this->json(['error' => 'Mappage des colonnes manquant ou invalide'], Response::HTTP_BAD_REQUEST);
        }

        // Récupérer le profil utilisateur sélectionné
        $profile = $entityManager->getRepository(UserProfileEntity::class)->find($profileId);
        if (!$profile || $profile->getUserEntity() !== $this->getUser()) {
            return $this->json(['error' => 'Profil utilisateur invalide'], Response::HTTP_BAD_REQUEST);
        }

        $formattedData = [];
        $invalidRows = [];
        $headers = null;

        // Lire le contenu et forcer l'encodage en UTF-8
        $csvContent = file_get_contents($csvFile->getPathname());
        if (!mb_check_encoding($csvContent, 'UTF-8')) {
            $csvContent = mb_convert_encoding($csvContent, 'UTF-8', 'ISO-8859-1');
            file_put_contents($csvFile->getPathname(), $csvContent);
        }

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
                        $this->processRow($entityManager, $mapping, $correctedRow, $formattedData, $profile);
                    } else {
                        $invalidRows[] = [
                            'row' => $rowNumber,
                            'data' => $row,
                        ];
                    }
                    continue;
                }

                $this->processRow($entityManager, $mapping, array_combine($headers, $row), $formattedData, $profile);
            }

            fclose($handle);
        }

        $entityManager->flush();

        // Compter le nombre de lignes importées et invalides
        $importedCount = count($formattedData);
        $invalidCount = count($invalidRows);

        // Construire le message flash
        if ($invalidCount > 0) {
            $this->addFlash('warning', "Importation partielle : {$importedCount} lignes enregistrées, {$invalidCount} lignes invalides.");
        } elseif ($importedCount > 0) {
            $this->addFlash('success', "Importation réussie ! {$importedCount} lignes ont été enregistrées.");
        } else {
            $this->addFlash('error', "Échec de l'importation. Aucun enregistrement valide.");
        }

        // Rediriger vers la page d'accueil
        return $this->redirectToRoute('app_home_index');

    }

    private function processRow(
        EntityManagerInterface $entityManager,
        array $mapping,
        array $row,
        array &$formattedData,
        UserProfileEntity $profile
    ): void {
        $user = $this->getUser();
        $mappedRow = $this->mapRowToEntities($mapping, $row);

        $date = !empty($mappedRow['Date']) ? \DateTime::createFromFormat('d/m/Y', $mappedRow['Date']) : null;

        $categoryEntity = null;
        if (!empty($mappedRow['CategoryEntity'])) {
            $categoryEntity = $entityManager->getRepository(CategoryEntity::class)->findOneBy([
                'name' => $mappedRow['CategoryEntity'],
                'userEntity' => $user,
            ]);

            if (!$categoryEntity) {
                $categoryEntity = new CategoryEntity();
                $categoryEntity->setName($mappedRow['CategoryEntity']);
                $categoryEntity->setUserEntity($user);
                $entityManager->persist($categoryEntity);
                $entityManager->flush();
            }
        }

        $subcategoryEntity = null;
        if (!empty($mappedRow['SubcategoryEntity'])) {
            $subcategoryEntity = $entityManager->getRepository(SubcategoryEntity::class)->findOneBy([
                'name' => $mappedRow['SubcategoryEntity'],
                'categoryEntity' => $categoryEntity,
            ]);

            if (!$subcategoryEntity) {
                $subcategoryEntity = new SubcategoryEntity();
                $subcategoryEntity->setName($mappedRow['SubcategoryEntity']);
                $subcategoryEntity->setCategoryEntity($categoryEntity);
                $entityManager->persist($subcategoryEntity);
                $entityManager->flush();
            }
        }

        if (!empty($mappedRow['ExpenseEntity'])) {
            // Convertir en float et multiplier par 100 pour stocker en centimes
            $amount = (float) str_replace(',', '.', $mappedRow['ExpenseEntity']);

            $expense = new ExpenseEntity();
            $expense->setDate($date);
            $expense->setName($mappedRow['Name']);
            $expense->setType($mappedRow['Type']);
            $expense->setCategoryEntity($categoryEntity);
            $expense->setSubcategoryEntity($subcategoryEntity);
            $expense->setAmount($amount);
            $expense->setUserEntity($user);
            $expense->setUserProfileEntity($profile);

            $entityManager->persist($expense);
            $formattedData[] = $mappedRow;
        }

        if (!empty($mappedRow['IncomeEntity'])) {
            $amount = (float) str_replace(',', '.', $mappedRow['IncomeEntity']);

            $income = new IncomeEntity();
            $income->setDate($date);
            $income->setName($mappedRow['Name']);
            $income->setType($mappedRow['Type']);
            $income->setCategoryEntity($categoryEntity);
            $income->setSubcategoryEntity($subcategoryEntity);
            $income->setAmount($amount);
            $income->setUserEntity($user);
            $income->setUserProfileEntity($profile);
            $entityManager->persist($income);
            $formattedData[] = $mappedRow;
        }
    }

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

        $userProfiles = $user->getUserProfileEntities()->toArray();

        return $this->render('import_cvs/index.html.twig', [
            'controller_name' => 'ImportCVSController',
            'userProfiles' => $userProfiles,
        ]);
    }
}
