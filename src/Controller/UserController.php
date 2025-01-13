<?php

namespace App\Controller;

use App\Entity\UserEntity;
use App\Form\UserEntityType;
use App\Repository\UserEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/user')]
final class UserController extends AbstractController
{
    #[Route(name: 'app_user_index', methods: ['GET'])]
    public function index(UserEntityRepository $userEntityRepository): Response
    {
        return $this->render('user/index.html.twig', [
            'user_entities' => $userEntityRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_user_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $userEntity = new UserEntity();
        $form = $this->createForm(UserEntityType::class, $userEntity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($userEntity);
            $entityManager->flush();

            return $this->redirectToRoute('app_user_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('user/new.html.twig', [
            'user_entity' => $userEntity,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_user_show', methods: ['GET'])]
    public function show(UserEntity $userEntity): Response
    {
        return $this->render('user/show.html.twig', [
            'user_entity' => $userEntity,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_user_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, UserEntity $userEntity, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(UserEntityType::class, $userEntity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_user_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('user/edit.html.twig', [
            'user_entity' => $userEntity,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_user_delete', methods: ['POST'])]
    public function delete(Request $request, UserEntity $userEntity, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$userEntity->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($userEntity);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_user_index', [], Response::HTTP_SEE_OTHER);
    }

}
