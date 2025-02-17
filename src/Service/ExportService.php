<?php

namespace App\Service;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportService
{
    /**
     * Formate les données pour l'export.
     * Pour chaque ligne, convertit :
     * - Les dates (objet DateTime) en chaîne au format 'Y-m-d H:i:s'
     * - Les champs issus des jointures (categoryEntity, subcategoryEntity, userProfileEntity)
     *   en valeurs lisibles (par exemple, le nom de la catégorie, ou le prénom + nom pour le profil utilisateur).
     *
     * @param array $data Les données brutes (résultat de la requête DQL)
     * @return array Les données formatées pour l'export
     */
    private function formatDataForExport(array $data): array
    {
        return array_map(function ($row) {
            // Formatage de la date
            if (isset($row['date']) && $row['date'] instanceof \DateTime) {
                $row['date'] = $row['date']->format('Y-m-d H:i:s');
            }

            // Formatage du champ categoryEntity
            if (isset($row['categoryEntity'])) {
                // Si c'est un tableau (résultat de join) et qu'il contient un champ 'name'
                if (is_array($row['categoryEntity'])) {
                    if (isset($row['categoryEntity']['name'])) {
                        $row['categoryEntity'] = $row['categoryEntity']['name'];
                    } else {
                        // Si c'est un tableau d'éléments (parfois plusieurs), on les concatène
                        $row['categoryEntity'] = implode(', ', array_map(function ($cat) {
                            return isset($cat['name']) ? $cat['name'] : (is_scalar($cat) ? $cat : '');
                        }, $row['categoryEntity']));
                    }
                }
            }

            // Formatage du champ subcategoryEntity
            if (isset($row['subcategoryEntity'])) {
                if (is_array($row['subcategoryEntity'])) {
                    if (isset($row['subcategoryEntity']['name'])) {
                        $row['subcategoryEntity'] = $row['subcategoryEntity']['name'];
                    } else {
                        $row['subcategoryEntity'] = implode(', ', array_map(function ($subcat) {
                            return isset($subcat['name']) ? $subcat['name'] : (is_scalar($subcat) ? $subcat : '');
                        }, $row['subcategoryEntity']));
                    }
                }
            }

            // Formatage du champ userProfileEntity
            if (isset($row['userProfileEntity'])) {
                if (is_array($row['userProfileEntity'])) {
                    if (isset($row['userProfileEntity']['first_name'], $row['userProfileEntity']['last_name'])) {
                        $row['userProfileEntity'] = $row['userProfileEntity']['first_name'] . ' ' . $row['userProfileEntity']['last_name'];
                    } else {
                        $row['userProfileEntity'] = implode(', ', array_map(function ($profile) {
                            if (is_array($profile) && isset($profile['first_name'], $profile['last_name'])) {
                                return $profile['first_name'] . ' ' . $profile['last_name'];
                            }
                            return is_scalar($profile) ? $profile : '';
                        }, $row['userProfileEntity']));
                    }
                }
            }

            return $row;
        }, $data);
    }

    /**
     * Génère l'export au format demandé (CSV ou Excel).
     *
     * @param array  $data   Les données brutes (issues de la requête)
     * @param string $format Le format d'export ('csv' ou 'xlsx')
     *
     * @return StreamedResponse La réponse qui déclenche le téléchargement
     */
    public function generateExport(array $data, string $format): StreamedResponse
    {
        $formattedData = $this->formatDataForExport($data);

        if ($format === 'csv') {
            return $this->generateCsv($formattedData);
        } elseif ($format === 'xlsx') {
            return $this->generateExcel($formattedData);
        }

        throw new \InvalidArgumentException("Format d'export non supporté");
    }

    /**
     * Génère un fichier CSV à partir des données formatées.
     *
     * @param array $data Les données formatées pour l'export
     * @return StreamedResponse La réponse CSV
     */
    private function generateCsv(array $data): StreamedResponse
    {
        $response = new StreamedResponse(function () use ($data) {
            $output = fopen('php://output', 'w');
            // Écrire les en-têtes à partir des clés du premier élément
            fputcsv($output, array_keys($data[0]));
            foreach ($data as $row) {
                fputcsv($output, $row);
            }
            fclose($output);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="export.csv"');

        return $response;
    }

    /**
     * Génère un fichier Excel (XLSX) à partir des données formatées.
     *
     * @param array $data Les données formatées pour l'export
     * @return StreamedResponse La réponse Excel
     */
    private function generateExcel(array $data): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        // La première ligne correspond aux en-têtes
        $sheet->fromArray(array_merge([array_keys($data[0])], $data));

        $response = new StreamedResponse(function () use ($spreadsheet) {
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $writer->save('php://output');
        });

        $response->headers->set(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        $response->headers->set('Content-Disposition', 'attachment; filename="export.xlsx"');

        return $response;
    }
}
