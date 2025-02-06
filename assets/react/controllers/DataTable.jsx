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
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import dayOfYear from 'dayjs/plugin/dayOfYear';
// Importation de PieChart
import { PieChart } from '@mui/x-charts/PieChart';
// Extension des plugins dayjs
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(dayOfYear);

// Déclaration de dateRegex pour détecter un format de date "YYYY-MM-DD HH:MM:SS"
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
    const formatted = Math.abs(num).toLocaleString('fr-FR');
    return num < 0 ? `- ${formatted}` : formatted;
};

/**
 * Renvoie une couleur en fonction de l'index.
 */
export function getColor(index) {
    const colors = [
        "#FF5733",
        "#33FF57",
        "#3357FF",
        "#FF33A1",
        "#FFD700",
        "#00FFFF",
        "#800080",
        "#FF4500",
        "#008000",
        "#000080",
    ];
    return colors[index % colors.length];
}

/**
 * Calcule les bornes de filtrage en fonction du filtre et des sélections.
 * Pour le filtre "semaine", l'année est découpée en 52 semaines fixes.
 */
const calculateDateBounds = (filter, year, month, quarter, semester, week) => {
    let startDate, endDate;
    switch (filter) {
        case "annuel":
            startDate = dayjs(`${year}-01-01`);
            endDate = startDate.endOf("year");
            break;
        case "semestriel":
            startDate = semester === 1 ? dayjs(`${year}-01-01`) : dayjs(`${year}-07-01`);
            endDate = startDate.add(6, "month").endOf("month");
            break;
        case "trimestriel":
            startDate = dayjs(`${year}-${(quarter - 1) * 3 + 1}-01`);
            endDate = startDate.add(3, "month").endOf("month");
            break;
        case "mois":
            startDate = dayjs(`${year}-${month}-01`);
            endDate = startDate.endOf("month");
            break;
        case "semaine":
            const startOfYear = dayjs(`${year}-01-01`).startOf("year");
            startDate = startOfYear.add(week - 1, "week");
            endDate = startDate.add(1, "week").subtract(1, "day");
            break;
        default:
            startDate = dayjs();
            endDate = dayjs();
            break;
    }
    return { startDate, endDate };
};

/**
 * Composant pour les sélecteurs de filtre.
 */
