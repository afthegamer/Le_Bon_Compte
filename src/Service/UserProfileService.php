<?php

namespace App\Service;

use App\Entity\UserEntity;
use App\Entity\UserProfileEntity;
use Doctrine\ORM\EntityManagerInterface;

class UserProfileService
{
    private EntityManagerInterface $entityManager;

    public function __construct(
        EntityManagerInterface $entityManager,
    )
    {
        $this->entityManager = $entityManager;
    }

    /**
     * Recover the user profiles for the connected user.
     *
     * @param UserEntity $user The connected user.
     * @return UserProfileEntity[] Profiles associated with this user.
     */
    public function getUserProfiles(UserEntity $user): array
    {
        return $this->entityManager->getRepository(UserProfileEntity::class)
            ->findBy(['userEntity' => $user]);
    }

    public function createFirstProfile(userEntity $user,
                                       string $firstName,
                                       string $lastName,
                                       int $defaultProfileId ): void
    {
        $userProfileEntity = new UserProfileEntity();
        $userProfileEntity->setUserEntity($user);
        $userProfileEntity->setFirstName($firstName);
        $userProfileEntity->setLastName($lastName);
        $userProfileEntity->setDefaultProfileId($defaultProfileId);
        $userProfileEntity->setModifiable(false);
        $this->entityManager->persist($userProfileEntity);
        $this->entityManager->flush();
    }

    public function updateProfile(
        string $firstName,
        string $lastName,
        int $defaultProfileId
    ): void {
        $userProfileEntity = $this->entityManager
            ->getRepository(UserProfileEntity::class)
            ->findOneBy(['defaultProfileId' => $defaultProfileId]);

        if (null === $userProfileEntity) {
            throw new \Exception("Aucun profil trouvé pour default_profile_id {$defaultProfileId}.");
        }

        $userProfileEntity->setFirstName($firstName);
        $userProfileEntity->setLastName($lastName);

        $this->entityManager->flush();
    }
}
