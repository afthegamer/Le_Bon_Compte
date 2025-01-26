<?php

namespace App\Entity;

use App\Repository\SubcategoryEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SubcategoryEntityRepository::class)]
#[ORM\UniqueConstraint(columns: ['name', 'category_entity_id'])]
class SubcategoryEntity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\ManyToOne(inversedBy: 'subcategoryEntities')]
    private ?CategoryEntity $categoryEntity = null;

    /**
     * @var Collection<int, ExpenseEntity>
     */
    #[ORM\OneToMany(mappedBy: 'subcategoryEntity', targetEntity: ExpenseEntity::class)]
    private Collection $expenseEntity;

    /**
     * @var Collection<int, IncomeEntity>
     */
    #[ORM\OneToMany(mappedBy: 'subcategoryEntity', targetEntity: IncomeEntity::class)]
    private Collection $incomeEntity;

    public function __construct()
    {
        $this->expenseEntity = new ArrayCollection();
        $this->incomeEntity = new ArrayCollection();
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

    public function getCategoryEntity(): ?CategoryEntity
    {
        return $this->categoryEntity;
    }

    public function setCategoryEntity(?CategoryEntity $categoryEntity): static
    {
        $this->categoryEntity = $categoryEntity;

        return $this;
    }

    /**
     * @return Collection<int, ExpenseEntity>
     */
    public function getExpenseEntity(): Collection
    {
        return $this->expenseEntity;
    }

    public function addExpenseEntity(ExpenseEntity $expenseEntity): static
    {
        if (!$this->expenseEntity->contains($expenseEntity)) {
            $this->expenseEntity->add($expenseEntity);
            $expenseEntity->setSubcategoryEntity($this);
        }

        return $this;
    }

    public function removeExpenseEntity(ExpenseEntity $expenseEntity): static
    {
        if ($this->expenseEntity->removeElement($expenseEntity)) {
            // set the owning side to null (unless already changed)
            if ($expenseEntity->getSubcategoryEntity() === $this) {
                $expenseEntity->setSubcategoryEntity(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, IncomeEntity>
     */
    public function getIncomeEntity(): Collection
    {
        return $this->incomeEntity;
    }

    public function addIncomeEntity(IncomeEntity $incomeEntity): static
    {
        if (!$this->incomeEntity->contains($incomeEntity)) {
            $this->incomeEntity->add($incomeEntity);
            $incomeEntity->setSubcategoryEntity($this);
        }

        return $this;
    }

    public function removeIncomeEntity(IncomeEntity $incomeEntity): static
    {
        if ($this->incomeEntity->removeElement($incomeEntity)) {
            // set the owning side to null (unless already changed)
            if ($incomeEntity->getSubcategoryEntity() === $this) {
                $incomeEntity->setSubcategoryEntity(null);
            }
        }

        return $this;
    }
}
