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

    #[ORM\OneToOne(inversedBy: 'categoryEntity', cascade: ['persist', 'remove'])]
    private ?IncomeEntity $incomeEntity = null;

    #[ORM\OneToOne(inversedBy: 'categoryEntity', cascade: ['persist', 'remove'])]
    private ?ExpenseEntity $expenseEntity = null;

    /**
     * @var Collection<int, SubcategoryEntity>
     */
    #[ORM\OneToMany(mappedBy: 'categoryEntity', targetEntity: SubcategoryEntity::class)]
    private Collection $subcategoryEntities;

    public function __construct()
    {
        $this->subcategoryEntities = new ArrayCollection();
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

    public function getIncomeEntity(): ?IncomeEntity
    {
        return $this->incomeEntity;
    }

    public function setIncomeEntity(?IncomeEntity $incomeEntity): static
    {
        $this->incomeEntity = $incomeEntity;

        return $this;
    }

    public function getExpenseEntity(): ?ExpenseEntity
    {
        return $this->expenseEntity;
    }

    public function setExpenseEntity(?ExpenseEntity $expenseEntity): static
    {
        $this->expenseEntity = $expenseEntity;

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
            // set the owning side to null (unless already changed)
            if ($subcategoryEntity->getCategoryEntity() === $this) {
                $subcategoryEntity->setCategoryEntity(null);
            }
        }

        return $this;
    }
}
