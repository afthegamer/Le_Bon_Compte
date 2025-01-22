import React, { useState, useEffect } from "react";

const CategoryInput = ({ predefinedCategories, inputName, subcatInputName, currentCategory, currentSubcategory }) => {
    const [categories] = useState(predefinedCategories);
    const [filteredCategories, setFilteredCategories] = useState(predefinedCategories);
    const [value, setValue] = useState(currentCategory || "");
    const [isFocused, setIsFocused] = useState(false);

    const [subcategories, setSubcategories] = useState([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState(currentSubcategory || "");
    const [isSubcategoryFocused, setIsSubcategoryFocused] = useState(false);

    const [isCheckboxVisible, setIsCheckboxVisible] = useState(false);
    const [isSubcategoryInputVisible, setIsSubcategoryInputVisible] = useState(currentSubcategory !== "");

    const handleFocus = () => setIsFocused(true);

    const handleBlur = () => setTimeout(() => setIsFocused(false), 200);

    const handleChange = (event) => {
        const inputValue = event.target.value;
        setValue(inputValue);

        const filtered = categories.filter((category) =>
            category.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredCategories(filtered);

        const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
        if (hiddenInput) {
            hiddenInput.value = inputValue;
        }

        // Afficher la case à cocher si un nom de catégorie est saisi
        setIsCheckboxVisible(inputValue.trim() !== "");

        // Charger les sous-catégories en fonction du nom de la catégorie
        fetch(`/api/subcategories/by-name/${encodeURIComponent(inputValue)}`)
            .then((response) => response.json())
            .then((data) => {
                setSubcategories(data);
                setFilteredSubcategories(data);
            })
            .catch((error) => console.error("Erreur lors du chargement des sous-catégories", error));
    };

    const handleSuggestionClick = (category) => {
        setValue(category);
        setFilteredCategories([]);
        setIsFocused(false);
        setIsCheckboxVisible(false);

        const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
        if (hiddenInput) {
            hiddenInput.value = category;
        }

        // Charger les sous-catégories en fonction du nom de la catégorie
        fetch(`/api/subcategories/by-name/${encodeURIComponent(category)}`)
            .then((response) => response.json())
            .then((data) => {
                setSubcategories(data);
                setFilteredSubcategories(data);
            })
            .catch((error) => console.error("Erreur lors du chargement des sous-catégories", error));
    };

    const handleCheckboxChange = (event) => {
        setIsSubcategoryInputVisible(event.target.checked);
    };

    const handleSubcategoryFocus = () => setIsSubcategoryFocused(true);

    const handleSubcategoryBlur = () => setTimeout(() => setIsSubcategoryFocused(false), 200);

    const handleSubcategoryChange = (event) => {
        const inputValue = event.target.value;
        setSelectedSubcategory(inputValue);

        const filtered = subcategories.filter((subcategory) =>
            subcategory.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredSubcategories(filtered);

        const hiddenSubcategoryInput = document.querySelector(`input[name="${subcatInputName}"]`);
        if (hiddenSubcategoryInput) {
            hiddenSubcategoryInput.value = inputValue;
        }
    };

    const handleSubcategorySuggestionClick = (subcategory) => {
        setSelectedSubcategory(subcategory.name);
        setFilteredSubcategories([]);
        setIsSubcategoryFocused(false);

        const hiddenSubcategoryInput = document.querySelector(`input[name="${subcatInputName}"]`);
        if (hiddenSubcategoryInput) {
            hiddenSubcategoryInput.value = subcategory.name;
        }
    };

    useEffect(() => {
        // Afficher la case à cocher si une valeur est déjà définie dans le champ
        if (value.trim() !== "") {
            setIsCheckboxVisible(true);
        }

        // Charger les sous-catégories actuelles si une sous-catégorie est déjà définie
        if (currentCategory) {
            fetch(`/api/subcategories/by-name/${encodeURIComponent(currentCategory)}`)
                .then((response) => response.json())
                .then((data) => {
                    setSubcategories(data);
                    setFilteredSubcategories(data);
                })
                .catch((error) => console.error("Erreur lors du chargement des sous-catégories", error));
        }

        // Rendre le champ sous-catégorie visible si une sous-catégorie est déjà définie
        if (currentSubcategory) {
            setIsSubcategoryInputVisible(true);
            setIsCheckboxVisible(true); // Garder la case cochée si une sous-catégorie est présente
        }
    }, [value, currentCategory, currentSubcategory]);

    return (
        <div className="relative">
            {/* Champ catégorie */}
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
                            checked={isSubcategoryInputVisible}
                        />
                        <span className="ml-2 text-gray-700">Ajouter une sous-catégorie</span>
                    </label>
                </div>
            )}

            {/* Champ sous-catégorie */}
            {isSubcategoryInputVisible && (
                <div className="mt-4 relative">
                    <label htmlFor="subcategory">Sous-catégorie :</label>
                    <input
                        type="text"
                        value={selectedSubcategory}
                        onChange={handleSubcategoryChange}
                        onFocus={handleSubcategoryFocus}
                        onBlur={handleSubcategoryBlur}
                        className="border p-2 rounded w-full mt-2"
                        placeholder="Entrez ou sélectionnez une sous-catégorie"
                    />
                    {isSubcategoryFocused && filteredSubcategories.length > 0 && (
                        <ul className="absolute z-10 bg-white border mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                            {filteredSubcategories.map((subcategory) => (
                                <li
                                    key={subcategory.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSubcategorySuggestionClick(subcategory)}
                                >
                                    {subcategory.name}
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
