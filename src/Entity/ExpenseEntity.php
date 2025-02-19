<?php

namespace App\Entity;

use App\Repository\ExpenseEntityRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

#[ORM\Entity(repositoryClass: ExpenseEntityRepository::class)]
#[Vich\Uploadable]
class ExpenseEntity implements UserRelatedEntityInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $invoice = null;

    #[Vich\UploadableField(mapping: 'expense_invoices', fileNameProperty: 'invoice')]
    private ?File $invoiceFile = null;


    #[ORM\Column]
    #[Assert\Negative]
    private ?float $amount = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $type = null;

    #[ORM\ManyToOne(targetEntity: UserEntity::class, inversedBy: 'expense')]
    #[ORM\JoinColumn(nullable: false)]
    private ?UserEntity $userEntity = null;

    #[ORM\ManyToOne(targetEntity: CategoryEntity::class, inversedBy: 'expenseEntity')]
    private ?CategoryEntity $categoryEntity = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTime $date = null;

    #[ORM\ManyToOne(inversedBy: 'expense')]
    private ?UserProfileEntity $userProfileEntity = null;

    #[ORM\ManyToOne(targetEntity: SubcategoryEntity::class, inversedBy: 'expenseEntity')]
    private ?SubcategoryEntity $subcategoryEntity = null;


    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTime $updatedAt = null;

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTime $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): static
    {
        $this->amount = -$amount;

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

    public function setInvoiceFile(?File $invoiceFile = null): void
    {
        $this->invoiceFile = $invoiceFile;

        if ($invoiceFile) {
            $this->updatedAt = new \DateTime;
        }
    }

    public function getInvoiceFile(): ?File
    {
        return $this->invoiceFile;
    }

    public function setInvoice(?string $invoice): self
    {
        $this->invoice = $invoice;
        return $this;
    }

    public function getInvoice(): ?string
    {
        return $this->invoice;
    }

}
