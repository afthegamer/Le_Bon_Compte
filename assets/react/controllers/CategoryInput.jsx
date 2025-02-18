import React, { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
} from "@mui/material";

const CategoryInput = ({
                           predefinedCategories,
                           inputName,
                           subcatInputName,
                           currentCategory,
                           currentSubcategory,
                           onCategoryChange,
                           onSubcategoryChange
                       }) => {
    // Fusion of predefined categories and user into a table of objects {name, ispredefined}
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
            return predefinedCategories.map((cat) => ({ name: cat, isPredefined: true }));
        }
        return [];
    }, [predefinedCategories]);

    // States for the management of categories and subcategories
    const [categories, setCategories] = useState(combinedCategories);
    const [filteredCategories, setFilteredCategories] = useState(combinedCategories);
    const [value, setValue] = useState(currentCategory || "");
    const [isFocused, setIsFocused] = useState(false);

    // State to memorize the selected category locally
    const [selectedCategory, setSelectedCategory] = useState(currentCategory || "");

    const [subcategories, setSubcategories] = useState([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState(currentSubcategory || "");

    const [isCheckboxVisible, setIsCheckboxVisible] = useState(false);
    // Initialization according to Currentsubcategory
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(
        currentSubcategory && currentSubcategory.trim() !== ""
    );
    const [isSubcategoryInputVisible, setIsSubcategoryInputVisible] = useState(
        currentSubcategory && currentSubcategory.trim() !== ""
    );

    const [isSubcatFocused, setIsSubcatFocused] = useState(false);

    // States for modals
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [confirmationModalData, setConfirmationModalData] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [notificationModalOpen, setNotificationModalOpen] = useState(false);
    const [notificationModalData, setNotificationModalData] = useState({
        title: "",
        message: "",
    });
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);

    // Opening/closing functions of modals
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

    // Triggered effect when the selected category changes
    useEffect(() => {
        if (selectedCategory && selectedCategory.trim() !== "") {
            setIsCheckboxVisible(true);
            // immediately reset the subcategories and the associated input,
            // and reset the checkbox to False (the box should not be checked automatically if no value is present)
            setSubcategories([]);
            setFilteredSubcategories([]);
            setSelectedSubcategory("");
            setIsCheckboxChecked(false);
            setIsSubcategoryInputVisible(false);
            setLoadingSubcategories(true);

            fetch(`/api/subcategories/by-name/${encodeURIComponent(selectedCategory)}`)
                .then((response) => response.json())
                .then((data) => {
                    const mergedSubcategories = [
                        ...(data.predefined || []),
                        ...(data.user || []),
                    ];
                    setSubcategories(mergedSubcategories);
                    setFilteredSubcategories(mergedSubcategories);
                    // If subcategories exist and Currentsubcategory is not empty, then check the box
                    if (mergedSubcategories.length > 0 && currentSubcategory && currentSubcategory.trim() !== "") {
                        setIsCheckboxChecked(true);
                        setIsSubcategoryInputVisible(true);
                        setSelectedSubcategory(currentSubcategory);
                    }
                    // Otherwise, if the user has not provided a subcategory, leave the checkbox unchecked.
                    setLoadingSubcategories(false);
                })
                .catch((error) => {
                    console.error("Erreur lors du chargement des sous-catégories", error);
                    setLoadingSubcategories(false);
                });
        }
    }, [selectedCategory, currentSubcategory, currentCategory]);

    // Category filtering
    useEffect(() => {
        const filtered = categories.filter((cat) =>
            cat.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCategories(filtered);
    }, [value, categories]);

    // Dynamic subcategories filtering according to the subcategory input
    useEffect(() => {
        const filtered = subcategories.filter((sub) =>
            sub.name.toLowerCase().includes(selectedSubcategory.toLowerCase())
        );
        setFilteredSubcategories(filtered);
    }, [selectedSubcategory, subcategories]);

    // Focus management on category input
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

        if (onCategoryChange) {
            onCategoryChange(category.name);
        }
        const hiddenInput = document.querySelector(`input[name="${inputName}"]`);

        if (hiddenInput) {
            hiddenInput.value = category.name;
        }
        // Immediately empty the subcategories to refresh the IU
        setSubcategories([]);
        setFilteredSubcategories([]);
        setSelectedSubcategory("");
        setIsCheckboxVisible(true);
        setSelectedCategory(category.name);
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

        if (onSubcategoryChange) {
            onSubcategoryChange(subcategory.name);
        }
        const hiddenSubcatInput = document.querySelector(`input[name="${subcatInputName}"]`);
        if (hiddenSubcatInput) {
            hiddenSubcatInput.value = subcategory.name;
        }
    };

    // Deletion management via modal
    const handleDeleteSubcategory = (subcategoryId) => {
        openConfirmationModal(
            "Confirmation de suppression",
            "Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?",
            () => {
                // Optimistic update: immediately remove the element
                setSubcategories((prev) =>
                    prev.filter((sub) => sub.id !== subcategoryId)
                );
                setFilteredSubcategories((prev) =>
                    prev.filter((sub) => sub.id !== subcategoryId)
                );
                fetch(`/api/subcategories/${subcategoryId}`, {
                    method: "DELETE",
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Erreur lors de la suppression");
                        }
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

    return (
        <div className="relative">
            {/* Category input */}
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
                            onMouseDown={() => handleSuggestionClick(category)}
                        >
                            <span>{category.name}</span>
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
            {/* Checkbox to display the field of subcategories */}
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

            {/* Subcategory input */}
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
                    {/* Suggestions de sous-catégories */}
                    {isSubcatFocused && (
                        <ul className="absolute z-10 bg-white border mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                            {loadingSubcategories ? (
                                <li className="p-2 flex justify-center items-center">
                                    <CircularProgress size={20} />
                                    <span className="ml-2">Chargement...</span>
                                </li>
                            ) : (
                                filteredSubcategories.map((subcategory) => (
                                    <li
                                        key={subcategory.id ? subcategory.id : subcategory.name}
                                        className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                        onMouseDown={() => handleSubcategorySuggestionClick(subcategory)}
                                    >
                                        <span>{subcategory.name}</span>
                                        {subcategory.id !== null && (
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
                                        )}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            )}

            {/* Confirmation modal */}
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

            {/* Notification modal */}
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
