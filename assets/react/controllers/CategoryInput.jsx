import React, { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";

const CategoryInput = ({
                           predefinedCategories, // Objet { predefined: [...], user: [...] } ou tableau simple
                           inputName,
                           subcatInputName,
                           currentCategory,
                           currentSubcategory,
                       }) => {
    // Fusion des catégories prédéfinies et utilisateur en un tableau d'objets { name, isPredefined }
    const combinedCategories = useMemo(() => {
        if (
            predefinedCategories &&
            typeof predefinedCategories === "object" &&
            !Array.isArray(predefinedCategories)
        ) {
            const predefinedList = (predefinedCategories.predefined || []).map((cat) => ({
                name: cat,
                isPredefined: true,
            }));
            const userList = (predefinedCategories.user || [])
                .filter((userCat) => {
                    // Filtrer la catégorie utilisateur si elle existe déjà dans la liste prédéfinie (insensible à la casse)
                    return !(
                        (predefinedCategories.predefined || []).some(
                            (preCat) => preCat.toLowerCase() === userCat.toLowerCase()
                        )
                    );
                })
                .map((cat) => ({
                    name: cat,
                    isPredefined: false,
                }));
            return [...predefinedList, ...userList];
        } else if (Array.isArray(predefinedCategories)) {
            // Si c'est un tableau simple, on considère toutes les catégories comme prédéfinies.
            return predefinedCategories.map((cat) => ({ name: cat, isPredefined: true }));
        }
        return [];
    }, [predefinedCategories]);

    // États pour la gestion des catégories et sous-catégories
    const [categories, setCategories] = useState(combinedCategories);
    const [filteredCategories, setFilteredCategories] = useState(combinedCategories);
    const [value, setValue] = useState(currentCategory || "");
    const [isFocused, setIsFocused] = useState(false);

    const [subcategories, setSubcategories] = useState([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState(currentSubcategory || "");

    const [isCheckboxVisible, setIsCheckboxVisible] = useState(false);
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
    const [isSubcategoryInputVisible, setIsSubcategoryInputVisible] = useState(false);

    // Nouvel état pour détecter le focus sur l'input de sous-catégorie
    const [isSubcatFocused, setIsSubcatFocused] = useState(false);

    // États pour la modal de confirmation
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [confirmationModalData, setConfirmationModalData] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });

    // États pour la modal de notification (succès ou erreur)
    const [notificationModalOpen, setNotificationModalOpen] = useState(false);
    const [notificationModalData, setNotificationModalData] = useState({
        title: "",
        message: "",
    });

    // ------------------ Fonctions d'ouverture/fermeture des modals ------------------

    const openConfirmationModal = (title, message, onConfirm) => {
        setConfirmationModalData({ title, message, onConfirm });
        setConfirmationModalOpen(true);
    };

    const openNotificationModal = (title, message) => {
        setNotificationModalData({ title, message });
        setNotificationModalOpen(true);
    };

    const closeNotificationModal = () => {
        setNotificationModalOpen(false);
    };

    // -----------------------------------------------------------------------------

    // Au montage, si une catégorie est renseignée, on affiche la case à cocher et on charge ses sous-catégories.
    useEffect(() => {
        if (currentCategory && currentCategory.trim() !== "") {
            setIsCheckboxVisible(true);
            fetch(`/api/subcategories/by-name/${encodeURIComponent(currentCategory)}`)
                .then((response) => response.json())
                .then((data) => {
                    setSubcategories(data);
                    setFilteredSubcategories(data);
                    if (currentSubcategory && currentSubcategory.trim() !== "") {
                        setIsCheckboxChecked(true);
                        setIsSubcategoryInputVisible(true);
                    }
                })
                .catch((error) =>
                    console.error("Erreur lors du chargement des sous-catégories", error)
                );
        }
    }, [currentCategory, currentSubcategory]);

    // Mise à jour réactive du filtrage des catégories (insensible à la casse)
    useEffect(() => {
        const filtered = categories.filter((cat) =>
            cat.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCategories(filtered);
    }, [value, categories]);

    // Gestion du focus sur l'input de catégorie
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setTimeout(() => setIsFocused(false), 200);

    const handleChange = (event) => {
        const inputValue = event.target.value;
        setValue(inputValue);

        const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
        if (hiddenInput) {
            hiddenInput.value = inputValue;
        }

        if (
            !categories.some(
                (cat) => cat.name.toLowerCase() === inputValue.toLowerCase()
            )
        ) {
            setSelectedSubcategory("");
            const hiddenSubcatInput = document.querySelector(`input[name="${subcatInputName}"]`);
            if (hiddenSubcatInput) {
                hiddenSubcatInput.value = "";
            }
        }

        setIsCheckboxVisible(inputValue.trim() !== "");
    };

    const handleSuggestionClick = (category) => {
        setValue(category.name);
        setFilteredCategories([]);
        setIsFocused(false);

        const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
        if (hiddenInput) {
            hiddenInput.value = category.name;
        }

        setSelectedSubcategory("");
        const hiddenSubcatInput = document.querySelector(`input[name="${subcatInputName}"]`);
        if (hiddenSubcatInput) {
            hiddenSubcatInput.value = "";
        }

        setIsCheckboxVisible(true);

        fetch(`/api/subcategories/by-name/${encodeURIComponent(category.name)}`)
            .then((response) => response.json())
            .then((data) => {
                setSubcategories(data);
                setFilteredSubcategories(data);
            })
            .catch((error) =>
                console.error("Erreur lors du chargement des sous-catégories", error)
            );
    };

    const handleCheckboxChange = (event) => {
        const isChecked = event.target.checked;
        setIsCheckboxChecked(isChecked);
        setIsSubcategoryInputVisible(isChecked);
    };

    const handleSubcategoryChange = (event) => {
        const inputValue = event.target.value;
        setSelectedSubcategory(inputValue);

        const hiddenSubcatInput = document.querySelector(`input[name="${subcatInputName}"]`);
        if (hiddenSubcatInput) {
            hiddenSubcatInput.value = inputValue;
        }
    };

    const handleSubcategorySuggestionClick = (subcategory) => {
        setSelectedSubcategory(subcategory.name);
        setFilteredSubcategories([]);

        const hiddenSubcatInput = document.querySelector(`input[name="${subcatInputName}"]`);
        if (hiddenSubcatInput) {
            hiddenSubcatInput.value = subcategory.name;
        }
    };

    // -------------------- Gestion de la suppression via modal --------------------

    const handleDeleteSubcategory = (subcategoryId) => {
        openConfirmationModal(
            "Confirmation de suppression",
            "Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?",
            () => {
                fetch(`/api/subcategories/${subcategoryId}`, {
                    method: "DELETE",
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Erreur lors de la suppression");
                        }
                        setSubcategories((prev) =>
                            prev.filter((sub) => sub.id !== subcategoryId)
                        );
                        setFilteredSubcategories((prev) =>
                            prev.filter((sub) => sub.id !== subcategoryId)
                        );
                    })
                    .catch((error) => {
                        console.error("Erreur lors de la suppression de la sous-catégorie :", error);
                        openNotificationModal(
                            "Erreur",
                            "Erreur lors de la suppression de la sous-catégorie. Veuillez réessayer."
                        );
                    });
            }
        );
    };

    const handleDeleteCategory = (categoryName) => {
        if (!categoryName) {
            console.error("Erreur : Nom de la catégorie non défini");
            return;
        }

        openConfirmationModal(
            "Confirmation de suppression",
            `Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`,
            async () => {
                try {
                    const deleteResponse = await fetch(
                        `/api/categories/${encodeURIComponent(categoryName)}`,
                        { method: "DELETE" }
                    );
                    if (!deleteResponse.ok) {
                        throw new Error("Erreur lors de la suppression de la catégorie.");
                    }
                    openNotificationModal("Succès", "Catégorie supprimée avec succès.");

                    setCategories((prev) =>
                        prev.filter((cat) => cat.name !== categoryName)
                    );
                    setFilteredCategories((prev) =>
                        prev.filter((cat) => cat.name !== categoryName)
                    );

                    if (categoryName === value) {
                        setValue("");
                        const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
                        if (hiddenInput) {
                            hiddenInput.value = "";
                        }
                        setSubcategories([]);
                        setFilteredSubcategories([]);
                    }
                } catch (error) {
                    console.error("Erreur lors de la suppression de la catégorie :", error);
                    openNotificationModal(
                        "Erreur",
                        "Erreur lors de la suppression de la catégorie. Veuillez réessayer."
                    );
                }
            }
        );
    };

    // -----------------------------------------------------------------------------

    return (
        <div className="relative">
            {/* Input de catégorie */}
            <input
                type="text"
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="border p-2 rounded w-full"
                placeholder="Entrez ou sélectionnez une catégorie"
            />
            {isFocused && filteredCategories.length > 0 && (
                <ul className="absolute z-10 bg-white border mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                    {filteredCategories.map((category, index) => (
                        <li
                            key={index}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => handleSuggestionClick(category)}
                        >
                            <span>{category.name}</span>
                            {/* Afficher le bouton "Supprimer" uniquement pour les catégories utilisateur */}
                            {!category.isPredefined && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCategory(category.name);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Supprimer
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* Checkbox pour afficher le champ des sous-catégories */}
            {isCheckboxVisible && (
                <div className="mt-2">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            className="form-checkbox text-blue-600"
                            onChange={handleCheckboxChange}
                            checked={isCheckboxChecked}
                        />
                        <span className="ml-2 text-gray-700">Ajouter une sous-catégorie</span>
                    </label>
                </div>
            )}

            {/* Input de sous-catégorie */}
            {isSubcategoryInputVisible && (
                <div className="mt-4 relative">
                    <label htmlFor="subcategory">Sous-catégorie :</label>
                    <input
                        type="text"
                        value={selectedSubcategory}
                        onChange={handleSubcategoryChange}
                        onFocus={() => setIsSubcatFocused(true)}
                        onBlur={() => setTimeout(() => setIsSubcatFocused(false), 200)}
                        className="border p-2 rounded w-full mt-2"
                        placeholder="Entrez ou sélectionnez une sous-catégorie"
                    />
                    {isSubcatFocused && filteredSubcategories.length > 0 && (
                        <ul className="absolute z-10 bg-white border mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                            {filteredSubcategories.map((subcategory) => (
                                <li
                                    key={subcategory.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                    onClick={() => handleSubcategorySuggestionClick(subcategory)}
                                >
                                    <span>{subcategory.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSubcategory(subcategory.id);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Supprimer
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Modal de confirmation */}
            <Dialog
                open={confirmationModalOpen}
                onClose={() => setConfirmationModalOpen(false)}
            >
                <DialogTitle>{confirmationModalData.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmationModalData.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmationModalOpen(false)} color="primary">
                        Annuler
                    </Button>
                    <Button
                        onClick={() => {
                            setConfirmationModalOpen(false);
                            if (confirmationModalData.onConfirm) {
                                confirmationModalData.onConfirm();
                            }
                        }}
                        color="error"
                    >
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de notification */}
            <Dialog open={notificationModalOpen} onClose={closeNotificationModal}>
                <DialogTitle>{notificationModalData.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {notificationModalData.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeNotificationModal} color="primary">
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CategoryInput;
