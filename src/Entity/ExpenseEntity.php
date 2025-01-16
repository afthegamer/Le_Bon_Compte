<?php

namespace App\Entity;

use App\Repository\ExpenseEntityRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ExpenseEntityRepository::class)]
class ExpenseEntity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $amount = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $type = null;

    #[ORM\ManyToOne(targetEntity:UserEntity::class, inversedBy: 'expense')]
    #[ORM\JoinColumn(nullable: false)]
    private ?UserEntity $userEntity = null;

    #[ORM\OneToOne(mappedBy: 'expenseEntity', cascade: ['persist', 'remove'])]
    private ?CategoryEntity $categoryEntity = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $date = null;

    #[ORM\ManyToOne(inversedBy: 'expense')]
    private ?UserProfileEntity $userProfileEntity = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAmount(): ?int
    {
        return $this->amount;
    }

    public function setAmount(int $amount): static
    {
        $this->amount = $amount;

        return $this;
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

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(?string $type): static
    {
        $this->type = $type;

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

    public function getCategoryEntity(): ?CategoryEntity
    {
        return $this->categoryEntity;
    }

    public function setCategoryEntity(?CategoryEntity $categoryEntity): static
    {
        // unset the owning side of the relation if necessary
        if ($categoryEntity === null && $this->categoryEntity !== null) {
            $this->categoryEntity->setExpenseEntity(null);
        }

        // set the owning side of the relation if necessary
        if ($categoryEntity !== null && $categoryEntity->getExpenseEntity() !== $this) {
            $categoryEntity->setExpenseEntity($this);
        }

        $this->categoryEntity = $categoryEntity;

        return $this;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getUserProfileEntity(): ?UserProfileEntity
    {
        return $this->userProfileEntity;
    }

    public function setUserProfileEntity(?UserProfileEntity $userProfileEntity): static
    {
        $this->userProfileEntity = $userProfileEntity;

        return $this;
    }
}
