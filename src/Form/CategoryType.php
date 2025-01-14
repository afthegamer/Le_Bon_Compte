<?php

namespace App\Form;

use App\Entity\CategoryEntity;
use App\Entity\ExpenseEntity;
use App\Entity\IncomeEntity;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CategoryType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name')
            ->add('incomeEntity', EntityType::class, [
                'class' => IncomeEntity::class,
                'choice_label' => 'id',
            ])
            ->add('expenseEntity', EntityType::class, [
                'class' => ExpenseEntity::class,
                'choice_label' => 'id',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => CategoryEntity::class,
        ]);
    }
}
