// DataTable.jsx
import React, {useMemo, useState} from 'react';
import {DataGrid} from '@mui/x-data-grid';
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Chip,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField
} from '@mui/material';
import PieChartExpenses from './PieChartExpenses';

// Expression régulière pour détecter un format de date "YYYY-MM-DD HH:MM:SS"
const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

// Fonction pour formater une date (ex. "YYYY-MM-DD HH:MM:SS" → "DD/MM/YYYY")
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const [datePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
};

// Fonction pour formater les montants numériques (format français)
export const formatAmount = (value) => {
    const num = Number(value);
    if (isNaN(num)) return value;
    const formatted = Math.abs(num).toLocaleString('fr-FR');
    return num < 0 ? `- ${formatted}` : formatted;
};

// Exemple de fonction utilitaire calculant des bornes de dates sur un ensemble de données
export const calculateDateBounds = (data, column) => {
    if (!data || data.length === 0) return { min: null, max: null };
    const dates = data
        .map(row => row[column])
        .filter(val => dateRegex.test(val))
        .map(val => val.substring(0, 10));
    if (dates.length === 0) return { min: null, max: null };
    const sorted = dates.sort();
    return { min: sorted[0], max: sorted[sorted.length - 1] };
};

// Fonction utilitaire pour appliquer une série de filtres sur une valeur de cellule
const checkFiltersForCell = (cellValue, filters) => {
    if (cellValue === undefined) return false;
    // Vous pouvez conserver ou commenter ce log selon vos besoins

    // Cas date
    if (typeof cellValue === 'string' && dateRegex.test(cellValue)) {
        const rowDate = cellValue.substring(0, 10);
        return filters.some(filter => {
            if (filter.type === 'range') {
                return rowDate >= filter.start && rowDate <= filter.end;
            }
            return rowDate === filter.value;
        });
    }

    // Cas numérique
    if (!isNaN(cellValue) && isFinite(cellValue)) {
        const cellNumber = Number(cellValue);
        return filters.every(filter => {
            if (filter.operator) {
                if (filter.operator === 'equal') return cellNumber === filter.value;
                if (filter.operator === 'min') return cellNumber >= filter.value;
                if (filter.operator === 'max') return cellNumber <= filter.value;
            }
            return String(cellNumber).includes(String(filter.value));
        });
    }

    // Cas texte (recherche insensible à la casse)
    const lowerValue = String(cellValue).toLowerCase();
    return filters.some(filter => lowerValue.includes(filter.value.toLowerCase()));
};

export default function DataTable({
                                      Data,
                                      excludeCollum = [],
                                      filterableExcluded = [],
                                      noDynamicList = [],
                                      filterImpacte = [] // Tableau des colonnes impactées pour le calcul de finalExpenses
                                  }) {
    if (!Array.isArray(Data) || Data.length === 0) {
        return <div>Aucune donnée à afficher</div>;
    }


    // Colonnes à exclure pour l’affichage dans le tableau
    const defaultExclusions = ['showUrl', 'editUrl'];
    const exclusions = [...defaultExclusions, ...excludeCollum];

    // Calcul des colonnes disponibles pour le filtrage
    const allFilterableColumns = Array.from(
        new Set([
            ...Object.keys(Data[0]).filter(key => !exclusions.includes(key)),
            ...filterableExcluded
        ])
    );

    // États pour gérer le filtrage
    const [filterColumn, setFilterColumn] = useState(allFilterableColumns[0] || '');
    const [filterValue, setFilterValue] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [isRangeFilter, setIsRangeFilter] = useState(false);
    const [amountOperator, setAmountOperator] = useState('equal');
    const [appliedFilters, setAppliedFilters] = useState([]);

    // Détermination du type de filtre en fonction de la colonne sélectionnée
    const isDateFilter = filterColumn && dateRegex.test(Data[0][filterColumn]);
    const isNumericFilter =
        !isDateFilter &&
        filterColumn &&
        !isNaN(Data[0][filterColumn]) &&
        isFinite(Data[0][filterColumn]);

    // Liste dynamique pour certaines colonnes
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

    // Ajout d'un filtre dans la liste
    const handleAddFilter = () => {
        if (!filterColumn) return;
        if (isDateFilter) {
            if (isRangeFilter && filterStartDate && filterEndDate) {
                setAppliedFilters(prev => {
                    const nouveauFiltre = { column: filterColumn, start: filterStartDate, end: filterEndDate, type: 'range' };
                    return [...prev, nouveauFiltre];
                });
                setFilterStartDate('');
                setFilterEndDate('');
            } else if (filterDate) {
                setAppliedFilters(prev => {
                    const nouveauFiltre = { column: filterColumn, value: filterDate, type: 'unique' };
                    return [...prev, nouveauFiltre];
                });
                setFilterDate('');
            }
        } else if (isNumericFilter && filterValue.trim() !== '') {
            setAppliedFilters(prev => {
                const nouveauFiltre = { column: filterColumn, value: Number(filterValue), operator: amountOperator };
                return [...prev, nouveauFiltre];
            });
            setFilterValue('');
        } else if (filterValue.trim() !== '') {
            setAppliedFilters(prev => {
                const nouveauFiltre = { column: filterColumn, value: filterValue };
                return [...prev, nouveauFiltre];
            });
            setFilterValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddFilter();
        }
    };

    const handleRemoveFilter = (indexToRemove) => {
        setAppliedFilters(prev => {
            return prev.filter((_, index) => index !== indexToRemove);
        });
    };

    const handleClearFilters = () => {
        setAppliedFilters([]);
    };

    // Filtrage global des données (affichage du tableau)
    const filteredData = useMemo(() => {
        if (appliedFilters.length === 0) return Data;
        const filtersByColumn = appliedFilters.reduce((acc, filter) => {
            if (!acc[filter.column]) acc[filter.column] = [];
            acc[filter.column].push(filter);
            return acc;
        }, {});
        return Data.filter(row =>
            Object.entries(filtersByColumn).every(([column, filters]) =>
                checkFiltersForCell(row[column], filters)
            )
        );
    }, [Data, appliedFilters]);

    // Calcul de finalExpenses pour PieChartExpenses :
    // On se base sur la donnée d'origine (Data) en appliquant uniquement les filtres
    // dont la colonne figure dans filterImpacte.
    const finalExpenses = useMemo(() => {
        // Extraction des filtres dont la colonne figure dans filterImpacte
        const impactFilters = appliedFilters.filter(f => filterImpacte.includes(f.column));
        if (impactFilters.length === 0) {
            return Data;
        }
        const filtersByColumn = impactFilters.reduce((acc, filter) => {
            if (!acc[filter.column]) acc[filter.column] = [];
            acc[filter.column].push(filter);
            return acc;
        }, {});
        return Data.filter(row =>
            Object.entries(filtersByColumn).every(([column, filters]) =>
                checkFiltersForCell(row[column], filters)
            )
        );
    }, [Data, appliedFilters, filterImpacte]);

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
                columnDef.renderCell = (params) => <span>{formatDate(params.value)}</span>;
            } else if (!isNaN(Data[0][key]) && isFinite(Data[0][key])) {
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

            {/* Transmission des finalExpenses au composant PieChartExpenses */}
            <Box sx={{ mt: 4 , mb: 2 }}>
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
                    Effacer tous les filtres
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

            {/* Affichage du DataGrid */}
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
