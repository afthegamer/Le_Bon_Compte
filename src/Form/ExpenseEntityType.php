<?php

namespace App\Form;

use App\Entity\ExpenseEntity;
use App\Entity\UserProfileEntity;
use App\Service\UserProfileService;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Vich\UploaderBundle\Form\Type\VichFileType;

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
            ->add('date', DateType::class, [
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
            ])
            ->add('invoiceFile', VichFileType::class, [
                'required' => false,
                'allow_delete' => true,
                'download_uri' => true,
                'download_label' => 'Télécharger la facture',
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
