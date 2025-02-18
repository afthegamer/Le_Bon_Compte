<?php

namespace App\Form;

use App\Entity\IncomeEntity;
use App\Entity\UserProfileEntity;
use App\Service\UserProfileService;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class IncomeEntityType extends AbstractType
{
    private UserProfileService $userProfileService;

    public function __construct(UserProfileService $userProfileService)
    {
        $this->userProfileService = $userProfileService;
    }
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        // Recover the user connected from the options
        $connectedUser = $options['connected_user'];

        $builder
            ->add('name', TextType::class, [
                'label' => 'Nom du revenu',
            ])
            ->add('amount',MoneyType::class,[
                'constraints' => [
                    new Assert\Positive()
                ],
                'label' => 'Montant',
            ])
            ->add('type',ChoiceType::class, [
                'choices' => [
                    'Virement bancaire'          => 'Virement bancaire',
                    'Chèque'                     => 'Chèque',
                    'Espèces'                    => 'Espèces',
                    'Carte bancaire'             => 'Carte bancaire',
                    'Prélèvement automatique'    => 'Prélèvement automatique',
                    'Paiement en ligne'          => 'Paiement en ligne',
                ],
                'placeholder' => 'Sélectionnez un TYpe de movement de fond',
                'label' => 'Type de movement de fond',
                'required'    => true,
            ])
            ->add('date', DateType::class, [
                'widget' => 'single_text',
                "label" => "Date de réception",
            ])
            ->add('categoryEntity', TextType::class, [
                'mapped' => false,
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
                'label' => 'Utilisateur lier à ce revenu',
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => IncomeEntity::class,
        ]);

        // Declare the personalized option `Connected_user`
        $resolver->setDefined(['connected_user']);
    }
}
