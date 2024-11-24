<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

//    public function findAllForInterface(): array
//    {
//        $users = $this->findAll();
//        $usersArray = [];
//        foreach ($users as $user) {
//            $usersArray[] = [
//                'id' => $user->getId(),   // ID nécessaire pour React DataGrid
//                'wallet' => $user->getWallet(), // Le champ que tu veux tester
//                'name' => $user->getName(), // Le champ que tu veux tester
//            ];
//        }
//        return $usersArray;
//    }
    public function findAllForInterface(UrlGeneratorInterface $urlGenerator): array
    {
        $users = $this->findAll();
        $usersArray = [];
        foreach ($users as $user) {
            $usersArray[] = [
                'id' => $user->getId(),   // ID nécessaire pour React DataGrid
                'wallet' => $user->getWallet(), // Existence d'un champ 'wallet'
                'name' => $user->getName(),
                'showUrl' => $urlGenerator->generate('app_user_show', ['id' => $user->getId()]),
                'editUrl' => $urlGenerator->generate('app_user_edit', ['id' => $user->getId()]),
            ];
        }
        return $usersArray;
    }




    //    /**
    //     * @return User[] Returns an array of User objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('u.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?User
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
