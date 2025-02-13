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

    public function findAllByUser(UserEntity $user): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.userEntity = :user')
            ->setParameter('user', $user)
            ->orderBy('e.date', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function filterTransactions(array $filters, int $limit = 10): array
    {
        $qb = $this->createQueryBuilder('i');

        if (!empty($filters['userId'])) {
            $qb->andWhere('i.userEntity = :userId')
                ->setParameter('userId', $filters['userId']);
        }

        if (!empty($filters['startDate'])) {
            $qb->andWhere('i.date >= :startDate')
                ->setParameter('startDate', $filters['startDate']);
        }

        if (!empty($filters['endDate'])) {
            $qb->andWhere('i.date <= :endDate')
                ->setParameter('endDate', $filters['endDate']);
        }

        if (!empty($filters['category'])) {
            $qb->andWhere('i.category = :category')
                ->setParameter('category', $filters['category']);
        }

        if (!empty($filters['subcategory'])) {
            $qb->andWhere('i.subcategory = :subcategory')
                ->setParameter('subcategory', $filters['subcategory']);
        }

        if (!empty($filters['minAmount'])) {
            $qb->andWhere('i.amount >= :minAmount')
                ->setParameter('minAmount', $filters['minAmount']);
        }

        if (!empty($filters['maxAmount'])) {
            $qb->andWhere('i.amount <= :maxAmount')
                ->setParameter('maxAmount', $filters['maxAmount']);
        }

        return $qb->setMaxResults($limit)
            ->orderBy('i.date', 'DESC')
            ->getQuery()
            ->getArrayResult();
    }

}
