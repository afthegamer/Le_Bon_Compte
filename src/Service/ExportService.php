<?php
namespace App\Service;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportService
{
    private function formatDataForExport(array $data): array
    {
        return array_map(function ($row) {
            if (isset($row['date']) && $row['date'] instanceof \DateTime) {
                $row['date'] = $row['date']->format('Y-m-d H:i:s');
            }
            return $row;
        }, $data);
    }

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

    private function generateCsv(array $data): StreamedResponse
    {
        $response = new StreamedResponse(function () use ($data) {
            $output = fopen('php://output', 'w');
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

    private function generateExcel(array $data): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->fromArray(array_merge([array_keys($data[0])], $data));

        $response = new StreamedResponse(function () use ($spreadsheet) {
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $writer->save('php://output');
        });

        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment; filename="export.xlsx"');

        return $response;
    }
}
