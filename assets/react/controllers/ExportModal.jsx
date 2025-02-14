import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CategoryInput from "./CategoryInput";

const ExportModal = ({ open, onClose, categories }) => {
    // Vos filtres spécifiques à l'export
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        category: "",
        subcategory: "",
        minAmount: "",
        maxAmount: "",
        transactionType: "",
        format: "csv",
    });
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [subcategories, setSubcategories] = useState([]);
    // Pour afficher les filtres appliqués sous forme de Chip, par exemple
    const [appliedFilters, setAppliedFilters] = useState([]);

    // Gestion des sous-catégories comme dans votre version existante
    useEffect(() => {
        if (filters.category) {
            fetch(`/api/subcategories/by-name/${encodeURIComponent(filters.category)}`)
                .then((res) => res.json())
                .then((data) => {
                    setSubcategories([...(data.predefined || []), ...(data.user || [])]);
                })
                .catch((error) =>
                    console.error("Erreur de chargement des sous-catégories", error)
                );
        } else {
            setSubcategories([]);
        }
    }, [filters.category]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        console.log(`Filtre modifié : ${key} = ${value}`);
    };

    const handleCategoryChange = (value) => {
        setFilters((prev) => ({ ...prev, category: value, subcategory: "" }));
        console.log("Catégorie sélectionnée :", value);
    };

    const handleSubcategoryChange = (value) => {
        setFilters((prev) => ({ ...prev, subcategory: value }));
        console.log("Sous-catégorie sélectionnée :", value);
    };

    // Pour garder trace des filtres "appliqués" (vous pouvez choisir d'afficher un Chip par filtre)
    const addAppliedFilter = useCallback(() => {
        // Ici, vous pouvez définir comment combiner les filtres à afficher en Chip
        setAppliedFilters(Object.entries(filters).filter(([_, v]) => v !== ""));
    }, [filters]);

    // Appel à addAppliedFilter dès que les filtres changent (optionnel)
    useEffect(() => {
        addAppliedFilter();
    }, [filters, addAppliedFilter]);

    const fetchPreview = async () => {
        setLoading(true);
        console.log("Envoi des filtres pour la prévisualisation :", filters);
        try {
            const response = await fetch("/api/export/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            });
            const data = await response.json();
            console.log("Données de prévisualisation reçues :", data);
            if (Array.isArray(data) && data.length > 0) {
                setPreviewData(data.map((item, index) => ({ id: index, ...item })));
            } else {
                setPreviewData([]);
            }
        } catch (error) {
            console.error("Erreur lors du chargement de l'aperçu", error);
        }
        setLoading(false);
    };

    const exportData = async () => {
        console.log("Exportation avec les filtres :", filters);
        const response = await fetch("/api/export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filters),
        });
        const blob = await response.blob();
        console.log("Blob reçu pour l'export :", blob);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `export.${filters.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Exporter les données</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <TextField
                        size="small"
                        name="startDate"
                        label="Date début"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        sx={{ minWidth: 150 }}
                    />
                    <TextField
                        size="small"
                        name="endDate"
                        label="Date fin"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        sx={{ minWidth: 150 }}
                    />
                    <CategoryInput
                        predefinedCategories={categories.categories}
                        inputName="category"
                        subcatInputName="subcategory"
                        currentCategory={filters.category}
                        currentSubcategory={filters.subcategory}
                        onCategoryChange={handleCategoryChange}
                        onSubcategoryChange={handleSubcategoryChange}
                    />
                    <TextField
                        size="small"
                        name="minAmount"
                        label="Montant min (€)"
                        type="number"
                        value={filters.minAmount}
                        onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                        sx={{ minWidth: 150 }}
                    />
                    <TextField
                        size="small"
                        name="maxAmount"
                        label="Montant max (€)"
                        type="number"
                        value={filters.maxAmount}
                        onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                        sx={{ minWidth: 150 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Type de transaction</InputLabel>
                        <Select
                            name="transactionType"
                            value={filters.transactionType}
                            onChange={(e) => handleFilterChange("transactionType", e.target.value)}
                            label="Type de transaction"
                            variant="outlined">
                            <MenuItem value="">Tous</MenuItem>
                            <MenuItem value="income">Revenu 💵</MenuItem>
                            <MenuItem value="expense">Dépense 🛒</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Format</InputLabel>
                        <Select
                            name="format"
                            value={filters.format}
                            onChange={(e) => handleFilterChange("format", e.target.value)}
                            label="Format"
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

                <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {appliedFilters.map(([key, value], index) => (
                        <Chip
                            key={index}
                            label={`${key} : ${value}`}
                            onDelete={() =>
                                handleFilterChange(key, "")
                            }
                        />
                    ))}
                </Box>

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
