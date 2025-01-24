<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ImportCVSController extends AbstractController
{
    #[Route('/upload-csv', name: 'upload_csv')]
    public function uploadCsv(Request $request): Response
    {
        $csvFile = $request->files->get('csv_file');

        if ($csvFile === null || !$csvFile->isValid()) {
            return $this->json(['error' => 'Fichier CSV invalide'], Response::HTTP_BAD_REQUEST);
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
                        $formattedData[] = $correctedRow;
                    } else {
                        $invalidRows[] = [
                            'row' => $rowNumber,
                            'data' => $row
                        ];
                    }
                    continue;
                }

                $formattedData[] = $this->formatRow(array_combine($headers, $row));
            }

            fclose($handle);
        }

        return $this->json([
            'status' => 'success',
            'data' => $formattedData,
            'invalidRows' => $invalidRows
        ]);
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

        // Retourner le séparateur avec le plus grand nombre d'occurrences
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

            return count($correctedRow) === count($headers) ? $this->formatRow(array_combine($headers, $correctedRow)) : null;
        }

        return null;
    }

    /**
     * Formate une ligne en structurant les données et en les nettoyant.
     */
    private function formatRow(array $row): array
    {
        return [
            'Date de comptabilisation' => !empty($row['Date de comptabilisation']) ? $row['Date de comptabilisation'] : null,
            'Libelle simplifie' => !empty($row['Libelle simplifie']) ? $row['Libelle simplifie'] : null,
            'Libelle operation' => !empty($row['Libelle operation']) ? $row['Libelle operation'] : null,
            'Reference' => !empty($row['Reference']) ? $row['Reference'] : null,
            'Informations complementaires' => !empty($row['Informations complementaires']) ? $row['Informations complementaires'] : null,
            'Type operation' => !empty($row['Type operation']) ? $row['Type operation'] : null,
            'Categorie' => !empty($row['Categorie']) ? $row['Categorie'] : null,
            'Sous categorie' => !empty($row['Sous categorie']) ? $row['Sous categorie'] : null,
            'Debit' => isset($row['Debit']) && $row['Debit'] !== '' ? (int)(str_replace(',', '.', $row['Debit']) * 100) : null,
            'Credit' => isset($row['Credit']) && $row['Credit'] !== '' ? (int)(str_replace(',', '.', $row['Credit']) * 100) : null,
        ];
    }
    #[Route('/csv', name: 'import_cvs', methods: ['GET']) ]
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
