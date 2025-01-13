<?php

namespace App\Entity;

use App\Repository\UserEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserEntityRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[UniqueEntity(fields: ['email'], message: 'There is already an account with this email')]
class UserEntity implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column]
    private bool $isVerified = false;

    #[ORM\Column(length: 255)]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    private ?string $lastName = null;

    #[ORM\Column(nullable: true)]
    private ?int $wallet = null;

    /**
     * @var Collection<int, ExpenseEntity>
     */
    #[ORM\OneToMany(mappedBy: 'userEntity', targetEntity: ExpenseEntity::class)]
    private Collection $expense;

    /**
     * @var Collection<int, IncomeEntity>
     */
    #[ORM\OneToMany(mappedBy: 'userEntity', targetEntity: IncomeEntity::class)]
    private Collection $incomeEntities;

    public function __construct()
    {
        $this->expense = new ArrayCollection();
        $this->incomeEntities = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function setVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;

        return $this;
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
            $expense->setUserEntity($this);
        }

        return $this;
    }

    public function removeExpense(ExpenseEntity $expense): static
    {
        if ($this->expense->removeElement($expense)) {
            // set the owning side to null (unless already changed)
            if ($expense->getUserEntity() === $this) {
                $expense->setUserEntity(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, IncomeEntity>
     */
    public function getIncomeEntities(): Collection
    {
        return $this->incomeEntities;
    }

    public function addIncomeEntity(IncomeEntity $incomeEntity): static
    {
        if (!$this->incomeEntities->contains($incomeEntity)) {
            $this->incomeEntities->add($incomeEntity);
            $incomeEntity->setUserEntity($this);
        }

        return $this;
    }

    public function removeIncomeEntity(IncomeEntity $incomeEntity): static
    {
        if ($this->incomeEntities->removeElement($incomeEntity)) {
            // set the owning side to null (unless already changed)
            if ($incomeEntity->getUserEntity() === $this) {
                $incomeEntity->setUserEntity(null);
            }
        }

        return $this;
    }
}
