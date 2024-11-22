<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(nullable: true)]
    private ?int $wallet = null;

    /**
     * @var Collection<int, Income>
     */
    #[ORM\OneToMany(mappedBy: 'relatedUser', targetEntity: Income::class)]
    private Collection $income;

    /**
     * @var Collection<int, Expense>
     */
    #[ORM\OneToMany(mappedBy: 'relatedUser', targetEntity: Expense::class)]
    private Collection $expense;

    public function __construct()
    {
        $this->income = new ArrayCollection();
        $this->expense = new ArrayCollection();
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

    public function getWallet(): ?int
    {
        return $this->wallet;
    }

    public function setWallet(?int $wallet): static
    {
        $this->wallet = $wallet;

        return $this;
    }

    /**
     * @return Collection<int, Income>
     */
    public function getIncome(): Collection
    {
        return $this->income;
    }

    public function addIncome(Income $income): static
    {
        if (!$this->income->contains($income)) {
            $this->income->add($income);
            $income->setRelatedUser($this);
        }

        return $this;
    }

    public function removeIncome(Income $income): static
    {
        if ($this->income->removeElement($income)) {
            // set the owning side to null (unless already changed)
            if ($income->getRelatedUser() === $this) {
                $income->setRelatedUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Expense>
     */
    public function getExpense(): Collection
    {
        return $this->expense;
    }

    public function addExpense(Expense $expense): static
    {
        if (!$this->expense->contains($expense)) {
            $this->expense->add($expense);
            $expense->setRelatedUser($this);
        }

        return $this;
    }

    public function removeExpense(Expense $expense): static
    {
        if ($this->expense->removeElement($expense)) {
            // set the owning side to null (unless already changed)
            if ($expense->getRelatedUser() === $this) {
                $expense->setRelatedUser(null);
            }
        }

        return $this;
    }
}
