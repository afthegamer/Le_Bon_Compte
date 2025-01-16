<?php

namespace App\Form;

use App\Entity\CategoryEntity;
use App\Entity\ExpenseEntity;
use App\Entity\UserEntity;
use App\Entity\UserProfileEntity;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ExpenseEntityType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('amount')
            ->add('name')
            ->add('type')
            ->add('date', null, [
                'widget' => 'single_text',
            ])
//            ->add('userEntity', EntityType::class, [
//                'class' => UserEntity::class,
//                'choice_label' => 'id',
//            ])
            ->add('categoryEntity', EntityType::class, [
                'class' => CategoryEntity::class,
                'choice_label' => 'id',
            ])
            ->add('userProfileEntity', EntityType::class, [
                'class' => UserProfileEntity::class,
                'choice_label' => 'id',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => ExpenseEntity::class,
        ]);
    }
}
