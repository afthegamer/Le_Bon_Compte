<?php

namespace App\Controller;

use App\Entity\UserProfileEntity;
use App\Form\UserProfileEntityType;
use App\Repository\UserProfileEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/user_profile')]
final class UserProfileEntityController extends AbstractController
{
    #[Route(name: 'app_user_profile_entity_index', methods: ['GET'])]
    public function index(UserProfileEntityRepository $userProfileEntityRepository): Response
    {
        $user=$this->getUser();
        $userProfile=$userProfileEntityRepository->findAllByUser($user);
        return $this->render('user_profile_entity/index.html.twig', [
            'user_profile_entities' => $userProfile,
        ]);
    }

    #[Route('/new', name: 'app_user_profile_entity_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $userProfileEntity = new UserProfileEntity();
        $form = $this->createForm(UserProfileEntityType::class, $userProfileEntity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $userProfileEntity->setUserEntity($this->getUser());
            $entityManager->persist($userProfileEntity);
            $entityManager->flush();

            return $this->redirectToRoute('app_user_profile_entity_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('user_profile_entity/new.html.twig', [
            'user_profile_entity' => $userProfileEntity,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_user_profile_entity_show', methods: ['GET'])]
    public function show(UserProfileEntity $userProfileEntity,
                         RequestStack $requestStack): Response
    {
        if ($userProfileEntity->getUserEntity() !== $this->getUser()) {
            $request = $requestStack->getCurrentRequest();
            $referer = $request->headers->get('referer');

            if ($referer) {
                // Redirige vers la page précédente si disponible
                return $this->redirect($referer);
            }

            // Sinon, redirige vers une route par défaut
            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }
        return $this->render('user_profile_entity/show.html.twig', [
            'user_profile_entity' => $userProfileEntity,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_user_profile_entity_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request,
                         UserProfileEntity $userProfileEntity,
                         EntityManagerInterface $entityManager,
                         RequestStack $requestStack): Response
    {
        if ($userProfileEntity->getUserEntity() !== $this->getUser()) {
            $request = $requestStack->getCurrentRequest();
            $referer = $request->headers->get('referer');

            if ($referer) {
                // Redirige vers la page précédente si disponible
                return $this->redirect($referer);
            }

            // Sinon, redirige vers une route par défaut
            return $this->redirectToRoute('app_home_index', [], Response::HTTP_SEE_OTHER);
        }
        $form = $this->createForm(UserProfileEntityType::class, $userProfileEntity);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_user_profile_entity_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('user_profile_entity/edit.html.twig', [
            'user_profile_entity' => $userProfileEntity,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_user_profile_entity_delete', methods: ['POST'])]
    public function delete(Request $request, UserProfileEntity $userProfileEntity, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$userProfileEntity->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($userProfileEntity);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_user_profile_entity_index', [], Response::HTTP_SEE_OTHER);
    }
}
