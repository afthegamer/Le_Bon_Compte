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

    public function filterTransactions(array $filters, int $limit = null): array
    {
        $qb = $this->createQueryBuilder('t')
            ->where('t.userEntity = :user')
            ->setParameter('user', $filters['userId']);

        if (!empty($filters['startDate'])) {
            $qb->andWhere('t.date >= :startDate')
                ->setParameter('startDate', $filters['startDate']);
        }

        if (!empty($filters['endDate'])) {
            $qb->andWhere('t.date <= :endDate')
                ->setParameter('endDate', $filters['endDate']);
        }

        if (!empty($filters['category'])) {
            $qb->join('t.categoryEntity', 'c') // Assure-toi que le nom est correct dans l'entité
            ->andWhere('c.name = :category')
                ->setParameter('category', $filters['category']);
        }

        if (!empty($filters['subcategory'])) {
            $qb->join('t.subcategoryEntity', 's') // Utilisation du bon champ
            ->andWhere('s.name = :subcategory')
                ->setParameter('subcategory', $filters['subcategory']);
        }

        if (!empty($filters['transactionType'])) {
            $qb->andWhere('t.type = :transactionType')
                ->setParameter('transactionType', $filters['transactionType']);
        }

        if (!empty($filters['minAmount'])) {
            $qb->andWhere('t.amount >= :minAmount')
                ->setParameter('minAmount', $filters['minAmount']);
        }

        if (!empty($filters['maxAmount'])) {
            $qb->andWhere('t.amount <= :maxAmount')
                ->setParameter('maxAmount', $filters['maxAmount']);
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

}
