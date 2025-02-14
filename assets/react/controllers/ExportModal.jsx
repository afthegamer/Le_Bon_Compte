import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CategoryInput from "./CategoryInput";

const ExportModal = ({ open, onClose, categories }) => {
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

    useEffect(() => {
        if (filters.category) {
            fetch(`/api/subcategories/by-name/${encodeURIComponent(filters.category)}`)
                .then((res) => res.json())
                .then((data) => {
                    setSubcategories([...(data.predefined || []), ...(data.user || [])]);
                })
                .catch((error) => console.error("Erreur de chargement des sous-catégories", error));
        } else {
            setSubcategories([]);
        }
    }, [filters.category]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };
    const handleCategoryChange = (value) => {
        setFilters((prev) => ({ ...prev, category: value, subcategory: "" }));
    };


    const fetchPreview = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/export/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            });
            const data = await response.json();
            setPreviewData(data);
        } catch (error) {
            console.error("Erreur lors du chargement de l'aperçu", error);
        }
        setLoading(false);
    };

    const exportData = async () => {
        const response = await fetch("/api/export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filters),
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `export.${filters.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };
    const handleSubcategoryChange = (value) => {
        setFilters((prev) => ({ ...prev, subcategory: value }));
    };


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Exporter les données</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField  name="startDate" label="Date début" type="date" slotProps={{inputLabel: { shrink: true }}} value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} />
                    <TextField name="endDate" label="Date fin" type="date" slotProps={{inputLabel: { shrink: true }}} value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} />
                    <CategoryInput
                        predefinedCategories={categories}
                        inputName="category"
                        subcatInputName="subcategory"
                        currentCategory={filters.category}
                        currentSubcategory={filters.subcategory}
                        onCategoryChange={handleCategoryChange}
                        onSubcategoryChange={handleSubcategoryChange} // Correction ici
                    />
                    <TextField name="minAmount" label="Montant min (€)" type="number" value={filters.minAmount} onChange={(e) => handleFilterChange("minAmount", e.target.value)} />
                    <TextField name="maxAmount" label="Montant max (€)" type="number" value={filters.maxAmount} onChange={(e) => handleFilterChange("maxAmount", e.target.value)} />
                    <FormControl>
                        <InputLabel>Type de transaction</InputLabel>
                        <Select name="transactionType" value={filters.transactionType} onChange={(e) => handleFilterChange("transactionType", e.target.value)} variant={"outlined"}>
                            <MenuItem value="">Tous</MenuItem>
                            <MenuItem value="income">Revenu 💵</MenuItem>
                            <MenuItem value="expense">Dépense 🛒</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <InputLabel>Format</InputLabel>
                        <Select name="format" value={filters.format} onChange={(e) => handleFilterChange("format", e.target.value)} variant={"outlined"}>
                            <MenuItem value="csv">CSV</MenuItem>
                            <MenuItem value="xlsx">Excel</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" onClick={fetchPreview} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : "Prévisualiser"}
                    </Button>
                </Box>
                {previewData.length > 0 && (
                    <Box mt={2}>
                        <DataGrid
                            columns={Object.keys(previewData[0] || {}).map((key) => ({ field: key, headerName: key, flex: 1 }))}
                            rows={previewData.map((row, index) => ({ id: index, ...row }))}
                            autoPageSize
                        />
                    </Box>
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
