<?php

namespace App\Controller;

use App\Entity\Income;
use App\Form\CsvImportType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ImportController extends AbstractController
{
    #[Route('/import', name: 'import_csv')]
    public function importCsv(Request $request, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(CsvImportType::class);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $csvFile = $form->get('csv_file')->getData();
            $user = $this->getUser(); // Récupère l'utilisateur connecté

            if ($csvFile) {
                $filename = uniqid() . '.' . $csvFile->guessExtension();

                try {
                    $csvFile->move(
                        $this->getParameter('csv_directory'), // Assure-toi que ce répertoire est défini dans config/services.yaml
                        $filename
                    );

                    $filePath = $this->getParameter('csv_directory') . '/' . $filename;

                    $this->processCsvFile($filePath, $user, $entityManager);

                    $this->addFlash('success', 'Importation réussie.');

                } catch (FileException $e) {
                    $this->addFlash('error', 'Erreur lors du téléchargement du fichier.');
                }
            }
        }

        return $this->render('import/import.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    private function processCsvFile(string $filePath, $user, EntityManagerInterface $entityManager): void
    {
        if (($handle = fopen($filePath, 'r')) !== false) {
            $header = fgetcsv($handle, 1000, ',');
            while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                $income = new Income();
                $income->setName($data[0]);
                $income->setAmount((int)$data[1]);
                $income->setDate(new \DateTimeImmutable($data[2]));
                $income->setRelatedUser($user); // Associer l'utilisateur connecté à l'entité Income

                $entityManager->persist($income);
            }
            fclose($handle);
            $entityManager->flush();
        }
    }
}
