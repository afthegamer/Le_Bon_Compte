// DataTable.jsx
import React, { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
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
    Box,
    Paper,
} from '@mui/material';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import PieChartExpenses from './PieChartExpenses'; // Import du composant graphique

// Extension des plugins dayjs
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(dayOfYear);

// Expression régulière pour reconnaître les dates au format "YYYY-MM-DD HH:mm:ss"
const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

/**
 * Formate une date sous le format "DD/MM/YYYY".
 */
const formatDate = (dateString) => {
    if (!dateString) return '';
    const [datePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Formate un montant numérique (nombre négatif avec signe, séparateur des milliers…).
 */
const formatAmount = (value) => {
    const num = Number(value);
    if (isNaN(num)) return value;
    const formatted = Math.abs(num).toLocaleString('fr-FR');
    return num < 0 ? `- ${formatted}` : formatted;
};

/**
 * Composant DataTable.
 * Gère son propre filtrage sur l'ensemble des colonnes et transmet à PieChartExpenses uniquement
 * les lignes filtrées par les colonnes indiquées dans filterImpacte.
 */
function DataTable({
                       Data,
                       excludeCollum = [],
                       filterableExcluded = [],
                       noDynamicList = [],
                       filterImpacte = [],
                   }) {
    if (!Array.isArray(Data) || Data.length === 0) {
        return <div>Aucune donnée à afficher</div>;
    }

    const defaultExclusions = ['showUrl', 'editUrl'];
    const exclusions = [...defaultExclusions, ...excludeCollum];

    // Liste des colonnes filtrables issues des données
    const allFilterableColumns = Array.from(
        new Set([
            ...Object.keys(Data[0]).filter((key) => !exclusions.includes(key)),
            ...filterableExcluded,
        ])
    );

    const [filterColumn, setFilterColumn] = useState(allFilterableColumns[0] || '');
    const [filterValue, setFilterValue] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [isRangeFilter, setIsRangeFilter] = useState(false);
    const [amountOperator, setAmountOperator] = useState('equal');
    const [appliedFilters, setAppliedFilters] = useState([]);

    // Détermine si la colonne en cours est une date ou un nombre
    const isDateFilterCol = filterColumn && dateRegex.test(Data[0][filterColumn]);
    const isNumericFilter =
        !isDateFilterCol &&
        filterColumn &&
        !isNaN(Data[0][filterColumn]) &&
        isFinite(Data[0][filterColumn]);

    // Liste des options uniques pour le filtre (sauf pour les dates ou colonnes non dynamiques)
    const uniqueOptions = useMemo(() => {
        if (!filterColumn || isDateFilterCol || noDynamicList.includes(filterColumn)) return [];
        const optionsSet = new Set();
        Data.forEach((row) => {
            if (row[filterColumn] !== undefined && row[filterColumn] !== null) {
                optionsSet.add(String(row[filterColumn]));
            }
        });
        return Array.from(optionsSet);
    }, [Data, filterColumn, isDateFilterCol, noDynamicList]);

    const handleAddFilter = () => {
        if (!filterColumn) return;
        if (isDateFilterCol) {
            if (isRangeFilter) {
                if (filterStartDate && filterEndDate) {
                    setAppliedFilters((prev) => [
                        ...prev,
                        { column: filterColumn, start: filterStartDate, end: filterEndDate, type: 'range' },
                    ]);
                    setFilterStartDate('');
                    setFilterEndDate('');
                }
            } else {
                if (filterDate) {
                    setAppliedFilters((prev) => [
                        ...prev,
                        { column: filterColumn, value: filterDate, type: 'unique' },
                    ]);
                    setFilterDate('');
                }
            }
        } else if (isNumericFilter) {
            if (filterValue.trim() !== '') {
                setAppliedFilters((prev) => [
                    ...prev,
                    { column: filterColumn, value: Number(filterValue), operator: amountOperator },
                ]);
                setFilterValue('');
            }
        } else {
            if (filterValue.trim() !== '') {
                setAppliedFilters((prev) => [...prev, { column: filterColumn, value: filterValue }]);
                setFilterValue('');
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddFilter();
        }
    };

    const handleRemoveFilter = (indexToRemove) => {
        setAppliedFilters((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleClearFilters = () => {
        setAppliedFilters([]);
    };

    // Filtrage global de toutes les données selon les filtres appliqués
    const filteredData = useMemo(() => {
        if (appliedFilters.length === 0) return Data;
        const filtersByColumn = appliedFilters.reduce((acc, filter) => {
            if (!acc[filter.column]) {
                acc[filter.column] = [];
            }
            acc[filter.column].push(filter);
            return acc;
        }, {});
        return Data.filter((row) => {
            return Object.entries(filtersByColumn).every(([column, filters]) => {
                const cellValue = row[column];
                if (cellValue === undefined) return false;
                // Filtrage pour les dates
                if (dateRegex.test(cellValue)) {
                    const rowDate = cellValue.substring(0, 10);
                    return filters.some((filter) => {
                        if (filter.type === 'range') {
                            return rowDate >= filter.start && rowDate <= filter.end;
                        }
                        return rowDate === filter.value;
                    });
                }
                // Filtrage pour les nombres
                if (!isNaN(cellValue) && isFinite(cellValue)) {
                    const cellNumber = Number(cellValue);
                    return filters.every((filter) => {
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
                // Filtrage pour les chaînes de caractères
                const lowerValue = String(cellValue).toLowerCase();
                return filters.some((filter) =>
                    lowerValue.includes(filter.value.toLowerCase())
                );
            });
        });
    }, [Data, appliedFilters]);

    // Définition des colonnes à afficher dans le tableau
    const baseColumns = Object.keys(Data[0])
        .filter((key) => !exclusions.includes(key))
        .map((key) => {
            const isDate = dateRegex.test(Data[0][key]);
            const columnDef = {
                field: key,
                headerName: key.charAt(0).toUpperCase() + key.slice(1),
                sortable: true,
                flex: 1,
                width: 160,
            };
            if (isDate) {
                columnDef.renderCell = (params) => <span>{formatDate(params.value)}</span>;
            } else if (!isNaN(Data[0][key]) && isFinite(Data[0][key])) {
                columnDef.renderCell = (params) => {
                    const num = Number(params.value);
                    const formatted = formatAmount(params.value);
                    const color = num < 0 ? 'red' : num > 0 ? 'green' : 'inherit';
                    return <span style={{ color }}>{formatted}</span>;
                };
            }
            return columnDef;
        });

    // Exemple d'une colonne d'actions (affichage de liens par exemple)
    const actionColumn = {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        width: 200,
        renderCell: (params) => (
            <div>
                <a href={params.row.showUrl} style={{ marginRight: '10px' }}>
                    Show
                </a>
                <a href={params.row.editUrl}>Edit</a>
            </div>
        ),
    };

    const columns = [...baseColumns, actionColumn];

    /**
     * Calcul de la donnée finale à transmettre au graphique.
     * Seules les lignes de filteredData qui correspondent aux filtres appliqués sur
     * les colonnes indiquées dans filterImpacte sont conservées.
     */
    const finalExpenses = useMemo(() => {
        if (!filterImpacte || filterImpacte.length === 0) return filteredData;
        // Sélectionne uniquement les filtres qui concernent les colonnes "impactées"
        const relevantFilters = appliedFilters.filter((f) => filterImpacte.includes(f.column));
        if (relevantFilters.length === 0) return filteredData;
        const filtersByCol = relevantFilters.reduce((acc, f) => {
            if (!acc[f.column]) acc[f.column] = [];
            acc[f.column].push(f);
            return acc;
        }, {});
        return filteredData.filter((row) => {
            return Object.entries(filtersByCol).every(([col, filters]) => {
                const cellValue = row[col];
                if (cellValue === undefined || cellValue === null) return false;
                return filters.some((filter) =>
                    String(cellValue).toLowerCase().includes(String(filter.value).toLowerCase())
                );
            });
        });
    }, [filteredData, appliedFilters, filterImpacte]);

    return (
        <div>
            {/* Affichage du graphique (le composant reçoit uniquement finalExpenses) */}
            <Box sx={{ mt: 4 }}>
                <PieChartExpenses expenses={finalExpenses} />
            </Box>

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
                            setFilterValue('');
                            setFilterDate('');
                            setFilterStartDate('');
                            setFilterEndDate('');
                            setIsRangeFilter(false);
                            setAmountOperator('equal');
                        }}
                    >
                        {allFilterableColumns.map((col) => (
                            <MenuItem key={col} value={col}>
                                {col.charAt(0).toUpperCase() + col.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {isDateFilterCol ? (
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={isRangeFilter}
                                    onChange={(e) => {
                                        setIsRangeFilter(e.target.checked);
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
                        (isDateFilterCol
                            ? isRangeFilter
                                ? !(filterStartDate && filterEndDate)
                                : !filterDate
                            : filterValue.trim() === '')
                    }
                    sx={{ height: '40px' }}
                >
                    Ajouter
                </Button>
                <Button variant="outlined" color="error" onClick={handleClearFilters} sx={{ height: '40px' }}>
                    Effacer tout les filtres
                </Button>
            </Box>

            {/* Affichage des filtres appliqués */}
            <Box sx={{ mb: 2 }}>
                {appliedFilters.map((filter, index) => (
                    <Chip
                        key={index}
                        label={
                            isDateFilterCol
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

            {/* Affichage du tableau */}
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

DataTable.propTypes = {
    Data: PropTypes.arrayOf(PropTypes.object).isRequired,
    excludeCollum: PropTypes.arrayOf(PropTypes.string),
    filterableExcluded: PropTypes.arrayOf(PropTypes.string),
    noDynamicList: PropTypes.arrayOf(PropTypes.string),
    filterImpacte: PropTypes.arrayOf(PropTypes.string),
};

export default DataTable;
