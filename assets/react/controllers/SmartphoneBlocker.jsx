import React, { useEffect, useState } from "react";

const SmartphoneBlocker = ({ children }) => {
    const [isSmartphone, setIsSmartphone] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const handleResize = () => {
            setIsSmartphone(mediaQuery.matches);
        };

        // Détection initiale
        handleResize();

        // Écoute des changements de taille de l'écran
        mediaQuery.addEventListener("change", handleResize);

        // Nettoyage
        return () => {
            mediaQuery.removeEventListener("change", handleResize);
        };
    }, []);

    if (isSmartphone) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 text-center p-4">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-semibold text-red-500">
                        Site non disponible pour les smartphones
                    </h1>
                    <p className="mt-4 text-gray-600">
                        Ce site est actuellement optimisé uniquement pour les écrans plus
                        larges. Veuillez utiliser un ordinateur ou une tablette pour y
                        accéder.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default SmartphoneBlocker;
