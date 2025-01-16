<?php

namespace App\Form;

use App\Entity\CategoryEntity;
use App\Entity\ExpenseEntity;
use App\Entity\UserProfileEntity;
use App\Service\UserProfileService;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ExpenseEntityType extends AbstractType
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
            ->add('amount')
            ->add('name')
            ->add('type')
            ->add('date', null, [
                'widget' => 'single_text',
            ])
            ->add('categoryEntity', EntityType::class, [
                'class' => CategoryEntity::class,
                'choice_label' => 'id',
            ])
            ->add('userProfileEntity', EntityType::class, [
                'class' => UserProfileEntity::class,
                'choices' => $this->userProfileService->getUserProfiles($connectedUser),
                'choice_label' => function (UserProfileEntity $profile) {
                    return sprintf('%s %s', $profile->getFirstName(), $profile->getLastName());
                },
                'label' => 'Assign to Profile',
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => ExpenseEntity::class,
        ]);

        // Déclarer l'option personnalisée `connected_user`
        $resolver->setDefined(['connected_user']);
    }
}
