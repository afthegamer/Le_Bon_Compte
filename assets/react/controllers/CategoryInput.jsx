import React, { useState, useEffect } from "react";

const CategoryInput = ({
                           predefinedCategories,
                           inputName,
                           subcatInputName,
                           currentCategory,
                           currentSubcategory
                       }) => {
    const [categories] = useState(predefinedCategories);
    const [filteredCategories, setFilteredCategories] = useState(predefinedCategories);
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

    // Au montage, si une catégorie est renseignée, on affiche la case à cocher et on charge ses sous-catégories.
    useEffect(() => {
        if (currentCategory && currentCategory.trim() !== "") {
            setIsCheckboxVisible(true);
            fetch(`/api/subcategories/by-name/${encodeURIComponent(currentCategory)}`)
                .then((response) => response.json())
                .then((data) => {
                    setSubcategories(data);
                    setFilteredSubcategories(data);
                    // Si une sous-catégorie est déjà définie, cocher la case et afficher l'input
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

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setTimeout(() => setIsFocused(false), 200);

    const handleChange = (event) => {
        const inputValue = event.target.value;
        setValue(inputValue);

        // Filtrer les catégories en fonction de l'entrée utilisateur
        const filtered = categories.filter((category) =>
            category.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredCategories(filtered);

        const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
        if (hiddenInput) {
            hiddenInput.value = inputValue;
        }

        // Afficher la case à cocher si une catégorie est saisie
        setIsCheckboxVisible(inputValue.trim() !== "");

        // Réinitialiser l'état de la case à cocher et du champ sous-catégorie si le champ est vide
        if (inputValue.trim() === "") {
            setIsCheckboxChecked(false);
            setIsSubcategoryInputVisible(false);
            setSubcategories([]);
            setFilteredSubcategories([]);
            return;
        }

        // Charger les sous-catégories selon la catégorie saisie
        fetch(`/api/subcategories/by-name/${encodeURIComponent(inputValue)}`)
            .then((response) => response.json())
            .then((data) => {
                setSubcategories(data);
                setFilteredSubcategories(data);
            })
            .catch((error) =>
                console.error("Erreur lors du chargement des sous-catégories", error)
            );
    };

    const handleSuggestionClick = (category) => {
        setValue(category);
        setFilteredCategories([]);
        setIsFocused(false);

        const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
        if (hiddenInput) {
            hiddenInput.value = category;
        }

        // Vider l'input de sous-catégorie lors de la sélection d'une nouvelle catégorie
        setSelectedSubcategory("");
        const hiddenSubcatInput = document.querySelector(`input[name="${subcatInputName}"]`);
        if (hiddenSubcatInput) {
            hiddenSubcatInput.value = "";
        }

        setIsCheckboxVisible(true);

        fetch(`/api/subcategories/by-name/${encodeURIComponent(category)}`)
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

        if (inputValue.trim() === "") {
            // Si l'utilisateur a sélectionné l'input et n'a rien saisi, on réaffiche toutes les sous-catégories
            setFilteredSubcategories(subcategories);
        } else {
            const filtered = subcategories.filter((subcategory) =>
                subcategory.name.toLowerCase().includes(inputValue.toLowerCase())
            );
            setFilteredSubcategories(filtered);
        }

        const hiddenSubcategoryInput = document.querySelector(
            `input[name="${subcatInputName}"]`
        );
        if (hiddenSubcategoryInput) {
            hiddenSubcategoryInput.value = inputValue;
        }
    };

    const handleSubcategorySuggestionClick = (subcategory) => {
        setSelectedSubcategory(subcategory.name);
        setFilteredSubcategories([]);

        const hiddenSubcategoryInput = document.querySelector(
            `input[name="${subcatInputName}"]`
        );
        if (hiddenSubcategoryInput) {
            hiddenSubcategoryInput.value = subcategory.name;
        }
    };

    // Fonction pour supprimer une sous-catégorie
    const handleDeleteSubcategory = (subcategoryId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?")) {
            fetch(`/api/subcategories/${subcategoryId}`, {
                method: "DELETE"
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Erreur lors de la suppression");
                    }
                    // Mise à jour des listes en retirant la sous-catégorie supprimée
                    setSubcategories(prev => prev.filter(sub => sub.id !== subcategoryId));
                    setFilteredSubcategories(prev => prev.filter(sub => sub.id !== subcategoryId));
                })
                .catch((error) => {
                    console.error("Erreur lors de la suppression de la sous-catégorie :", error);
                    alert("Erreur lors de la suppression de la sous-catégorie. Veuillez réessayer.");
                });
        }
    };


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
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSuggestionClick(category)}
                        >
                            {category}
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
                        <span className="ml-2 text-gray-700">
                            Ajouter une sous-catégorie
                        </span>
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
        </div>
    );
};

export default CategoryInput;
