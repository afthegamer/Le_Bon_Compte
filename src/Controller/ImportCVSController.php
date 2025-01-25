<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Filesystem\Filesystem;

class ImportCVSController extends AbstractController
{
    #[Route('/upload-csv', name: 'upload_csv', methods: ['POST'])]
    public function uploadCsv(Request $request): Response
    {
        //dd($request->files->get('csv_file'));
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
                        $formattedData[] = $this->mapRowToEntities($mapping, $correctedRow);
                    } else {
                        $invalidRows[] = [
                            'row' => $rowNumber,
                            'data' => $row
                        ];
                    }
                    continue;
                }

                $formattedData[] = $this->mapRowToEntities($mapping, array_combine($headers, $row));
            }

            fclose($handle);
        }

        // Exemple : Sauvegarder les données traitées dans la base de données ici

        return $this->json([
            'status' => 'success',
            'data' => $formattedData,
            'invalidRows' => $invalidRows
        ]);
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
//        $user->$this->getUserEntity();
//        dd($user);
        if ($user === null) {
            return $this->redirectToRoute('app_login');
        }
        return $this->render('import_cvs/index.html.twig', [
            'controller_name' => 'ImportCVSController',
        ]);
    }
}
