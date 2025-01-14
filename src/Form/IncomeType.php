<?php

namespace App\Form;

use App\Entity\CategoryEntity;
use App\Entity\IncomeEntity;
use App\Entity\UserEntity;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class IncomeType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name')
            ->add('amount')
            ->add('type')
            ->add('userEntity', EntityType::class, [
                'class' => UserEntity::class,
                'choice_label' => 'id',
            ])
            ->add('categoryEntity', EntityType::class, [
                'class' => CategoryEntity::class,
                'choice_label' => 'id',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => IncomeEntity::class,
        ]);
    }
}
