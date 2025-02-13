<?php

namespace App\Repository;

use App\Entity\ExpenseEntity;
use App\Entity\UserEntity;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ExpenseEntity>
 */
class ExpenseEntityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ExpenseEntity::class);
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
        $qb = $this->createQueryBuilder('e');

        if (!empty($filters['userId'])) {
            $qb->andWhere('e.userEntity = :userId')
                ->setParameter('userId', $filters['userId']);
        }

        if (!empty($filters['startDate'])) {
            $qb->andWhere('e.date >= :startDate')
                ->setParameter('startDate', $filters['startDate']);
        }

        if (!empty($filters['endDate'])) {
            $qb->andWhere('e.date <= :endDate')
                ->setParameter('endDate', $filters['endDate']);
        }

        if (!empty($filters['category'])) {
            $qb->andWhere('e.category = :category')
                ->setParameter('category', $filters['category']);
        }

        if (!empty($filters['subcategory'])) {
            $qb->andWhere('e.subcategory = :subcategory')
                ->setParameter('subcategory', $filters['subcategory']);
        }

        if (!empty($filters['minAmount'])) {
            $qb->andWhere('e.amount >= :minAmount')
                ->setParameter('minAmount', $filters['minAmount']);
        }

        if (!empty($filters['maxAmount'])) {
            $qb->andWhere('e.amount <= :maxAmount')
                ->setParameter('maxAmount', $filters['maxAmount']);
        }

        return $qb->setMaxResults($limit)
            ->orderBy('e.date', 'DESC')
            ->getQuery()
            ->getArrayResult();
    }

}
