<?php

namespace App\Service;

use App\Entity\UserEntity;
use App\Entity\UserProfileEntity;
use Doctrine\ORM\EntityManagerInterface;

class UserProfileService
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * Récupère les profils utilisateur pour l'utilisateur connecté.
     *
     * @param UserEntity $user L'utilisateur connecté.
     * @return UserProfileEntity[] Les profils associés à cet utilisateur.
     */
    public function getUserProfiles(UserEntity $user): array
    {
        return $this->entityManager->getRepository(UserProfileEntity::class)
            ->findBy(['userEntity' => $user]);
    }
}
