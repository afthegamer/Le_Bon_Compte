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


    public function filterTransactions(array $filters, int $limit = null): array
    {
        $qb = $this->createQueryBuilder('t')
            ->select(
                't.id as id',
                't.name as transactionName',
                't.amount as amount',
                't.type as type',
                't.date as date',
                'c.name as categoryEntity',
                's.name as subcategoryEntity',
                'p.firstName as userFirstName',
                'p.lastName as userLastName'
            )
            ->leftJoin('t.categoryEntity', 'c')
            ->leftJoin('t.subcategoryEntity', 's')
            ->leftJoin('t.userProfileEntity', 'p')
            ->where('t.userEntity = :user')
            ->setParameter('user', $filters['userId']);

        // Start date filtering
        if (isset($filters['startDate']) && $filters['startDate'] !== '') {
            if (is_array($filters['startDate'])) {
                $orX = $qb->expr()->orX();
                foreach ($filters['startDate'] as $key => $date) {
                    $paramKey = 'startDate' . $key;
                    $orX->add("t.date >= :$paramKey");
                    $qb->setParameter($paramKey, $date);
                }
                $qb->andWhere($orX);
            } else {
                $qb->andWhere('t.date >= :startDate')
                    ->setParameter('startDate', $filters['startDate']);
            }
        }

        // Filter on the end date
        if (isset($filters['endDate']) && $filters['endDate'] !== '') {
            if (is_array($filters['endDate'])) {
                $orX = $qb->expr()->orX();
                foreach ($filters['endDate'] as $key => $date) {
                    $paramKey = 'endDate' . $key;
                    $orX->add("t.date <= :$paramKey");
                    $qb->setParameter($paramKey, $date);
                }
                $qb->andWhere($orX);
            } else {
                $qb->andWhere('t.date <= :endDate')
                    ->setParameter('endDate', $filters['endDate']);
            }
        }

        // Category filtering
        if (isset($filters['category']) && !empty($filters['category'])) {
            if (is_array($filters['category'])) {
                $qb->andWhere($qb->expr()->in('c.name', ':categories'))
                    ->setParameter('categories', $filters['category']);
            } else {
                $qb->andWhere('c.name = :category')
                    ->setParameter('category', $filters['category']);
            }
        }

        // Sub-Category filtering only if entered and not empty
        if (isset($filters['subcategory'])) {
            if (is_array($filters['subcategory'])) {
                // Filter by removing empty values
                $validSubcategories = array_filter($filters['subcategory'], function($subcat) {
                    return trim($subcat) !== '';
                });
                if (!empty($validSubcategories)) {
                    $qb->andWhere($qb->expr()->in('s.name', ':subcategories'))
                        ->setParameter('subcategories', $validSubcategories);
                }
            } elseif (is_string($filters['subcategory']) && trim($filters['subcategory']) !== '') {
                $qb->andWhere('s.name = :subcategory')
                    ->setParameter('subcategory', trim($filters['subcategory']));
            }
        }

        // Filter by minimum amount
        if (isset($filters['minAmount']) && $filters['minAmount'] !== '') {
            if (is_array($filters['minAmount'])) {
                $orX = $qb->expr()->orX();
                foreach ($filters['minAmount'] as $key => $min) {
                    $paramKey = 'minAmount' . $key;
                    $orX->add("t.amount >= :$paramKey");
                    $qb->setParameter($paramKey, $min);
                }
                $qb->andWhere($orX);
            } else {
                $qb->andWhere('t.amount >= :minAmount')
                    ->setParameter('minAmount', $filters['minAmount']);
            }
        }

        // Filtering by maximum amount
        if (isset($filters['maxAmount']) && $filters['maxAmount'] !== '') {
            if (is_array($filters['maxAmount'])) {
                $orX = $qb->expr()->orX();
                foreach ($filters['maxAmount'] as $key => $max) {
                    $paramKey = 'maxAmount' . $key;
                    $orX->add("t.amount <= :$paramKey");
                    $qb->setParameter($paramKey, $max);
                }
                $qb->andWhere($orX);
            } else {
                $qb->andWhere('t.amount <= :maxAmount')
                    ->setParameter('maxAmount', $filters['maxAmount']);
            }
        }

        // User profile filtering
        if (isset($filters['userProfile']) && $filters['userProfile'] !== '') {
            if (is_array($filters['userProfile'])) {
                $qb->andWhere($qb->expr()->in('p.id', ':userProfiles'))
                    ->setParameter('userProfiles', $filters['userProfile']);
            } else {
                $qb->andWhere('p.id = :userProfile')
                    ->setParameter('userProfile', $filters['userProfile']);
            }
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

}
