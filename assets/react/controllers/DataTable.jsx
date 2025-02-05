import * as React from 'react';
import { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip, Autocomplete } from '@mui/material';

// Expression régulière pour détecter un format de date "YYYY-MM-DD HH:MM:SS"
const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

// Fonction pour formater la date en "DD/MM/YYYY"
const formatDate = (dateString) => {
    if (!dateString) return '';
    const [datePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
};

export default function DataTable({ Data, excludeCollum = [], filterableExcluded = [], noDynamicList = [] }) {
    // Vérifier si Data est un tableau non vide
    if (!Array.isArray(Data) || Data.length === 0) {
        return <div>Aucune donnée à afficher</div>;
    }

    // Liste des colonnes à exclure pour l'affichage dans le tableau
    const defaultExclusions = ['showUrl', 'editUrl'];
    const exclusions = [...defaultExclusions, ...excludeCollum];

    // Calcul des colonnes disponibles pour le filtrage :
    // On part des clés du premier élément en retirant les colonnes exclues pour l'affichage,
    // puis on ajoute celles spécifiées dans filterableExcluded
    const allFilterableColumns = Array.from(
        new Set([
            ...Object.keys(Data[0]).filter(key => !exclusions.includes(key)),
            ...filterableExcluded
        ])
    );

    // États pour le filtre en cours et les filtres appliqués
    // Initialiser filterColumn avec la première colonne disponible dans le filtre
    const [filterColumn, setFilterColumn] = useState(allFilterableColumns[0] || '');
    const [filterValue, setFilterValue] = useState('');
    const [appliedFilters, setAppliedFilters] = useState([]);

    // Détecte si la colonne de filtrage sélectionnée est de type date
    const isDateFilter = filterColumn && dateRegex.test(Data[0][filterColumn]);

    // Calculer dynamiquement la liste des options (catégories) pour la colonne sélectionnée
    const uniqueOptions = useMemo(() => {
        // On ne propose pas de liste dynamique si la colonne est de type date ou si elle est listée dans noDynamicList
        if (!filterColumn || isDateFilter || noDynamicList.includes(filterColumn)) return [];
        const optionsSet = new Set();
        Data.forEach(row => {
            if (row[filterColumn] !== undefined && row[filterColumn] !== null) {
                optionsSet.add(String(row[filterColumn]));
            }
        });
        return Array.from(optionsSet);
    }, [Data, filterColumn, isDateFilter, noDynamicList]);

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
                // Si la colonne filtrée est de type date, comparer uniquement la partie "YYYY-MM-DD"
                if (dateRegex.test(cellValue)) {
                    const rowDate = cellValue.substring(0, 10); // "YYYY-MM-DD"
                    return rowDate === filter.value;
                }
                // Sinon, recherche "contains" (insensible à la casse)
                return String(cellValue)
                    .toLowerCase()
                    .includes(filter.value.toLowerCase());
            });
        });
    }, [Data, appliedFilters]);

    // Générer dynamiquement les colonnes de base pour l'affichage dans le tableau,
    // en excluant celles listées dans `exclusions`
    const baseColumns = Object.keys(Data[0])
        .filter(key => !exclusions.includes(key))
        .map(key => {
            // Détecter si la colonne contient une date
            const isDate = dateRegex.test(Data[0][key]);
            const columnDef = {
                field: key,
                headerName: key.charAt(0).toUpperCase() + key.slice(1),
                sortable: true,
                flex: 1,
                width: 160,
            };

            // Si c'est une date, ajouter un renderCell pour formater l'affichage
            if (isDate) {
                columnDef.renderCell = (params) => (
                    <span>{formatDate(params.value)}</span>
                );
            }
            return columnDef;
        });

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
                        onChange={(e) => {
                            setFilterColumn(e.target.value);
                            setFilterValue(''); // Réinitialiser la valeur lors du changement de colonne
                        }}
                    >
                        {allFilterableColumns.map(col => (
                            <MenuItem key={col} value={col}>
                                {col.charAt(0).toUpperCase() + col.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {isDateFilter ? (
                    <TextField
                        size="small"
                        type="date"
                        label="Filter Date"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        sx={{ marginRight: 2, width: 150, marginBottom: { xs: 1, sm: 0 } }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                ) : noDynamicList.includes(filterColumn) ? (
                    <TextField
                        size="small"
                        label="Filter Value"
                        placeholder="Enter filter value"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        sx={{ marginRight: 2, width: 150, marginBottom: { xs: 1, sm: 0 } }}
                    />
                ) : (
                    <Autocomplete
                        freeSolo
                        options={uniqueOptions}
                        value={filterValue}
                        onInputChange={(event, newInputValue) => {
                            setFilterValue(newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label="Filter Value"
                                placeholder="Type or select..."
                                onKeyDown={handleKeyDown}
                                sx={{ marginRight: 2, width: 150, marginBottom: { xs: 1, sm: 0 } }}
                            />
                        )}
                    />
                )}
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
                        label={`${filter.column} ${isDateFilter ? 'is' : 'contains'} "${filter.value}"`}
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
