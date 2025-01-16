<?php

namespace App\Entity;

interface UserRelatedEntityInterface
{
    public function getUserEntity(): ?UserEntity;

    public function getUserProfileEntity(): ?UserProfileEntity;
}
