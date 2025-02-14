<?php

namespace App\Repository;

use App\Entity\CategoryEntity;
use App\Entity\UserEntity;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CategoryEntity>
 */
class CategoryEntityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CategoryEntity::class);
    }


    public function findByUser(UserEntity $user): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.userEntity = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }
}
