import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Select, MenuItem, Typography } from "@mui/material";

const MapperCSV = () => {
    const [csvData, setCsvData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [mapping, setMapping] = useState({});

    const predefinedMappings = {
        "Sous Categorie": "SubcategoryEntity",
        Categorie: "CategoryEntity",
        Debit: "ExpenseEntity",
        Credit: "IncomeEntity",
        Date: "Date",
        "Date de comptabilisation": "Date",
        Libelle: "Name",
        "Libelle simplifie": "Name",
        "Type operation": "Type",
    };

    useEffect(() => {
        // Synchroniser le mapping avec le champ caché
        const mappingInput = document.getElementById("mapping");
        if (mappingInput) {
            mappingInput.value = JSON.stringify(mapping);
        }
    }, [mapping]);


    const handleFileUpload = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        // Synchronisation avec le champ de formulaire HTML
        const fileInput = document.getElementById("csv_file");
        if (fileInput) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(selectedFile);
            fileInput.files = dataTransfer.files; // Ajoute le fichier au champ de formulaire
        }

        // Lire le fichier pour l'aperçu
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const parsedData = Papa.parse(content, {
                header: true,
                skipEmptyLines: true,
            });

            if (parsedData.errors.length === 0) {
                setCsvData(parsedData.data.slice(0, 5)); // Limiter aux 5 premières lignes
                const csvHeaders = Object.keys(parsedData.data[0]);
                setHeaders(csvHeaders);

                const initialMapping = {};
                csvHeaders.forEach((header) => {
                    const matchingEntity = Object.keys(predefinedMappings).find(
                        (key) => header.trim().toLowerCase() === key.toLowerCase()
                    );
                    initialMapping[header] = matchingEntity ? predefinedMappings[matchingEntity] : undefined;
                });

                setMapping(initialMapping);
            } else {
                console.error("Error parsing CSV:", parsedData.errors);
            }
        };
        reader.readAsText(selectedFile);
    };

    const handleMappingChange = (header, value) => {
        setMapping((prev) => ({
            ...prev,
            [header]: value,
        }));
    };

    const columns = headers.map((header) => ({
        field: header,
        headerName: header,
        flex: 1,
        minWidth: Math.max(header.length * 10, 100),
    }));

    const rows = csvData.map((row, index) => ({ id: index, ...row }));

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Importer et Mapper un Fichier CSV
            </Typography>
            <Button
                variant="contained"
                component="label"
                sx={{ mb: 4 }}
            >
                Charger un fichier CSV
                <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
            </Button>

            {headers.length > 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Mapper les Colonnes
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
                        {headers.map((header) => (
                            <Box key={header} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography variant="body1" sx={{ width: "200px" }}>
                                    {header}
                                </Typography>
                                <Select
                                    value={mapping[header] || ""}
                                    onChange={(e) => handleMappingChange(header, e.target.value)}
                                    displayEmpty
                                    sx={{ flex: 1 }}
                                 variant="outlined">
                                    <MenuItem value="">Aucun</MenuItem>
                                    <MenuItem value="CategoryEntity">Catégorie</MenuItem>//
                                    <MenuItem value="Date">Date</MenuItem>//
                                    <MenuItem value="ExpenseEntity">Dépense</MenuItem>//
                                    <MenuItem value="IncomeEntity">Revenu</MenuItem>//
                                    <MenuItem value="Name">Libelle</MenuItem>//
                                    <MenuItem value="SubcategoryEntity">Sous Catégorie</MenuItem>//
                                    <MenuItem value="Type">Type operation</MenuItem>//
                                </Select>
                            </Box>
                        ))}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                        Aperçu des données (5 premières lignes)
                    </Typography>
                    <Box sx={{ minHeight: 400, height: "auto", width: "100%" }}>
                        <DataGrid
                            columns={columns}
                            rows={rows}
                            disableSelectionOnClick
                        />
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 4 }}
                        type="submit" // Soumet le formulaire parent HTML
                    >
                        Soumettre le Mapping
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default MapperCSV;
