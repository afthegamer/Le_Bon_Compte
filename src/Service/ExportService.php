<?php

namespace App\Service;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportService
{
    private function formatDataForExport(array $data): array
    {
        return array_map(function ($row) {
            // Exclude the "ID" column
            unset($row['id']);

            // Rename transactionName in name
            if (isset($row['transactionName'])) {
                $row['name'] = $row['transactionName'];
                unset($row['transactionName']);
            }

            // Date formatting
            if (isset($row['date'])) {
                if ($row['date'] instanceof \DateTime) {
                    $row['date'] = $row['date']->format('Y-m-d H:i:s');
                } elseif (is_array($row['date']) && isset($row['date']['date'])) {
                    $row['date'] = $row['date']['date'];
                }
            }

            // Champs Categoryenty and Subcategoryenty are already channels

            // Rebuild the name of the user profile from userfivestnam and uselastname
            if (isset($row['userFirstName']) || isset($row['userLastName'])) {
                $firstName = $row['userFirstName'] ?? '';
                $lastName  = $row['userLastName'] ?? '';
                $row['userProfileEntity'] = trim($firstName . ' ' . $lastName);
                unset($row['userFirstName'], $row['userLastName']);
            }

            return $row;
        }, $data);
    }

    /**
     * Generates export to requested format (CSV or Excel).
     *
     * @param array  $data   Raw data from requests
     * @param string $format The format ('CSV' or 'xlsx')
     * @return StreamedResponse The answer for download
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
     * Generates a CSV file from formatted data.
     *
     * @Param array $data formatted data for export
     * @return StreamedResponse the answer CSV
     */
    private function generateCsv(array $data): StreamedResponse
    {
        $response = new StreamedResponse(function () use ($data) {
            $output = fopen('php://output', 'w');
            if (isset($data[0])) {
                fputcsv($output, array_keys($data[0]));
            }
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
     * Generates an Excel file (XLSX) from formatted data.
     *
     * @param array $data Data formatted for export
     * @return StreamedResponse The Excel answer
     */
    private function generateExcel(array $data): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        if (isset($data[0])) {
            $sheet->fromArray(array_merge([array_keys($data[0])], $data));
        } else {
            $sheet->fromArray($data);
        }

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
