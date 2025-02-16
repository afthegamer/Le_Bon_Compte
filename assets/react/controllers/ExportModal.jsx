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

    // États pour les filtres dynamiques appliqués (pour les autres filtres)
    const [appliedFilters, setAppliedFilters] = useState([]);
    // États pour le filtre en cours de création (pour les autres filtres)
    const [currentFilterColumn, setCurrentFilterColumn] = useState("");
    const [currentFilterValue, setCurrentFilterValue] = useState("");

    // États pour la prévisualisation
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pour les filtres "Catégorie" et "Sous-catégorie"
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
    // États pour la saisie du filtre "Catégorie" et "Sous-catégorie"
    const [currentCategoryValue, setCurrentCategoryValue] = useState("");
    const [currentSubcategoryValue, setCurrentSubcategoryValue] = useState("");

    const { t } = useTranslation();

    // Définition des filtres dynamiques pour les autres champs
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
    ], [userProfiles]);

    // On ajoute "category" et "subcategory" dans la liste globale des filtres
    const allFiltersList = useMemo(() => [
        ...dynamicFiltersList,
        { key: "category", label: "Catégorie", type: "autocomplete", options: categoryOptions },
       // { key: "subcategory", label: "Sous-catégorie", type: "select", options: subcategoryOptions },
    ], [dynamicFiltersList, categoryOptions, subcategoryOptions]);

    const availableFilterOptions = useMemo(() => {
        console.log("Options de filtres disponibles :", allFiltersList);
        return allFiltersList;
    }, [allFiltersList]);

    // Récupération de la définition du filtre sélectionné
    const selectedFilterDefinition = useMemo(() => {
        const def = allFiltersList.find((f) => f.key === currentFilterColumn);
        console.log("Définition du filtre sélectionné :", def);
        return def;
    }, [allFiltersList, currentFilterColumn]);

    // Lorsqu'une catégorie est sélectionnée (filtre "category"), récupérer les sous-catégories
    useEffect(() => {
        if (currentFilterColumn === "category" && currentCategoryValue) {
            fetch(`/api/subcategories/by-name/${encodeURIComponent(currentCategoryValue)}`)
                .then((res) => res.json())
                .then((data) => {
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
    }, [currentFilterColumn, currentCategoryValue]);

    // Ajout d'un filtre
    const handleAddFilter = useCallback(() => {
        if (!currentFilterColumn) return;
        if (currentFilterColumn === "category") {
            if (!currentCategoryValue) return;
            console.log("Ajout du filtre catégorie :", currentCategoryValue, currentSubcategoryValue);
            // Pour "category", on ajoute toujours un nouvel objet afin de pouvoir avoir plusieurs paires
            setAppliedFilters((prev) => [
                ...prev,
                { column: "category", value: currentCategoryValue, subcategory: currentSubcategoryValue },
            ]);
            setCurrentCategoryValue("");
            setCurrentSubcategoryValue("");
            setCurrentFilterColumn("");
        } else {
            if (currentFilterValue === "") return;
            console.log("Ajout du filtre :", currentFilterColumn, currentFilterValue);
            setAppliedFilters((prev) => [
                ...prev,
                { column: currentFilterColumn, value: currentFilterValue },
            ]);
            setCurrentFilterColumn("");
            setCurrentFilterValue("");
        }
    }, [currentFilterColumn, currentFilterValue, currentCategoryValue, currentSubcategoryValue]);

    // Suppression d'un filtre appliqué
    const handleRemoveFilter = useCallback((indexToRemove) => {
        console.log("Suppression du filtre à l'index :", indexToRemove);
        setAppliedFilters((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
    }, []);

    // Construction de l'objet des filtres à envoyer à l'API
    const buildFiltersObject = useCallback(() => {
        const filters = {};
        // Pour tous les filtres autres que "category"
        appliedFilters.forEach((filter) => {
            if (filter.column !== "category") {
                const def = allFiltersList.find((f) => f.key === filter.column);
                const value = def && def.type === "number" ? Number(filter.value) : filter.value;
                if (value !== "" && value !== null && value !== undefined) {
                    if (filters[filter.column] !== undefined) {
                        if (!Array.isArray(filters[filter.column])) {
                            filters[filter.column] = [filters[filter.column]];
                        }
                        filters[filter.column].push(value);
                    } else {
                        filters[filter.column] = value;
                    }
                }
            }
        });
        // Pour les filtres "category", regroupons toutes les paires
        const catFilters = appliedFilters.filter(f => f.column === "category");
        if (catFilters.length > 0) {
            filters.category = catFilters.map(f => f.value);
            filters.subcategory = catFilters.map(f => f.subcategory || '');
        }
        filters.format = exportFormat;
        console.log("Objet des filtres envoyé à l'API :", filters);
        return filters;
    }, [appliedFilters, exportFormat, allFiltersList]);

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
                                // Pour "category", on réinitialise les valeurs spécifiques
                                if (e.target.value === "category") {
                                    setCurrentCategoryValue("");
                                    setCurrentSubcategoryValue("");
                                } else {
                                    setCurrentFilterValue("");
                                }
                            }}
                         variant="outlined">
                            {availableFilterOptions.map((filter) => (
                                <MenuItem key={filter.key} value={filter.key}>
                                    {filter.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedFilterDefinition && selectedFilterDefinition.key === "category" ? (
                        // Affichage de deux champs côte à côte pour catégorie et sous-catégorie
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Autocomplete
                                freeSolo
                                options={selectedFilterDefinition.options}
                                getOptionLabel={(option) =>
                                    typeof option === "string" ? option : option.label
                                }
                                value={currentCategoryValue}
                                onInputChange={(event, newInputValue) => {
                                    console.log("Saisie (autocomplete category):", newInputValue);
                                    setCurrentCategoryValue(newInputValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Catégorie"
                                        size="small"
                                        sx={{ minWidth: 150 }}
                                    />
                                )}
                            />
                            {/* Affiche le champ sous-catégorie uniquement si des options sont disponibles */}
                            {subcategoryOptions.length > 0 && (
                                <Autocomplete
                                    freeSolo
                                    options={subcategoryOptions}
                                    getOptionLabel={(option) =>
                                        typeof option === "string" ? option : option.label
                                    }
                                    value={currentSubcategoryValue}
                                    onInputChange={(event, newInputValue) => {
                                        console.log("Saisie (autocomplete subcategory):", newInputValue);
                                        setCurrentSubcategoryValue(newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Sous-catégorie (optionnel)"
                                            size="small"
                                            sx={{ minWidth: 150 }}
                                        />
                                    )}
                                />
                            )}
                        </Box>
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
                        disabled={
                            !currentFilterColumn ||
                            (currentFilterColumn === "category"
                                ? currentCategoryValue === ""
                                : currentFilterValue === "")
                        }
                        sx={{ height: "40px" }}
                    >
                        Ajouter
                    </Button>
                </Box>

                {/* Affichage des filtres appliqués sous forme de puces */}
                <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {appliedFilters.map((filter, index) => {
                        let displayValue = filter.value;
                        if (filter.column === "userProfile") {
                            const user = userProfiles.find(
                                (profile) => profile.id.toString() === filter.value
                            );
                            if (user) {
                                displayValue = `${user.firstName} ${user.lastName}`;
                            }
                        }
                        if (filter.column === "category") {
                            displayValue = filter.value;
                            if (filter.subcategory) {
                                displayValue += ` / Sous-catégorie : ${filter.subcategory}`;
                            }
                        }
                        const translatedLabel = t(
                            `filters.${filter.column}`,
                            translationMapping[filter.column] || filter.column
                        );
                        return (
                            <Chip
                                key={`${filter.column}-${index}`}
                                label={`${translatedLabel} : ${displayValue}`}
                                onDelete={() => handleRemoveFilter(index)}
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
