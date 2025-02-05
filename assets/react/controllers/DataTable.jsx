import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';

export default function DataTable({ Data, excludeCollum = [] }) {
    // Vérifier si Data est un tableau non vide
    if (!Array.isArray(Data) || Data.length === 0) {
        return <div>Aucune donnée à afficher</div>;
    }

    // Liste des colonnes filtrables en excluant les colonnes par défaut et celles spécifiées
    const defaultExclusions = ['showUrl', 'editUrl'];
    const exclusions = [...defaultExclusions, ...excludeCollum];
    const allColumns = Object.keys(Data[0]).filter(key => !exclusions.includes(key));

    // États pour le filtre en cours et les filtres appliqués
    // Initialiser filterColumn avec la première colonne disponible
    const [filterColumn, setFilterColumn] = useState(allColumns[0] || '');
    const [filterValue, setFilterValue] = useState('');
    const [appliedFilters, setAppliedFilters] = useState([]);

    // Ajoute un filtre à la liste si les champs sont valides
    const handleAddFilter = () => {
        if (filterColumn && filterValue.trim() !== '') {
            setAppliedFilters(prev => [...prev, { column: filterColumn, value: filterValue }]);
            setFilterValue('');
        }
    };

    // Permet d'ajouter le filtre en appuyant sur la touche "Entrée"
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && filterColumn && filterValue.trim() !== '') {
            handleAddFilter();
        }
    };

    // Supprime un filtre à l'index donné
    const handleRemoveFilter = (indexToRemove) => {
        setAppliedFilters(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Supprime tous les filtres
    const handleClearFilters = () => {
        setAppliedFilters([]);
    };

    // Filtrer les données en appliquant tous les filtres
    const filteredData = useMemo(() => {
        return Data.filter(row => {
            return appliedFilters.every(filter => {
                const cellValue = row[filter.column];
                if (cellValue === undefined) return false;
                return String(cellValue)
                    .toLowerCase()
                    .includes(filter.value.toLowerCase());
            });
        });
    }, [Data, appliedFilters]);

    // Générer dynamiquement les colonnes de base en excluant les clés définies
    const baseColumns = Object.keys(Data[0])
        .filter(key => !exclusions.includes(key))
        .map(key => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            sortable: true,
            flex: 1,
            width: 160,
        }));

    // Ajouter une colonne pour les actions
    const actionColumn = {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        width: 200,
        renderCell: (params) => (
            <div>
                <a href={params.row.showUrl} style={{ marginRight: '10px' }}>Show</a>
                <a href={params.row.editUrl}>Edit</a>
            </div>
        ),
    };

    // Combiner les colonnes générées avec la colonne d'actions
    const columns = [...baseColumns, actionColumn];

    return (
        <div>
            {/* Interface de filtrage personnalisée */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl
                    size="small"
                    sx={{ minWidth: 120, marginRight: 2, marginBottom: { xs: 1, sm: 0 } }}
                >
                    <InputLabel id="filter-column-label">Column</InputLabel>
                    <Select
                        labelId="filter-column-label"
                        value={filterColumn}
                        label="Column"
                        onChange={(e) => setFilterColumn(e.target.value)}
                    >
                        {allColumns.map(col => (
                            <MenuItem key={col} value={col}>
                                {col.charAt(0).toUpperCase() + col.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    size="small"
                    label="Filter Value"
                    placeholder="Enter filter value"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    sx={{ marginRight: 2, width: 150, marginBottom: { xs: 1, sm: 0 } }}
                />
                <Button
                    variant="contained"
                    onClick={handleAddFilter}
                    disabled={!filterColumn || filterValue.trim() === ''}
                    sx={{ marginRight: 2, height: '40px', marginBottom: { xs: 1, sm: 0 } }}
                >
                    Add Filter
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleClearFilters}
                    sx={{ height: '40px', marginBottom: { xs: 1, sm: 0 } }}
                >
                    Clear All Filters
                </Button>
            </div>

            {/* Affichage des filtres appliqués avec possibilité de suppression */}
            <div style={{ marginBottom: 20 }}>
                {appliedFilters.map((filter, index) => (
                    <Chip
                        key={index}
                        label={`${filter.column} contains "${filter.value}"`}
                        onDelete={() => handleRemoveFilter(index)}
                        sx={{ marginRight: 1, marginBottom: 1 }}
                    />
                ))}
            </div>

            {/* Tableau avec tri et pagination */}
            <Paper sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { page: 0, pageSize: 5 } },
                    }}
                    pageSizeOptions={[5, 10]}
                    disableColumnMenu
                    disableSelectionOnClick
                    sx={{ border: 0 }}
                />
            </Paper>
        </div>
    );
}
