import React, { useState } from "react";

const CategoryInput = ({ predefinedCategories, inputName, currentCategory }) => {
    const [categories] = useState(predefinedCategories);
    const [filteredCategories, setFilteredCategories] = useState(predefinedCategories);
    const [value, setValue] = useState(currentCategory || ""); // Utilise la catégorie actuelle
    const [isFocused, setIsFocused] = useState(false); // État pour suivre le focus

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        // Masquer la liste après un court délai pour permettre une sélection
        setTimeout(() => setIsFocused(false), 200);
    };

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
    };

    const handleSuggestionClick = (category) => {
        setValue(category);
        setFilteredCategories([]);
        setIsFocused(false); // Fermer la liste après sélection

        const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
        if (hiddenInput) {
            hiddenInput.value = category;
        }
    };

    return (
        <div className="relative">
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
        </div>
    );
};

export default CategoryInput;
