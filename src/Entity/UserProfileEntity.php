<?php

namespace App\Entity;

use App\Repository\UserProfileEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserProfileEntityRepository::class)]
class UserProfileEntity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    private ?string $lastName = null;

    #[ORM\ManyToOne(inversedBy: 'userProfileEntities')]
    private ?UserEntity $userEntity = null;

    /**
     * @var Collection<int, ExpenseEntity>
     */
    #[ORM\OneToMany(mappedBy: 'userProfileEntity', targetEntity: ExpenseEntity::class)]
    private Collection $expense;

    /**
     * @var Collection<int, IncomeEntity>
     */
    #[ORM\OneToMany(mappedBy: 'userProfileEntity', targetEntity: IncomeEntity::class)]
    private Collection $income;

    public function __construct()
    {
        $this->expense = new ArrayCollection();
        $this->income = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

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

    /**
     * @return Collection<int, ExpenseEntity>
     */
    public function getExpense(): Collection
    {
        return $this->expense;
    }

    public function addExpense(ExpenseEntity $expense): static
    {
        if (!$this->expense->contains($expense)) {
            $this->expense->add($expense);
            $expense->setUserProfileEntity($this);
        }

        return $this;
    }

    public function removeExpense(ExpenseEntity $expense): static
    {
        if ($this->expense->removeElement($expense)) {
            // set the owning side to null (unless already changed)
            if ($expense->getUserProfileEntity() === $this) {
                $expense->setUserProfileEntity(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, IncomeEntity>
     */
    public function getIncome(): Collection
    {
        return $this->income;
    }

    public function addIncome(IncomeEntity $income): static
    {
        if (!$this->income->contains($income)) {
            $this->income->add($income);
            $income->setUserProfileEntity($this);
        }

        return $this;
    }

    public function removeIncome(IncomeEntity $income): static
    {
        if ($this->income->removeElement($income)) {
            // set the owning side to null (unless already changed)
            if ($income->getUserProfileEntity() === $this) {
                $income->setUserProfileEntity(null);
            }
        }

        return $this;
    }
}
