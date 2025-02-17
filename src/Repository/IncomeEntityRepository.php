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

    /*public function filterTransactions(array $filters, int $limit = null): array
    {
        $qb = $this->createQueryBuilder('t')
            ->where('t.userEntity = :user')
            ->setParameter('user', $filters['userId']);

        // Filtrage sur la date de début
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

        // Filtrage sur la date de fin
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

        // Filtrage par catégorie
        if (isset($filters['category']) && $filters['category'] !== '') {
            $qb->join('t.categoryEntity', 'c');
            if (is_array($filters['category'])) {
                $qb->andWhere($qb->expr()->in('c.name', ':categories'))
                    ->setParameter('categories', $filters['category']);
            } else {
                $qb->andWhere('c.name = :category')
                    ->setParameter('category', $filters['category']);
            }
        }

        // Filtrage par sous-catégorie
        if (isset($filters['subcategory']) && $filters['subcategory'] !== '') {
            $qb->join('t.subcategoryEntity', 's');
            if (is_array($filters['subcategory'])) {
                $qb->andWhere($qb->expr()->in('s.name', ':subcategories'))
                    ->setParameter('subcategories', $filters['subcategory']);
            } else {
                $qb->andWhere('s.name = :subcategory')
                    ->setParameter('subcategory', $filters['subcategory']);
            }
        }

        // Filtrage par Montant minimum
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

        // Filtrage par Montant maximum
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

        // Filtrage par Profil utilisateur
        if (isset($filters['userProfile']) && $filters['userProfile'] !== '') {
            $qb->join('t.userProfileEntity', 'p');
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
    }*/
    public function filterTransactions(array $filters, int $limit = null): array
    {
        // Sélectionne l'entité principale et effectue des left joins sur les entités associées
        $qb = $this->createQueryBuilder('t')
            ->select('t, c, s, p')
            ->leftJoin('t.categoryEntity', 'c')
            ->leftJoin('t.subcategoryEntity', 's')
            ->leftJoin('t.userProfileEntity', 'p')
            ->where('t.userEntity = :user')
            ->setParameter('user', $filters['userId']);

        // Filtrage sur la date de début
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

        // Filtrage sur la date de fin
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

        // Filtrage par catégorie
        if (isset($filters['category']) && $filters['category'] !== '') {
            if (is_array($filters['category'])) {
                $qb->andWhere($qb->expr()->in('c.name', ':categories'))
                    ->setParameter('categories', $filters['category']);
            } else {
                $qb->andWhere('c.name = :category')
                    ->setParameter('category', $filters['category']);
            }
        }

        // Filtrage par sous-catégorie
        if (isset($filters['subcategory']) && $filters['subcategory'] !== '') {
            if (is_array($filters['subcategory'])) {
                $qb->andWhere($qb->expr()->in('s.name', ':subcategories'))
                    ->setParameter('subcategories', $filters['subcategory']);
            } else {
                $qb->andWhere('s.name = :subcategory')
                    ->setParameter('subcategory', $filters['subcategory']);
            }
        }

        // Filtrage par Montant minimum
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

        // Filtrage par Montant maximum
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

        // Filtrage par Profil utilisateur
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
