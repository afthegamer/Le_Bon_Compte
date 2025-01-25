<?php

namespace App\Entity;

use App\Repository\IncomeEntityRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: IncomeEntityRepository::class)]
class IncomeEntity implements UserRelatedEntityInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    private ?string $name = null;

    #[ORM\Column]
    #[Assert\Positive]
    private ?int $amount = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $type = null;

    #[ORM\ManyToOne(targetEntity: UserEntity::class, inversedBy: 'incomeEntities')]
    #[ORM\JoinColumn(nullable: false)]
    private ?UserEntity $userEntity = null;

    #[ORM\ManyToOne(targetEntity: CategoryEntity::class, inversedBy: 'incomeEntity')]
    private ?CategoryEntity $categoryEntity = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTime $date = null;

    #[ORM\ManyToOne(inversedBy: 'income')]
    private ?UserProfileEntity $userProfileEntity = null;

    #[ORM\OneToOne(targetEntity: SubcategoryEntity::class , cascade: ['persist', 'remove'])]
    private ?SubcategoryEntity $subcategoryEntity = null;

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

    public function getAmount(): ?int
    {
        return $this->amount;
    }

    public function setAmount(int $amount): static
    {
        $this->amount = $amount;

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
        $this->categoryEntity = $categoryEntity;

        return $this;
    }

    public function getDate(): ?\DateTime
    {
        return $this->date;
    }

    public function setDate(\DateTime $date): static
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

    public function getSubcategoryEntity(): ?SubcategoryEntity
    {
        return $this->subcategoryEntity;
    }

    public function setSubcategoryEntity(?SubcategoryEntity $subcategoryEntity): static
    {
        $this->subcategoryEntity = $subcategoryEntity;

        return $this;
    }
}
