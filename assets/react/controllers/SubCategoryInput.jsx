import React, { useState } from "react";

const SubCategoryInput = ({ predefinedSubCategories, inputName }) => {
    const [subcategories] = useState(predefinedSubCategories || []);
    const [isVisible, setIsVisible] = useState(false); // Contrôle de la visibilité
    const [value, setValue] = useState("");

    const handleToggle = () => {
        setIsVisible(!isVisible);
        if (!isVisible) {
            // Réinitialise la valeur quand la case est décochée
            setValue("");
            const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
            if (hiddenInput) {
                hiddenInput.value = "";
            }
        }
    };

    const handleChange = (event) => {
        const newValue = event.target.value;
        setValue(newValue);

        // Synchroniser avec le champ masqué Symfony
        const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
        if (hiddenInput) {
            hiddenInput.value = newValue;
        }
    };

    return (
        <div>
            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    onChange={handleToggle}
                    className="cursor-pointer"
                />
                Ajouter une sous-catégorie
            </label>

            {isVisible && (
                <div className="relative">
                    <input
                        type="text"
                        value={value}
                        onChange={handleChange}
                        className="border p-2 rounded w-full mt-2"
                        placeholder="Entrez ou sélectionnez une sous-catégorie"
                    />
                </div>
            )}
        </div>
    );
};

export default SubCategoryInput;
