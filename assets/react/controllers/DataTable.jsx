import * as React from 'react';
import { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Autocomplete,
    Checkbox,
    FormControlLabel,
    Box
} from '@mui/material';

// Expression régulière pour détecter un format de date "YYYY-MM-DD HH:MM:SS"
const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

// Fonction pour formater la date en "DD/MM/YYYY"
const formatDate = (dateString) => {
    if (!dateString) return '';
    const [datePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
};

// Fonction pour formater les montants numériques
const formatAmount = (value) => {
    const num = Number(value);
    if (isNaN(num)) return value;
    // Utilise le format français pour insérer des espaces comme séparateur de milliers
    const formatted = Math.abs(num).toLocaleString('fr-FR');
    return num < 0 ? `- ${formatted}` : formatted;
};

export default function DataTable({ Data, excludeCollum = [], filterableExcluded = [], noDynamicList = [] }) {
    // Vérifier si Data est un tableau non vide
    if (!Array.isArray(Data) || Data.length === 0) {
        return <div>Aucune donnée à afficher</div>;
    }

    // Liste des colonnes à exclure pour l'affichage dans le tableau
    const defaultExclusions = ['showUrl', 'editUrl'];
    const exclusions = [...defaultExclusions, ...excludeCollum];

    // Calcul des colonnes disponibles pour le filtrage
    const allFilterableColumns = Array.from(
        new Set([
            ...Object.keys(Data[0]).filter(key => !exclusions.includes(key)),
            ...filterableExcluded
        ])
    );

    // États pour le filtre en cours et les filtres appliqués
    const [filterColumn, setFilterColumn] = useState(allFilterableColumns[0] || '');
    const [filterValue, setFilterValue] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    // État pour activer/désactiver le filtrage par intervalle sur les dates
    const [isRangeFilter, setIsRangeFilter] = useState(false);
    // Pour les filtres sur les montants, on ajoute un opérateur (equal, min, max)
    const [amountOperator, setAmountOperator] = useState('equal');
    // Tableau contenant tous les filtres appliqués (permettant plusieurs filtres par même colonne)
    const [appliedFilters, setAppliedFilters] = useState([]);

    // Détecte si la colonne sélectionnée est de type date
    const isDateFilter = filterColumn && dateRegex.test(Data[0][filterColumn]);

    // Détecte si la colonne sélectionnée est numérique (hors date)
    const isNumericFilter =
        !isDateFilter &&
        filterColumn &&
        !isNaN(Data[0][filterColumn]) &&
        isFinite(Data[0][filterColumn]);

    // Liste dynamique pour les autres colonnes (excluant les colonnes de type date)
    const uniqueOptions = useMemo(() => {
        if (!filterColumn || isDateFilter || noDynamicList.includes(filterColumn)) return [];
        const optionsSet = new Set();
        Data.forEach(row => {
            if (row[filterColumn] !== undefined && row[filterColumn] !== null) {
                optionsSet.add(String(row[filterColumn]));
            }
        });
        return Array.from(optionsSet);
    }, [Data, filterColumn, isDateFilter, noDynamicList]);

    // Ajout du filtre selon le mode de filtrage
    const handleAddFilter = () => {
        if (!filterColumn) return;

        if (isDateFilter) {
            if (isRangeFilter) {
                if (filterStartDate && filterEndDate) {
                    setAppliedFilters(prev => [
                        ...prev,
                        { column: filterColumn, start: filterStartDate, end: filterEndDate, type: 'range' }
                    ]);
                    setFilterStartDate('');
                    setFilterEndDate('');
                }
            } else {
                if (filterDate) {
                    setAppliedFilters(prev => [
                        ...prev,
                        { column: filterColumn, value: filterDate, type: 'unique' }
                    ]);
                    setFilterDate('');
                }
            }
        } else if (isNumericFilter) {
            if (filterValue.trim() !== '') {
                setAppliedFilters(prev => [
                    ...prev,
                    { column: filterColumn, value: Number(filterValue), operator: amountOperator }
                ]);
                setFilterValue('');
            }
        } else {
            if (filterValue.trim() !== '') {
                setAppliedFilters(prev => [...prev, { column: filterColumn, value: filterValue }]);
                setFilterValue('');
            }
        }
    };

    // Ajout du filtre avec la touche "Entrée"
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddFilter();
        }
    };

    // Suppression d'un filtre
    const handleRemoveFilter = (indexToRemove) => {
        setAppliedFilters(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Suppression de tous les filtres
    const handleClearFilters = () => {
        setAppliedFilters([]);
    };

    // Filtrage des données
    // Pour chaque colonne filtrée, la ligne doit satisfaire :
    // - Pour les filtres numériques : toutes les conditions (ET)
    // - Pour les filtres de date et textuels : au moins une condition (OU)
    const filteredData = useMemo(() => {
        if (appliedFilters.length === 0) return Data;
        const filtersByColumn = appliedFilters.reduce((acc, filter) => {
            if (!acc[filter.column]) {
                acc[filter.column] = [];
            }
            acc[filter.column].push(filter);
            return acc;
        }, {});

        return Data.filter(row => {
            return Object.entries(filtersByColumn).every(([column, filters]) => {
                const cellValue = row[column];
                if (cellValue === undefined) return false;

                // Cas des colonnes de type date
                if (dateRegex.test(cellValue)) {
                    const rowDate = cellValue.substring(0, 10);
                    return filters.some(filter => {
                        if (filter.type === 'range') {
                            return rowDate >= filter.start && rowDate <= filter.end;
                        }
                        return rowDate === filter.value;
                    });
                }

                // Cas des colonnes numériques
                if (!isNaN(cellValue) && isFinite(cellValue)) {
                    const cellNumber = Number(cellValue);
                    // Pour les filtres numériques, toutes les conditions doivent être vérifiées
                    return filters.every(filter => {
                        if (filter.operator) {
                            if (filter.operator === 'equal') {
                                return cellNumber === filter.value;
                            } else if (filter.operator === 'min') {
                                return cellNumber >= filter.value;
                            } else if (filter.operator === 'max') {
                                return cellNumber <= filter.value;
                            }
                        }
                        return String(cellNumber).includes(String(filter.value));
                    });
                }

                // Pour les autres colonnes, recherche insensible à la casse (OU)
                const lowerValue = String(cellValue).toLowerCase();
                return filters.some(filter => lowerValue.includes(filter.value.toLowerCase()));
            });
        });
    }, [Data, appliedFilters]);

    // Définition des colonnes pour le DataGrid
    const baseColumns = Object.keys(Data[0])
        .filter(key => !exclusions.includes(key))
        .map(key => {
            const isDate = dateRegex.test(Data[0][key]);
            const columnDef = {
                field: key,
                headerName: key.charAt(0).toUpperCase() + key.slice(1),
                sortable: true,
                flex: 1,
                width: 160,
            };

            if (isDate) {
                columnDef.renderCell = (params) => (
                    <span>{formatDate(params.value)}</span>
                );
            } else if (!isNaN(Data[0][key]) && isFinite(Data[0][key])) {
                // Traitement pour les montants numériques : coloration selon le signe
                columnDef.renderCell = (params) => {
                    const num = Number(params.value);
                    const formatted = formatAmount(params.value);
                    const color = num < 0 ? 'red' : (num > 0 ? 'green' : 'inherit');
                    return <span style={{ color }}>{formatted}</span>;
                };
            }
            return columnDef;
        });

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

    const columns = [...baseColumns, actionColumn];

    return (
        <div>
            {/* Interface de filtrage */}
            <Box
                sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="filter-column-label">Colonne</InputLabel>
                    <Select
                        variant="outlined"
                        labelId="filter-column-label"
                        value={filterColumn}
                        label="Colonne"
                        onChange={(e) => {
                            setFilterColumn(e.target.value);
                            // Réinitialiser les valeurs de filtre lors du changement de colonne
                            setFilterValue('');
                            setFilterDate('');
                            setFilterStartDate('');
                            setFilterEndDate('');
                            setIsRangeFilter(false);
                            setAmountOperator('equal');
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isRangeFilter ? (
                            <>
                                <TextField
                                    size="small"
                                    type="date"
                                    label="Début"
                                    value={filterStartDate}
                                    onChange={(e) => setFilterStartDate(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    sx={{ width: 140 }}
                                />
                                <TextField
                                    size="small"
                                    type="date"
                                    label="Fin"
                                    value={filterEndDate}
                                    onChange={(e) => setFilterEndDate(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    sx={{ width: 140 }}
                                />
                            </>
                        ) : (
                            <TextField
                                size="small"
                                type="date"
                                label="Date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                onKeyDown={handleKeyDown}
                                sx={{ width: 150 }}
                            />
                        )}
                        {/* Case à cocher pour activer le filtrage par intervalle */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={isRangeFilter}
                                    onChange={(e) => {
                                        setIsRangeFilter(e.target.checked);
                                        // Réinitialiser les dates lors du changement
                                        setFilterDate('');
                                        setFilterStartDate('');
                                        setFilterEndDate('');
                                    }}
                                />
                            }
                            label="Utiliser un intervalle"
                        />
                    </Box>
                ) : isNumericFilter ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            size="small"
                            type="number"
                            label="Valeur"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            sx={{ width: 120 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                                variant="outlined"
                                value={amountOperator}
                                onChange={(e) => setAmountOperator(e.target.value)}
                            >
                                <MenuItem value="equal">Egal</MenuItem>
                                <MenuItem value="min">Montant min (≥)</MenuItem>
                                <MenuItem value="max">Montant max (≤)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                ) : noDynamicList.includes(filterColumn) ? (
                    <TextField
                        size="small"
                        label="Valeur"
                        placeholder="Saisir une valeur"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        sx={{ width: 150 }}
                    />
                ) : (
                    <Autocomplete
                        freeSolo
                        options={uniqueOptions}
                        value={filterValue}
                        onInputChange={(event, newInputValue) => setFilterValue(newInputValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label="Valeur"
                                placeholder="Tapez ou sélectionnez..."
                                onKeyDown={handleKeyDown}
                                sx={{ width: 150 }}
                            />
                        )}
                    />
                )}

                <Button
                    variant="contained"
                    onClick={handleAddFilter}
                    disabled={
                        !filterColumn ||
                        (isDateFilter
                            ? isRangeFilter
                                ? !(filterStartDate && filterEndDate)
                                : !filterDate
                            : filterValue.trim() === '')
                    }
                    sx={{ height: '40px' }}
                >
                    Ajouter
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleClearFilters}
                    sx={{ height: '40px' }}
                >
                    Effacer tout les filtres
                </Button>
            </Box>

            {/* Affichage des filtres appliqués */}
            <Box sx={{ mb: 2 }}>
                {appliedFilters.map((filter, index) => (
                    <Chip
                        key={index}
                        label={
                            isDateFilter
                                ? filter.type === 'range'
                                    ? `${filter.column} : ${filter.start} - ${filter.end}`
                                    : `${filter.column} : ${filter.value}`
                                : filter.operator
                                    ? `${filter.column} : ${filter.operator === 'equal' ? '=' : filter.operator === 'min' ? '≥' : '≤'} ${filter.value}`
                                    : `${filter.column} : ${filter.value}`
                        }
                        onDelete={() => handleRemoveFilter(index)}
                        sx={{ mr: 1, mb: 1 }}
                    />
                ))}
            </Box>

            {/* Tableau */}
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
