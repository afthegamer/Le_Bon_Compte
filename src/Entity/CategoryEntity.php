<?php

namespace App\Entity;

use App\Repository\CategoryEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CategoryEntityRepository::class)]
class CategoryEntity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\OneToMany(mappedBy: 'categoryEntity', targetEntity: IncomeEntity::class)]
    private Collection $incomeEntity;

    #[ORM\OneToMany(mappedBy: 'categoryEntity', targetEntity: ExpenseEntity::class)]
    private Collection $expenseEntity;

    /**
     * @var Collection<int, SubcategoryEntity>
     */
    #[ORM\OneToMany(mappedBy: 'categoryEntity', targetEntity: SubcategoryEntity::class)]
    private Collection $subcategoryEntities;

    #[ORM\ManyToOne(targetEntity: UserEntity::class, inversedBy: 'categoryEntities')]
    private ?UserEntity $userEntity = null;

    public function __construct()
    {
        $this->subcategoryEntities = new ArrayCollection();
        $this->incomeEntity = new ArrayCollection();
        $this->expenseEntity = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getIncomeEntity(): Collection
    {
        return $this->incomeEntity;
    }

    public function addIncomeEntity(IncomeEntity $incomeEntity): static
    {
        if (!$this->incomeEntity->contains($incomeEntity)) {
            $this->incomeEntity->add($incomeEntity);
            $incomeEntity->setCategoryEntity($this);
        }

        return $this;
    }

    public function removeIncomeEntity(IncomeEntity $incomeEntity): static
    {
        if ($this->incomeEntity->removeElement($incomeEntity)) {
            if ($incomeEntity->getCategoryEntity() === $this) {
                $incomeEntity->setCategoryEntity(null);
            }
        }

        return $this;
    }

    public function getExpenseEntity(): Collection
    {
        return $this->expenseEntity;
    }

    public function addExpenseEntity(ExpenseEntity $expenseEntity): static
    {
        if (!$this->expenseEntity->contains($expenseEntity)) {
            $this->expenseEntity->add($expenseEntity);
            $expenseEntity->setCategoryEntity($this);
        }

        return $this;
    }

    public function removeExpenseEntity(ExpenseEntity $expenseEntity): static
    {
        if ($this->expenseEntity->removeElement($expenseEntity)) {
            if ($expenseEntity->getCategoryEntity() === $this) {
                $expenseEntity->setCategoryEntity(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, SubcategoryEntity>
     */
    public function getSubcategoryEntities(): Collection
    {
        return $this->subcategoryEntities;
    }

    public function addSubcategoryEntity(SubcategoryEntity $subcategoryEntity): static
    {
        if (!$this->subcategoryEntities->contains($subcategoryEntity)) {
            $this->subcategoryEntities->add($subcategoryEntity);
            $subcategoryEntity->setCategoryEntity($this);
        }

        return $this;
    }

    public function removeSubcategoryEntity(SubcategoryEntity $subcategoryEntity): static
    {
        if ($this->subcategoryEntities->removeElement($subcategoryEntity)) {
            if ($subcategoryEntity->getCategoryEntity() === $this) {
                $subcategoryEntity->setCategoryEntity(null);
            }
        }

        return $this;
    }

    public function getUserEntity(): ?UserEntity
    {
        return $this->userEntity;
    }

    public function setUserEntity(?UserEntity $userEntity): static
    {
        $this->userEntity = $userEntity;
        return $this;
    }
}
