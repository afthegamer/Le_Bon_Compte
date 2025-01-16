<?php

namespace App\Repository;

use App\Entity\IncomeEntity;
use App\Entity\UserEntity;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<IncomeEntity>
 */
class IncomeEntityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, IncomeEntity::class);
    }

//    /**
//     * @return IncomeEntity[] Returns an array of IncomeEntity objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('i')
//            ->andWhere('i.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('i.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?IncomeEntity
//    {
//        return $this->createQueryBuilder('i')
//            ->andWhere('i.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
    public function findAllByDateAsc(): array
    {
        return $this->createQueryBuilder('i')
            ->orderBy('i.date', 'ASC')
            ->getQuery()
            ->getResult()
            ;
    }
    public function findAllByUserProfile($userProfile)
    {
        return $this->createQueryBuilder('e')
            ->where('e.userProfileEntity = :userProfile')
            ->setParameter('userProfile', $userProfile)
            ->orderBy('e.date', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findAllByUser(UserEntity $user): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.userEntity = :user')
            ->setParameter('user', $user)
            ->orderBy('e.date', 'ASC')
            ->getQuery()
            ->getResult();
    }


}
