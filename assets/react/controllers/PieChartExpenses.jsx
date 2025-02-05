import * as React from "react";
import { PieChart } from "@mui/x-charts";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";
import PropTypes from "prop-types";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

/**
 * Renvoie une couleur en fonction de l'index.
 */
function getColor(index) {
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
 */
const calculateDateBounds = (filter, year, month, quarter, semester) => {
    let startDate, endDate;
    switch (filter) {
        case "annuel":
            startDate = dayjs(`${year}-01-01`);
            endDate = startDate.endOf("year");
            break;
        case "semestriel":
            startDate =
                semester === 1 ? dayjs(`${year}-01-01`) : dayjs(`${year}-07-01`);
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
            const now = dayjs();
            startDate = now.subtract(1, "week");
            endDate = now;
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
                             availableYears,
                             availableMonths,
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
    availableYears: PropTypes.arrayOf(PropTypes.number).isRequired,
    availableMonths: PropTypes.arrayOf(PropTypes.number).isRequired,
};

/* Composant Modal basé sur votre exemple */
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

/* Composant PieChartExpenses */
export default function PieChartExpenses({ expenses }) {
    // Mémoïsation des années et mois disponibles
    const availableYears = React.useMemo(
        () =>
            [...new Set(expenses.map((exp) => dayjs(exp.date).year()))].sort((a, b) => b - a),
        [expenses]
    );
    const availableMonths = React.useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

    // États de filtrage
    const [timeFilter, setTimeFilter] = React.useState("mois");
    const [selectedYear, setSelectedYear] = React.useState(dayjs().year());
    const [selectedMonth, setSelectedMonth] = React.useState(dayjs().month() + 1);
    const [selectedQuarter, setSelectedQuarter] = React.useState(1);
    const [selectedSemester, setSelectedSemester] = React.useState(1);

    // Calcul des bornes et filtrage des dépenses
    const filteredExpenses = React.useMemo(() => {
        const { startDate, endDate } = calculateDateBounds(
            timeFilter,
            selectedYear,
            selectedMonth,
            selectedQuarter,
            selectedSemester
        );

        console.log("[DEBUG] Filtrage pour", timeFilter);
        console.log("[DEBUG] startDate:", startDate.format());
        console.log("[DEBUG] endDate:", endDate.format());

        return expenses.filter((expense) => {
            // On exclut les revenus et on ne garde que les dépenses (montants négatifs)
            if (expense.type === "income" || expense.amount >= 0) {
                return false;
            }
            const expenseDate = dayjs.utc(expense.date);
            if (!expenseDate.isValid()) {
                console.warn("❌ Date invalide détectée pour la transaction :", expense);
                return false;
            }
            return expenseDate.isSameOrAfter(startDate) && expenseDate.isSameOrBefore(endDate);
        });
    }, [expenses, timeFilter, selectedYear, selectedMonth, selectedQuarter, selectedSemester]);

    console.log("📊 Transactions affichées :", filteredExpenses.length);
    const hasData = filteredExpenses.length > 0;

    // Calcul des totaux par catégorie et préparation des données du graphique
    const chartData = React.useMemo(() => {
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
        <Modal button="Show Statistics">
            <div className="flex flex-col items-center w-full space-y-6">
                <p className="text-gray-700 font-semibold text-center">
                    Total transactions displayed: {filteredExpenses.length}
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
                    availableYears={availableYears}
                    availableMonths={availableMonths}
                />

                {/* Conteneur responsive pour le graphique et les détails */}
                <div className="flex flex-col md:flex-row w-full md:space-x-6 space-y-6 md:space-y-0">
                    {/* Conteneur du graphique */}
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
                                No data to display
                            </p>
                        )}
                    </div>

                    {/* Conteneur des détails de catégories */}
                    {hasData && (
                        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
                            <h3 className="text-lg font-bold text-gray-700 text-center mb-4">
                                Category Details
                            </h3>
                            <div className="h-[350px] overflow-y-auto">
                                <ul className="space-y-3">
                                    {chartData.map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex justify-between items-center border-b pb-2"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                ></div>
                                                <span className="text-gray-800 font-medium">
                      {item.label}
                    </span>
                                            </div>
                                            <span className="text-gray-600 font-semibold">
                    {item.value.toFixed(2)} €
                  </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
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
};

export { getColor };
