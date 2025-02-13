import React, { useState } from "react";
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

const ExportModal = ({ open, onClose }) => {
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        category: "",
        subcategory: "",
        minAmount: "",
        maxAmount: "",
        transactionType: "", // Ajout du filtre Type de transaction
        format: "csv",
    });
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
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

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Exporter les données</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField name="startDate" label="Date début" type="date" InputLabelProps={{ shrink: true }} value={filters.startDate} onChange={handleFilterChange} />
                    <TextField name="endDate" label="Date fin" type="date" InputLabelProps={{ shrink: true }} value={filters.endDate} onChange={handleFilterChange} />
                    <TextField name="category" label="Catégorie" value={filters.category} onChange={handleFilterChange} />
                    <TextField name="subcategory" label="Sous-catégorie" value={filters.subcategory} onChange={handleFilterChange} />
                    <TextField name="minAmount" label="Montant min (€)" type="number" value={filters.minAmount} onChange={handleFilterChange} />
                    <TextField name="maxAmount" label="Montant max (€)" type="number" value={filters.maxAmount} onChange={handleFilterChange} />
                    <FormControl>
                        <InputLabel>Type de transaction</InputLabel>
                        <Select name="transactionType" value={filters.transactionType} onChange={handleFilterChange}>
                            <MenuItem value="">Tous</MenuItem>
                            <MenuItem value="income">Revenu 💵</MenuItem>
                            <MenuItem value="expense">Dépense 🛒</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <InputLabel>Format</InputLabel>
                        <Select name="format" value={filters.format} onChange={handleFilterChange}>
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
                            autoHeight
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
