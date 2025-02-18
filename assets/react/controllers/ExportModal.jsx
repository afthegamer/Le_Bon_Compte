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
    // State for the export format (CSV or Excel)
    const [exportFormat, setExportFormat] = useState("csv");

    // States for dynamic filters applied (for other filters)
    const [appliedFilters, setAppliedFilters] = useState([]);
    // States for the filter being created (for other filters)
    const [currentFilterColumn, setCurrentFilterColumn] = useState("");
    const [currentFilterValue, setCurrentFilterValue] = useState("");

    // States for preview
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);

    // For "category" and "subcategory" filters
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

    // List of subcategory options (initially empty)
    const [subcategoryOptions, setSubcategoryOptions] = useState([]);
    // States for entry of the filter "category" and "subcategory"
    const [currentCategoryValue, setCurrentCategoryValue] = useState("");
    const [currentSubcategoryValue, setCurrentSubcategoryValue] = useState("");

    const { t } = useTranslation();

    // Definition of dynamic filters for other fields
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

    // we add "Category" and "Subcategory" to the overall list of filters
    const allFiltersList = useMemo(() => [
        ...dynamicFiltersList,
        { key: "category", label: "Catégorie", type: "autocomplete", options: categoryOptions },
    ], [dynamicFiltersList, categoryOptions, subcategoryOptions]);

    const availableFilterOptions = useMemo(() => {
        return allFiltersList;
    }, [allFiltersList]);

    // Recovery of the definition of the selected filter
    const selectedFilterDefinition = useMemo(() => {
        const def = allFiltersList.find((f) => f.key === currentFilterColumn);
        return def;
    }, [allFiltersList, currentFilterColumn]);

    // When a category is selected ("Category" filter), recover the subcategories
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

    // Adding a filter
    const handleAddFilter = useCallback(() => {
        if (!currentFilterColumn) return;
        if (currentFilterColumn === "category") {
            if (!currentCategoryValue) return;
            // For "Category", we always add a new object in order to be able to have several pairs
            setAppliedFilters((prev) => [
                ...prev,
                { column: "category", value: currentCategoryValue, subcategory: currentSubcategoryValue },
            ]);
            setCurrentCategoryValue("");
            setCurrentSubcategoryValue("");
            setCurrentFilterColumn("");
        } else {
            if (currentFilterValue === "") return;
            setAppliedFilters((prev) => [
                ...prev,
                { column: currentFilterColumn, value: currentFilterValue },
            ]);
            setCurrentFilterColumn("");
            setCurrentFilterValue("");
        }
    }, [currentFilterColumn, currentFilterValue, currentCategoryValue, currentSubcategoryValue]);

    // Delete a applied filter
    const handleRemoveFilter = useCallback((indexToRemove) => {
        setAppliedFilters((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
    }, []);

    // Construction of the object of the filters to be sent to the API
    const buildFiltersObject = useCallback(() => {
        const filters = {};
        // For all filters other than "Category"
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
        // For "Category" filters, let us bring together all the pairs
        const catFilters = appliedFilters.filter(f => f.column === "category");
        if (catFilters.length > 0) {
            filters.category = catFilters.map(f => f.value);
            filters.subcategory = catFilters.map(f => f.subcategory || '');
        }
        filters.format = exportFormat;
        return filters;
    }, [appliedFilters, exportFormat, allFiltersList]);

    // Recovery of preview data
    const fetchPreview = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/export/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildFiltersObject()),
            });
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                setPreviewData(
                    data.map((item, index) => ({
                        ...item,
                        id: index,
                        categoryEntity: item.categoryEntity && typeof item.categoryEntity === "object"
                            ? item.categoryEntity.name || JSON.stringify(item.categoryEntity)
                            : item.categoryEntity,
                        subcategoryEntity: item.subcategoryEntity && typeof item.subcategoryEntity === "object"
                            ? item.subcategoryEntity.name || JSON.stringify(item.subcategoryEntity)
                            : item.subcategoryEntity,
                        userProfileEntity: item.userProfileEntity && typeof item.userProfileEntity === "object"
                            ? `${item.userProfileEntity.firstName} ${item.userProfileEntity.lastName}` || JSON.stringify(item.userProfileEntity)
                            : item.userProfileEntity,
                    }))
                );

            } else {
                setPreviewData([]);
            }
        } catch (error) {
            console.error("Erreur lors du chargement de l'aperçu", error);
        }
        setLoading(false);
    };

    // Export function
    const exportData = async () => {
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
                {/* Dynamic filters creation area */}
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="select-filter-label">Filtre</InputLabel>
                        <Select
                            labelId="select-filter-label"
                            value={currentFilterColumn}
                            label="Filtre"
                            onChange={(e) => {
                                setCurrentFilterColumn(e.target.value);
                                // For "Category", we reset the specific values
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
                        // Display of two fields side by side for category and subcategory
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Autocomplete
                                freeSolo
                                options={selectedFilterDefinition.options}
                                getOptionLabel={(option) =>
                                    typeof option === "string" ? option : option.label
                                }
                                value={currentCategoryValue}
                                onInputChange={(event, newInputValue) => {
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
                            {/* Displays the subcategory field only if options are available */}
                            {subcategoryOptions.length > 0 && (
                                <Autocomplete
                                    freeSolo
                                    options={subcategoryOptions}
                                    getOptionLabel={(option) =>
                                        typeof option === "string" ? option : option.label
                                    }
                                    value={currentSubcategoryValue}
                                    onInputChange={(event, newInputValue) => {
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

                {/* Display of filters applied in the form of fleas */}
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

                {/* Export format selection */}
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="select-format-label">Format</InputLabel>
                        <Select
                            labelId="select-format-label"
                            value={exportFormat}
                            label="Format"
                            onChange={(e) => {
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

                {/* Preview in a datagrid */}
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
