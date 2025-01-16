<?php

namespace App\Form;

use App\Entity\CategoryEntity;
use App\Entity\IncomeEntity;
use App\Entity\UserEntity;
use App\Entity\UserProfileEntity;
use App\Service\UserProfileService;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class IncomeEntityType extends AbstractType
{
    private UserProfileService $userProfileService;

    public function __construct(UserProfileService $userProfileService)
    {
        $this->userProfileService = $userProfileService;
    }
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        // Récupérer l'utilisateur connecté depuis les options
        $connectedUser = $options['connected_user'];

        $builder
            ->add('name')
            ->add('amount')
            ->add('type')
            ->add('date', null, [
                'widget' => 'single_text',
            ])
            ->add('categoryEntity', EntityType::class, [
                'class' => CategoryEntity::class,
                'choice_label' => 'name',
            ])
            ->add('userProfileEntity', EntityType::class, [
                'class' => UserProfileEntity::class,
                'choices' => $this->userProfileService->getUserProfiles($connectedUser),
                'choice_label' => function (UserProfileEntity $profile) {
                    return sprintf('%s %s', $profile->getFirstName(), $profile->getLastName());
                },
                'label' => 'Assign to Profile',
            ]);
//            ->add('userProfileEntity', EntityType::class, [
//                'class' => UserProfileEntity::class,
//                'choices' => $this->userProfileService->getUserProfiles($connectedUser),
//                'choice_label' => 'firstName', // Affiche le prénom des profils
//                'label' => 'Assign to Profile',
//            ]);
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => IncomeEntity::class,
        ]);

        // Déclarer l'option personnalisée `connected_user`
        $resolver->setDefined(['connected_user']);
    }
}
