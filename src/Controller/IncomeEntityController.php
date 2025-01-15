<?php

namespace App\Controller;

use App\Entity\IncomeEntity;
use App\Form\IncomeEntityType;
use App\Repository\IncomeEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/income/entity')]
final class IncomeEntityController extends AbstractController
{
    #[Route(name: 'app_income_entity_index', methods: ['GET'])]
    public function index(IncomeEntityRepository $incomeEntityRepository): Response
    {
        return $this->render('income_entity/index.html.twig', [
            'income_entities' => $incomeEntityRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_income_entity_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $incomeEntity = new IncomeEntity();
        $form = $this->createForm(IncomeEntityType::class, $incomeEntity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($incomeEntity);
            $entityManager->flush();

            return $this->redirectToRoute('app_income_entity_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('income_entity/new.html.twig', [
            'income_entity' => $incomeEntity,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_income_entity_show', methods: ['GET'])]
    public function show(IncomeEntity $incomeEntity): Response
    {
        return $this->render('income_entity/show.html.twig', [
            'income_entity' => $incomeEntity,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_income_entity_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, IncomeEntity $incomeEntity, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(IncomeEntityType::class, $incomeEntity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_income_entity_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('income_entity/edit.html.twig', [
            'income_entity' => $incomeEntity,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_income_entity_delete', methods: ['POST'])]
    public function delete(Request $request, IncomeEntity $incomeEntity, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$incomeEntity->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($incomeEntity);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_income_entity_index', [], Response::HTTP_SEE_OTHER);
    }
}