function FilterSelectors({
                             timeFilter,
                             setTimeFilter,
                             selectedYear,
                             setSelectedYear,
                             selectedMonth,
                             setSelectedMonth,
                             selectedQuarter,
                             setSelectedQuarter,
                             selectedSemester,
                             setSelectedSemester,
                             selectedWeek,
                             setSelectedWeek,
                             availableYears,
                             availableMonths,
                             availableWeeks,
                         }) {
    return (
        <div className="flex flex-wrap justify-center space-x-4 w-full">
            {/* Filtrer par période */}
            <div className="w-1/4">
                <label className="block text-gray-700 font-medium mb-2 text-center">
                    Filtrer par période :
                </label>
                <select
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                >
                    <option value="annuel">Annuel</option>
                    <option value="semestriel">Semestriel</option>
                    <option value="trimestriel">Trimestriel</option>
                    <option value="mois">Mois</option>
                    <option value="semaine">Semaine</option>
                </select>
            </div>
            {/* Sélection de l'année */}
            <div className="w-1/4">
                <label className="block text-gray-700 font-medium mb-2 text-center">
                    Sélectionner une année :
                </label>
                <select
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                    {availableYears.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>
            {/* Sélection du mois (si filtre "mois") */}
            {timeFilter === "mois" && (
                <div className="w-1/4">
                    <label className="block text-gray-700 font-medium mb-2 text-center">
                        Sélectionner un mois :
                    </label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                        {availableMonths.map((month) => (
                            <option key={month} value={month}>
                                {dayjs().month(month - 1).format("MMMM")}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {/* Sélection du trimestre (si filtre "trimestriel") */}
            {timeFilter === "trimestriel" && (
                <div className="w-1/4">
                    <label className="block text-gray-700 font-medium mb-2 text-center">
                        Sélectionner un trimestre :
                    </label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        value={selectedQuarter}
                        onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                    >
                        {[1, 2, 3, 4].map((q) => (
                            <option key={q} value={q}>
                                Trimestre {q}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {/* Sélection du semestre (si filtre "semestriel") */}
            {timeFilter === "semestriel" && (
                <div className="w-1/4">
                    <label className="block text-gray-700 font-medium mb-2 text-center">
                        Sélectionner un semestre :
                    </label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(Number(e.target.value))}
                    >
                        {[1, 2].map((s) => (
                            <option key={s} value={s}>
                                {s}er Semestre
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {/* Sélection de la semaine (si filtre "semaine") */}
            {timeFilter === "semaine" && (
                <div className="w-1/4">
                    <label className="block text-gray-700 font-medium mb-2 text-center">
                        Sélectionner une semaine :
                    </label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    >
                        {availableWeeks.map((w) => {
                            const startOfYear = dayjs(`${selectedYear}-01-01`).startOf("year");
                            const weekStart = startOfYear.add(w - 1, "week");
                            let weekEnd = weekStart.add(1, "week").subtract(1, "day");
                            const endOfYear = dayjs(`${selectedYear}-12-31`).endOf("day");
                            if (w === availableWeeks.length && weekEnd.isBefore(endOfYear)) {
                                weekEnd = endOfYear;
                            }
                            return (
                                <option key={w} value={w}>
                                    Semaine {w} ({weekStart.format("DD/MM/YYYY")} au {weekEnd.format("DD/MM/YYYY")})
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}
        </div>
    );
}

FilterSelectors.propTypes = {
    timeFilter: PropTypes.string.isRequired,
    setTimeFilter: PropTypes.func.isRequired,
    selectedYear: PropTypes.number.isRequired,
    setSelectedYear: PropTypes.func.isRequired,
    selectedMonth: PropTypes.number.isRequired,
    setSelectedMonth: PropTypes.func.isRequired,
    selectedQuarter: PropTypes.number.isRequired,
    setSelectedQuarter: PropTypes.func.isRequired,
    selectedSemester: PropTypes.number.isRequired,
    setSelectedSemester: PropTypes.func.isRequired,
    selectedWeek: PropTypes.number,
    setSelectedWeek: PropTypes.func,
    availableYears: PropTypes.arrayOf(PropTypes.number).isRequired,
    availableMonths: PropTypes.arrayOf(PropTypes.number).isRequired,
    availableWeeks: PropTypes.arrayOf(PropTypes.number),
};

/**
 * Composant Modal basé sur votre exemple.
 */
function Modal(props) {
    const [isOpen, setIsOpen] = useState(false);

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    return (
        <>
            <div className="flex justify-center items-center">
                <button
                    type="button"
                    onClick={openModal}
                    className="mb-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
                >
                    {props.button}
                </button>
            </div>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel
                                    className="w-full max-w-5xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        onClick={closeModal}
                                    >
                                        &times;
                                    </button>
                                    {props.children}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}

Modal.propTypes = {
    button: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

/**
 * Composant PieChartExpenses.
 * Il conserve sa logique interne de filtrage pour le graphique.
 */
export function PieChartExpenses({ expenses, filterImpacte }) {
    const availableYears = useMemo(
        () =>
            [...new Set(expenses.map((exp) => dayjs(exp.date).year()))].sort((a, b) => b - a),
        [expenses]
    );
    const availableMonths = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
    const availableWeeks = useMemo(() => Array.from({ length: 52 }, (_, i) => i + 1), []);
    const currentWeek = Math.ceil(dayjs().dayOfYear() / 7);

    const [timeFilter, setTimeFilter] = useState("mois");
    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
    const [selectedQuarter, setSelectedQuarter] = useState(1);
    const [selectedSemester, setSelectedSemester] = useState(1);
    const [selectedWeek, setSelectedWeek] = useState(currentWeek <= 52 ? currentWeek : 1);

    const filteredExpenses = useMemo(() => {
        const { startDate, endDate } = calculateDateBounds(
            timeFilter,
            selectedYear,
            selectedMonth,
            selectedQuarter,
            selectedSemester,
            selectedWeek
        );
        return expenses.filter((expense) => {
            if (expense.type === "income" || expense.amount >= 0) return false;
            const expenseDate = dayjs.utc(expense.date);
            if (!expenseDate.isValid()) {
                console.warn("❌ Date invalide détectée pour la transaction :", expense);
                return false;
            }
            return expenseDate.isSameOrAfter(startDate) && expenseDate.isSameOrBefore(endDate);
        });
    }, [expenses, timeFilter, selectedYear, selectedMonth, selectedQuarter, selectedSemester, selectedWeek]);

    const hasData = filteredExpenses.length > 0;

    const chartData = useMemo(() => {
        const categoryTotals = filteredExpenses.reduce((acc, expense) => {
            const category = expense.category || "Autre";
            const amount = Math.abs(expense.amount);
            acc[category] = (acc[category] || 0) + amount;
            return acc;
        }, {});
        return Object.keys(categoryTotals)
            .map((category, index) => ({
                id: `cat-${index}`,
                value: categoryTotals[category],
                label: category,
                color: getColor(index),
            }))
            .sort((a, b) => b.value - a.value);
    }, [filteredExpenses]);

    return (
        <div>
            <Modal button="Show Statistics">
                <div className="flex flex-col items-center w-full space-y-6">
                    <p className="text-gray-700 font-semibold text-center">
                        Total transactions affichées : {filteredExpenses.length}
                    </p>
                    <FilterSelectors
                        timeFilter={timeFilter}
                        setTimeFilter={setTimeFilter}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                        selectedQuarter={selectedQuarter}
                        setSelectedQuarter={setSelectedQuarter}
                        selectedSemester={selectedSemester}
                        setSelectedSemester={setSelectedSemester}
                        selectedWeek={selectedWeek}
                        setSelectedWeek={setSelectedWeek}
                        availableYears={availableYears}
                        availableMonths={availableMonths}
                        availableWeeks={availableWeeks}
                    />
                    <div className="flex flex-col md:flex-row w-full md:space-x-6 space-y-6 md:space-y-0">
                        <div className="flex-1 bg-white shadow-lg rounded-lg p-4 flex justify-center items-center">
                            {hasData ? (
                                <PieChart
                                    series={[{ data: chartData, innerRadius: 50 }]}
                                    width={400}
                                    height={400}
                                    slotProps={{ legend: { hidden: true } }}
                                />
                            ) : (
                                <p className="text-center text-gray-500 font-semibold">
                                    Pas de données à afficher
                                </p>
                            )}
                        </div>
                        {hasData && (
                            <div className="flex-1 bg-white shadow-md rounded-lg p-4">
                                <h3 className="text-lg font-bold text-gray-700 text-center mb-4">
                                    Détails par catégorie
                                </h3>
                                <div className="h-[350px] overflow-y-auto">
                                    <ul className="space-y-3">
                                        {chartData.map((item, index) => (
                                            <li key={index} className="flex justify-between items-center border-b pb-2">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                    <span className="text-gray-800 font-medium">{item.label}</span>
                                                </div>
                                                <span className="text-gray-600 font-semibold">{item.value.toFixed(2)} €</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

PieChartExpenses.propTypes = {
    expenses: PropTypes.arrayOf(
        PropTypes.shape({
            date: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            amount: PropTypes.number.isRequired,
            category: PropTypes.string,
        })
    ).isRequired,
    filterImpacte: PropTypes.arrayOf(PropTypes.string),
};

PieChartExpenses.defaultProps = {
    filterImpacte: [],
};

/**
 * Composant DataTable.
 * Il gère son propre filtrage, affiche le tableau et intègre PieChartExpenses
 * en transmettant la donnée filtrée. La prop filterImpacte permet de déterminer
 * quelles colonnes impacteront la donnée transmise au graphique.
 */
function DataTable({ Data, excludeCollum = [], filterableExcluded = [], noDynamicList = [], filterImpacte = [] }) {
    if (!Array.isArray(Data) || Data.length === 0) {
        return <div>Aucune donnée à afficher</div>;
    }

    const defaultExclusions = ['showUrl', 'editUrl'];
    const exclusions = [...defaultExclusions, ...excludeCollum];

    const allFilterableColumns = Array.from(
        new Set([
            ...Object.keys(Data[0]).filter(key => !exclusions.includes(key)),
            ...filterableExcluded
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

    const isDateFilterCol = filterColumn && dateRegex.test(Data[0][filterColumn]);
    const isNumericFilter =
        !isDateFilterCol &&
        filterColumn &&
        !isNaN(Data[0][filterColumn]) &&
        isFinite(Data[0][filterColumn]);

    const uniqueOptions = useMemo(() => {
        if (!filterColumn || isDateFilterCol || noDynamicList.includes(filterColumn)) return [];
        const optionsSet = new Set();
        Data.forEach(row => {
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddFilter();
        }
    };

    const handleRemoveFilter = (indexToRemove) => {
        setAppliedFilters(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleClearFilters = () => {
        setAppliedFilters([]);
    };

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
                if (dateRegex.test(cellValue)) {
                    const rowDate = cellValue.substring(0, 10);
                    return filters.some(filter => {
                        if (filter.type === 'range') {
                            return rowDate >= filter.start && rowDate <= filter.end;
                        }
                        return rowDate === filter.value;
                    });
                }
                if (!isNaN(cellValue) && isFinite(cellValue)) {
                    const cellNumber = Number(cellValue);
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
                const lowerValue = String(cellValue).toLowerCase();
                return filters.some(filter => lowerValue.includes(filter.value.toLowerCase()));
            });
        });
    }, [Data, appliedFilters]);

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

    // Filtrage complémentaire pour le graphique via filterImpacte.
    const finalExpenses = useMemo(() => {
        if (!filterImpacte || filterImpacte.length === 0) return filteredData;
        return filteredData.filter(expense =>
            filterImpacte.every(col => {
                const filtersForCol = appliedFilters.filter(f => f.column === col);
                if (filtersForCol.length === 0) return true;
                const cellValue = expense[col];
                if (cellValue === undefined || cellValue === null) return false;
                return filtersForCol.some(filter =>
                    String(cellValue).toLowerCase().includes(String(filter.value).toLowerCase())
                );
            })
        );
    }, [filteredData, appliedFilters, filterImpacte]);

    return (
        <div>

            {/* Intégration du graphique via PieChartExpenses */}
            <Box sx={{ mt: 4 }}>
                <PieChartExpenses expenses={finalExpenses} filterImpacte={filterImpacte} />
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

DataTable.propTypes = {
    Data: PropTypes.arrayOf(PropTypes.object).isRequired,
    excludeCollum: PropTypes.arrayOf(PropTypes.string),
    filterableExcluded: PropTypes.arrayOf(PropTypes.string),
    noDynamicList: PropTypes.arrayOf(PropTypes.string),
    filterImpacte: PropTypes.arrayOf(PropTypes.string),
};

export default DataTable;
