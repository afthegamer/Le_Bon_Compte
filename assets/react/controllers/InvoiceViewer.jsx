import React, { useState } from "react";

function InvoiceViewer({ fileUrl }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!fileUrl) return null;

    return (
        <div className="flex justify-center items-center">
            {/* Ajout de type="button" pour éviter la soumission du formulaire */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                Voir la Facture
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl flex flex-col items-center">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="float-right text-gray-500">
                            ✖
                        </button>
                        <iframe
                            src={fileUrl}
                            className="w-full h-[80vh] border rounded-lg shadow-sm"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InvoiceViewer;
