<?php

namespace App\Controller;

use App\Entity\UserEntity;
use App\Form\UserEntityType;
use App\Repository\UserEntityRepository;
use App\Service\UserProfileService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/user')]
final class UserController extends AbstractController
{
    #[Route(name: 'app_user_index', methods: ['GET'])]
    #[isGranted('ROLE_ADMIN')]
    public function index(UserEntityRepository $userEntityRepository): Response
    {
        return $this->render('user/index.html.twig', [
            'user_entities' => $userEntityRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_user_new', methods: ['GET', 'POST'])]
    #[isGranted('ROLE_ADMIN')]
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
    #[isGranted('ROLE_ADMIN')]
    public function show(UserEntity $userEntity): Response
    {
        return $this->render('user/show.html.twig', [
            'user_entity' => $userEntity,
        ]);
    }

    #[Route('/user/edit', name: 'app_user_edit', methods: ['GET', 'POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function editUser(Request $request,
                             EntityManagerInterface $entityManager,
                             UserPasswordHasherInterface $userPasswordHasher,
    ): Response
    {
        /** @var UserEntity $user */
        $user = $this->getUser(); // Récupérer l'utilisateur connecté

        $form = $this->createForm(UserEntityType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {

            if ($form->get('plainPassword')->getData()) {
                $plainPassword = $form->get('plainPassword')->getData();
                $user->setPassword($userPasswordHasher->hashPassword($user, $plainPassword));
            }
            $userProfileService = new UserProfileService($entityManager);
//            dd($user->getId());
            $userProfileService->updateProfile($form->get('firstName')->getData(), $form->get('lastName')->getData(), $user->getId());

            $entityManager->persist($user);
            $entityManager->flush();

            $this->addFlash('success', 'Votre compte a été mis à jour.');
            return $this->redirectToRoute('app_home_index');
        }

        return $this->render('user/edit.html.twig', [
            'form' => $form->createView(),
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
