<?php

namespace App\Form;

use App\Entity\CategoryEntity;
use App\Entity\IncomeEntity;
use App\Entity\SubcategoryEntity;
use App\Entity\UserEntity;
use App\Entity\UserProfileEntity;
use App\Service\UserProfileService;
use Doctrine\ORM\EntityRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
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
            ->add('categoryEntity', TextType::class, [
                'mapped' => false, // Ce champ ne correspond pas directement à une propriété
                'required' => false,
                'label' => 'Catégorie',
            ])
            ->add('subcategoryEntity', TextType::class, [
                'mapped' => false,
                'required' => false,
                'label' => 'Sous-catégorie',
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
            'data_class' => IncomeEntity::class,
        ]);

        // Déclarer l'option personnalisée `connected_user`
        $resolver->setDefined(['connected_user']);
    }
}
