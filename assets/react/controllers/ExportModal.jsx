import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Box,
    Typography,
    Chip,
    Autocomplete,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";

const ExportModal = ({ open, onClose, categories, userProfiles }) => {
    // État pour le format d'export (CSV ou Excel)
    const [exportFormat, setExportFormat] = useState("csv");

    // États pour les filtres dynamiques appliqués (hors "category" et "subcategory")
    const [appliedFilters, setAppliedFilters] = useState([]);
    // États pour le filtre en cours de création (hors "category" et "subcategory")
    const [currentFilterColumn, setCurrentFilterColumn] = useState("");
    const [currentFilterValue, setCurrentFilterValue] = useState("");

    // États pour la prévisualisation
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pour les filtres "category" et "subcategory"
    // Construction des options de catégorie à partir de la prop categories
    const categoryOptions = useMemo(() => {
        if (categories && typeof categories === "object" && !Array.isArray(categories)) {
            const predefinedList = (categories.predefined || []).map((cat) => ({
                value: cat.toString(),
                label: cat.toString(),
            }));
            const userList = (categories.user || [])
                .filter((userCat) =>
                    !(categories.predefined || []).some(
                        (preCat) => preCat.toLowerCase() === userCat.toLowerCase()
                    )
                )
                .map((cat) => ({ value: cat.toString(), label: cat.toString() }));
            return [...predefinedList, ...userList];
        } else if (Array.isArray(categories)) {
            return categories.map((cat) => ({ value: cat.toString(), label: cat.toString() }));
        }
        return [];
    }, [categories]);

    // Liste des options de sous-catégorie (initialement vide)
    const [subcategoryOptions, setSubcategoryOptions] = useState([]);

    const { t } = useTranslation();

    // Définition des filtres dynamiques, incluant "category" et "subcategory"
    // Pour le filtre "category", nous utilisons le type "autocomplete"
    const dynamicFiltersList = useMemo(() => [
        { key: "startDate", label: "Date de début", type: "date" },
        { key: "endDate", label: "Date de fin", type: "date" },
        { key: "minAmount", label: "Montant minimum", type: "number" },
        { key: "maxAmount", label: "Montant maximum", type: "number" },
        {
            key: "transactionType",
            label: "Type de transaction",
            type: "select",
            options: [
                { value: "", label: "Tous" },
                { value: "income", label: "Revenu 💵" },
                { value: "expense", label: "Dépense 🛒" },
            ],
        },
        {
            key: "userProfile",
            label: "Profil utilisateur",
            type: "select",
            options: userProfiles.map((profile) => ({
                value: profile.id.toString(),
                label: `${profile.firstName} ${profile.lastName}`,
            })),
        },
        {
            key: "category",
            label: "Catégorie",
            type: "autocomplete", // Changement ici pour utiliser Autocomplete
            options: categoryOptions,
        },
        {
            key: "subcategory",
            label: "Sous-catégorie",
            type: "select",
            options: subcategoryOptions,
        },
    ], [userProfiles, categoryOptions, subcategoryOptions]);

    // Calcul des options de filtres disponibles (on retire ceux déjà appliqués)
    const availableFilterOptions = useMemo(() => {
        const options = dynamicFiltersList.filter(
            (filter) => !appliedFilters.some((applied) => applied.column === filter.key)
        );
        console.log("Options de filtres disponibles :", options);
        return options;
    }, [dynamicFiltersList, appliedFilters]);

    // Récupération de la définition du filtre sélectionné
    const selectedFilterDefinition = useMemo(() => {
        const def = dynamicFiltersList.find((f) => f.key === currentFilterColumn);
        console.log("Définition du filtre sélectionné :", def);
        return def;
    }, [dynamicFiltersList, currentFilterColumn]);

    // Lorsqu'un filtre "category" est appliqué, on récupère dynamiquement les sous-catégories
    useEffect(() => {
        const catFilter = appliedFilters.find((f) => f.column === "category");
        if (catFilter && catFilter.value) {
            fetch(`/api/subcategories/by-name/${encodeURIComponent(catFilter.value)}`)
                .then((res) => res.json())
                .then((data) => {
                    // On s'attend à recevoir soit des chaînes, soit des objets { id, name }
                    const merged = [...(data.predefined || []), ...(data.user || [])];
                    const opts = merged.map((subcat) => {
                        if (typeof subcat === "object" && subcat.name) {
                            return { value: subcat.name.toString(), label: subcat.name.toString() };
                        }
                        return { value: subcat.toString(), label: subcat.toString() };
                    });
                    setSubcategoryOptions(opts);
                })
                .catch((error) =>
                    console.error("Erreur lors du chargement des sous-catégories", error)
                );
        } else {
            setSubcategoryOptions([]);
        }
    }, [appliedFilters]);

    // Ajout du filtre courant dans la liste des filtres appliqués
    const handleAddFilter = useCallback(() => {
        if (!currentFilterColumn || currentFilterValue === "") return;
        console.log("Ajout du filtre :", currentFilterColumn, currentFilterValue);
        setAppliedFilters((prev) => [
            ...prev,
            { column: currentFilterColumn, value: currentFilterValue },
        ]);
        setCurrentFilterColumn("");
        setCurrentFilterValue("");
    }, [currentFilterColumn, currentFilterValue]);

    // Suppression d'un filtre appliqué
    const handleRemoveFilter = useCallback((columnToRemove) => {
        console.log("Suppression du filtre :", columnToRemove);
        setAppliedFilters((prev) =>
            prev.filter((filter) => filter.column !== columnToRemove)
        );
    }, []);

    // Construction de l'objet des filtres à envoyer à l'API
    const buildFiltersObject = useCallback(() => {
        const filters = {};
        dynamicFiltersList.forEach((filterDef) => {
            filters[filterDef.key] = filterDef.type === "number" ? 0 : "";
        });
        appliedFilters.forEach((filter) => {
            const def = dynamicFiltersList.find((f) => f.key === filter.column);
            if (def && def.type === "number") {
                filters[filter.column] = Number(filter.value);
            } else {
                filters[filter.column] = filter.value;
            }
        });
        filters.format = exportFormat;
        console.log("Objet des filtres envoyé à l'API :", filters);
        return filters;
    }, [appliedFilters, exportFormat, dynamicFiltersList]);

    // Récupération des données de prévisualisation
    const fetchPreview = async () => {
        setLoading(true);
        console.log("Lancement de la prévisualisation...");
        try {
            const response = await fetch("/api/export/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildFiltersObject()),
            });
            const data = await response.json();
            console.log("Réponse de la prévisualisation :", data);
            if (Array.isArray(data) && data.length > 0) {
                setPreviewData(data.map((item, index) => ({ ...item, id: index })));
            } else {
                setPreviewData([]);
            }
        } catch (error) {
            console.error("Erreur lors du chargement de l'aperçu", error);
        }
        setLoading(false);
    };

    // Fonction d'export
    const exportData = async () => {
        console.log("Export des données avec les filtres :", buildFiltersObject());
        try {
            const response = await fetch("/api/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildFiltersObject()),
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `export.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            onClose();
        } catch (error) {
            console.error("Erreur lors de l'export", error);
        }
    };

    const translationMapping = {
        startDate: "Date de début",
        endDate: "Date de fin",
        minAmount: "Montant minimum",
        maxAmount: "Montant maximum",
        transactionType: "Type de transaction",
        userProfile: "Profil utilisateur",
        category: "Catégorie",
        subcategory: "Sous-catégorie",
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Exporter les données</DialogTitle>
            <DialogContent>
                {/* Zone de création des filtres dynamiques */}
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="select-filter-label">Filtre</InputLabel>
                        <Select
                            labelId="select-filter-label"
                            value={currentFilterColumn}
                            label="Filtre"
                            onChange={(e) => {
                                console.log("Sélection du filtre :", e.target.value);
                                setCurrentFilterColumn(e.target.value);
                                setCurrentFilterValue("");
                            }}
                         variant="outlined">
                            {availableFilterOptions.map((filter) => (
                                <MenuItem key={filter.key} value={filter.key}>
                                    {filter.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedFilterDefinition && selectedFilterDefinition.type === "autocomplete" ? (
                        <Autocomplete
                            freeSolo
                            options={selectedFilterDefinition.options}
                            getOptionLabel={(option) =>
                                typeof option === "string" ? option : option.label
                            }
                            value={currentFilterValue}
                            onInputChange={(event, newInputValue) => {
                                console.log("Saisie (autocomplete category):", newInputValue);
                                setCurrentFilterValue(newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={selectedFilterDefinition.label}
                                    size="small"
                                    sx={{ minWidth: 150 }}
                                />
                            )}
                        />
                    ) : selectedFilterDefinition && selectedFilterDefinition.type === "date" ? (
                        <TextField
                            size="small"
                            type="date"
                            label={selectedFilterDefinition.label}
                            value={currentFilterValue}
                            onChange={(e) => {
                                console.log("Saisie (date):", e.target.value);
                                setCurrentFilterValue(e.target.value);
                            }}
                            sx={{ minWidth: 150 }}
                        />
                    ) : selectedFilterDefinition && selectedFilterDefinition.type === "number" ? (
                        <TextField
                            size="small"
                            type="number"
                            label={selectedFilterDefinition.label}
                            value={currentFilterValue}
                            onChange={(e) => {
                                console.log("Saisie (number):", e.target.value);
                                setCurrentFilterValue(e.target.value);
                            }}
                            sx={{ minWidth: 150 }}
                        />
                    ) : selectedFilterDefinition && selectedFilterDefinition.type === "text" ? (
                        <TextField
                            size="small"
                            type="text"
                            label={selectedFilterDefinition.label}
                            value={currentFilterValue}
                            onChange={(e) => {
                                console.log("Saisie (text):", e.target.value);
                                setCurrentFilterValue(e.target.value);
                            }}
                            sx={{ minWidth: 150 }}
                        />
                    ) : selectedFilterDefinition && selectedFilterDefinition.type === "select" ? (
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id="select-value-label">{selectedFilterDefinition.label}</InputLabel>
                            <Select
                                labelId="select-value-label"
                                value={currentFilterValue}
                                label={selectedFilterDefinition.label}
                                onChange={(e) => {
                                    console.log("Saisie (select):", e.target.value);
                                    setCurrentFilterValue(e.target.value);
                                }}
                             variant="outlined">
                                {selectedFilterDefinition.options.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : null}

                    <Button
                        variant="contained"
                        onClick={handleAddFilter}
                        disabled={!currentFilterColumn || currentFilterValue === ""}
                        sx={{ height: "40px" }}
                    >
                        Ajouter
                    </Button>
                </Box>

                {/* Affichage des filtres appliqués sous forme de puces */}
                <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {appliedFilters.map((filter) => {
                        let displayValue = filter.value;
                        if (filter.column === "userProfile") {
                            const user = userProfiles.find(
                                (profile) => profile.id.toString() === filter.value
                            );
                            if (user) {
                                displayValue = `${user.firstName} ${user.lastName}`;
                            }
                        }
                        const translatedLabel = t(
                            `filters.${filter.column}`,
                            translationMapping[filter.column] || filter.column
                        );
                        return (
                            <Chip
                                key={filter.column}
                                label={`${translatedLabel} : ${displayValue}`}
                                onDelete={() => handleRemoveFilter(filter.column)}
                            />
                        );
                    })}
                </Box>

                {/* Sélection du format d'export */}
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="select-format-label">Format</InputLabel>
                        <Select
                            labelId="select-format-label"
                            value={exportFormat}
                            label="Format"
                            onChange={(e) => {
                                console.log("Changement de format:", e.target.value);
                                setExportFormat(e.target.value);
                            }}
                         variant="outlined">
                            <MenuItem value="csv">CSV</MenuItem>
                            <MenuItem value="xlsx">Excel</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        onClick={fetchPreview}
                        disabled={loading}
                        sx={{ height: "40px" }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Prévisualiser"}
                    </Button>
                </Box>

                {/* Prévisualisation dans un DataGrid */}
                {previewData.length > 0 ? (
                    <Box mt={2} style={{ height: 400, width: "100%" }}>
                        <DataGrid
                            columns={Object.keys(previewData[0])
                                .filter((key) => key !== "id")
                                .map((key) => ({ field: key, headerName: key, flex: 1 }))}
                            rows={previewData}
                            autoPageSize
                        />
                    </Box>
                ) : (
                    <Typography variant="body1" color="textSecondary" mt={2}>
                        ⚠️ Aucune donnée à afficher pour cette sélection.
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Annuler</Button>
                <Button variant="contained" color="primary" onClick={exportData}>
                    Télécharger
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportModal;
