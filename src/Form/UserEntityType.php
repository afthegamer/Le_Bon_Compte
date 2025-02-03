<?php

namespace App\Form;

use App\Entity\UserEntity;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Positive;

class UserEntityType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email',EmailType::class, [
        'label' => 'Email',
        'constraints' => [new NotBlank()],
        ])

            ->add('plainPassword', RepeatedType::class, [
                'type' => PasswordType::class,
                'mapped' => false,
                'required' => false,
                'attr' => ['autocomplete' => 'new-password'],
                'first_options'  => ['label' => 'Nouveau mot de passe', 'attr' => ['class' => 'w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300']],
                'second_options' => ['label' => 'Confirmer le mot de passe', 'attr' => ['class' => 'w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300']],
                'invalid_message' => 'Les mots de passe doivent correspondre.',
                'constraints' => [
                    new Length([
                        'min' => 6,
                        'minMessage' => 'Your password should be at least {{ limit }} characters',
                        // max length allowed by Symfony for security reasons
                        'max' => 4096,
                    ]),
                ],
            ])
            ->add('firstName')
            ->add('lastName')
            ->add('wallet', MoneyType::class, [
                'label' => 'Revenut net mensuel',
                'constraints' => [new Positive()],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => UserEntity::class,
        ]);
    }
}
