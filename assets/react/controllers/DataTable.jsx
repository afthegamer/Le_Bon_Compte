import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
} from '@mui/material';
import PieChartExpenses from './PieChartExpenses';

// Hook personnalisé pour débouncer une valeur (à réutiliser si nécessaire)
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const [datePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
};

export const formatAmount = (value) => {
    const num = Number(value);
    if (isNaN(num)) return value;
    const formatted = Math.abs(num).toLocaleString('fr-FR');
    return num < 0 ? `- ${formatted}` : formatted;
};

const checkFiltersForCell = (cellValue, filters) => {
    if (cellValue === undefined) return false;
    // Cas date
    if (typeof cellValue === 'string' && dateRegex.test(cellValue)) {
        const rowDate = cellValue.substring(0, 10);
        return filters.some(filter =>
            filter.type === 'range'
                ? rowDate >= filter.start && rowDate <= filter.end
                : rowDate === filter.value
        );
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
    // Cas texte
    const lowerValue = String(cellValue).toLowerCase();
    return filters.some(filter => lowerValue.includes(filter.value.toLowerCase()));
};

export default function DataTable({
                                      Data,
                                      excludeCollum = [],
                                      filterableExcluded = [],
                                      noDynamicList = [],
                                      filterImpacte = [],
                                  }) {
    if (!Array.isArray(Data) || Data.length === 0) {
        return <div>Aucune donnée à afficher</div>;
    }

    // Stockage des données dans un state local
    const [tableData, setTableData] = useState(Data);
    useEffect(() => {
        setTableData(Data);
    }, [Data]);

    const defaultExclusions = ['showUrl', 'editUrl'];
    const exclusions = useMemo(() => [...defaultExclusions, ...excludeCollum], [excludeCollum]);

    // Calcul des colonnes filtrables
    const allFilterableColumns = useMemo(() => {
        return Array.from(new Set([
            ...Object.keys(Data[0]).filter(key => !exclusions.includes(key)),
            ...filterableExcluded,
        ]));
    }, [Data, exclusions, filterableExcluded]);

    // États pour le filtrage
    const [filterColumn, setFilterColumn] = useState(allFilterableColumns[0] || '');
    const [filterValue, setFilterValue] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [isRangeFilter, setIsRangeFilter] = useState(false);
    const [amountOperator, setAmountOperator] = useState('equal');
    const [appliedFilters, setAppliedFilters] = useState([]);

    // (Le hook useDebounce est défini ci-dessus et peut être réutilisé si nécessaire)
    const debouncedFilterValue = useDebounce(filterValue, 300); // actuellement non utilisé

    const isDateFilter = filterColumn && dateRegex.test(Data[0][filterColumn]);
    const isNumericFilter =
        !isDateFilter &&
        filterColumn &&
        !isNaN(Data[0][filterColumn]) &&
        isFinite(Data[0][filterColumn]);

    const uniqueOptions = useMemo(() => {
        if (!filterColumn || isDateFilter || noDynamicList.includes(filterColumn)) return [];
        const optionsSet = new Set();
        tableData.forEach(row => {
            if (row[filterColumn] !== undefined && row[filterColumn] !== null) {
                optionsSet.add(String(row[filterColumn]));
            }
        });
        return Array.from(optionsSet);
    }, [tableData, filterColumn, isDateFilter, noDynamicList]);

    // Gestion des filtres appliqués
    const handleAddFilter = useCallback(() => {
        if (!filterColumn) return;
        if (isDateFilter) {
            if (isRangeFilter && filterStartDate && filterEndDate) {
                setAppliedFilters(prev => [
                    ...prev,
                    { column: filterColumn, start: filterStartDate, end: filterEndDate, type: 'range' },
                ]);
                setFilterStartDate('');
                setFilterEndDate('');
            } else if (filterDate) {
                setAppliedFilters(prev => [
                    ...prev,
                    { column: filterColumn, value: filterDate, type: 'unique' },
                ]);
                setFilterDate('');
            }
        } else if (isNumericFilter && filterValue.trim() !== '') {
            setAppliedFilters(prev => [
                ...prev,
                { column: filterColumn, value: Number(filterValue), operator: amountOperator },
            ]);
            setFilterValue('');
        } else if (filterValue.trim() !== '') {
            setAppliedFilters(prev => [
                ...prev,
                { column: filterColumn, value: filterValue },
            ]);
            setFilterValue('');
        }
    }, [filterColumn, isDateFilter, isRangeFilter, filterStartDate, filterEndDate, filterDate, filterValue, isNumericFilter, amountOperator]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handleAddFilter();
        }
    }, [handleAddFilter]);

    const handleRemoveFilter = useCallback((indexToRemove) => {
        setAppliedFilters(prev => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    const handleClearFilters = useCallback(() => {
        setAppliedFilters([]);
    }, []);

    // Calcul des données filtrées pour le DataGrid
    const filteredData = useMemo(() => {
        if (appliedFilters.length === 0) return tableData;
        const filtersByColumn = appliedFilters.reduce((acc, filter) => {
            if (!acc[filter.column]) acc[filter.column] = [];
            acc[filter.column].push(filter);
            return acc;
        }, {});
        return tableData.filter(row =>
            Object.entries(filtersByColumn).every(([column, filters]) =>
                checkFiltersForCell(row[column], filters)
            )
        );
    }, [tableData, appliedFilters]);

    // Calcul pour le graphique des dépenses filtrées (envoi correct à PieChartExpenses)
    const finalExpenses = useMemo(() => {
        const impactFilters = appliedFilters.filter(f => filterImpacte.includes(f.column));
        if (impactFilters.length === 0) return tableData;
        const filtersByColumn = impactFilters.reduce((acc, filter) => {
            if (!acc[filter.column]) acc[filter.column] = [];
            acc[filter.column].push(filter);
            return acc;
        }, {});
        return tableData.filter(row =>
            Object.entries(filtersByColumn).every(([column, filters]) =>
                checkFiltersForCell(row[column], filters)
            )
        );
    }, [tableData, appliedFilters, filterImpacte]);

    // Définition des colonnes du DataGrid
    const baseColumns = useMemo(() => {
        if (!tableData[0]) return [];
        return Object.keys(tableData[0])
            .filter(key => !exclusions.includes(key))
            .map(key => {
                const isDate = dateRegex.test(tableData[0][key]);
                const columnDef = {
                    field: key,
                    headerName: key.charAt(0).toUpperCase() + key.slice(1),
                    sortable: true,
                    flex: 1,
                    width: 160,
                };
                if (isDate) {
                    columnDef.renderCell = (params) => <span>{formatDate(params.value)}</span>;
                } else if (!isNaN(tableData[0][key]) && isFinite(tableData[0][key])) {
                    columnDef.renderCell = (params) => {
                        const num = Number(params.value);
                        const formatted = formatAmount(params.value);
                        const color = num < 0 ? 'red' : num > 0 ? 'green' : 'inherit';
                        return <span style={{ color }}>{formatted}</span>;
                    };
                }
                return columnDef;
            });
    }, [tableData, exclusions]);

    // --- Gestion de la modal de confirmation pour la suppression ---
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteParams, setDeleteParams] = useState({ id: null, deleteUrl: '', csrfToken: '' });

    const openDeleteModal = useCallback((id, deleteUrl, csrfToken) => {
        setDeleteParams({ id, deleteUrl, csrfToken });
        setDeleteModalOpen(true);
    }, []);

    const closeDeleteModal = useCallback(() => {
        setDeleteModalOpen(false);
    }, []);

    const confirmDelete = useCallback(async () => {
        // Fermer immédiatement la modal
        setDeleteModalOpen(false);
        const previousData = tableData;
        // Mise à jour optimiste : retirer l'élément du state
        setTableData(prevData => prevData.filter(item => item.id !== deleteParams.id));
        const formData = new FormData();
        formData.append('_token', deleteParams.csrfToken);
        try {
            const response = await fetch(deleteParams.deleteUrl, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                setTableData(previousData);
                alert("Erreur lors de la suppression.");
            }
        } catch (error) {
            setTableData(previousData);
            console.error("Erreur lors de la suppression :", error);
            alert("Erreur de connexion.");
        }
    }, [deleteParams, tableData]);

    const actionColumn = useMemo(() => ({
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        width: 200,
        renderCell: (params) => (
            <div className="flex gap-4 justify-center items-center">
                <a
                    href={params.row.showUrl}
                    title="Voir"
                    className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </a>
                <a
                    href={params.row.editUrl}
                    title="Éditer"
                    className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                </a>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(params.row.id, params.row.deleteUrl, params.row.csrfToken);
                    }}
                    title="Supprimer"
                    className="p-2 rounded-lg hover:bg-red-200 transition cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                </button>
            </div>
        ),
    }), [openDeleteModal]);

    const columns = useMemo(() => [...baseColumns, actionColumn], [baseColumns, actionColumn]);

    return (
        <div>
            {/* Envoi des dépenses filtrées à PieChartExpenses */}
            <Box sx={{ mt: 4, mb: 2 }}>
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

            {/* Modal de confirmation pour la suppression */}
            <Dialog open={deleteModalOpen} onClose={closeDeleteModal}>
                <DialogTitle>Confirmation de suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Voulez-vous vraiment supprimer cet élément ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteModal} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={confirmDelete} color="error">
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
