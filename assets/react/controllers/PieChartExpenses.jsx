import * as React from "react";
import { PieChart } from "@mui/x-charts";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";
import PropTypes from "prop-types";

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
            {/* Sélection du filtre de période */}
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

            {/* Sélection du mois (affiché si filtre "mois") */}
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

            {/* Sélection du trimestre (affiché si filtre "trimestriel") */}
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

            {/* Sélection du semestre (affiché si filtre "semestriel") */}
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

export default function PieChartExpenses({ expenses }) {
    // Mémoïsation des années et mois disponibles
    const availableYears = React.useMemo(
        () =>
            [...new Set(expenses.map((exp) => dayjs(exp.date).year()))].sort(
                (a, b) => b - a
            ),
        [expenses]
    );
    const availableMonths = React.useMemo(
        () => Array.from({ length: 12 }, (_, i) => i + 1),
        []
    );

    // États de filtrage
    const [timeFilter, setTimeFilter] = React.useState("mois");
    const [selectedYear, setSelectedYear] = React.useState(dayjs().year());
    const [selectedMonth, setSelectedMonth] = React.useState(dayjs().month() + 1);
    const [selectedQuarter, setSelectedQuarter] = React.useState(1);
    const [selectedSemester, setSelectedSemester] = React.useState(1);

    // État pour l'affichage de l'intégralité du composant
    const [showComponent, setShowComponent] = React.useState(false);

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
            return (
                expenseDate.isSameOrAfter(startDate) &&
                expenseDate.isSameOrBefore(endDate)
            );
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

        // Transformation en tableau et tri décroissant par montant
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
        <div className="flex flex-col items-center w-full space-y-6">
            {/* Bouton pour afficher/masquer l'intégralité du composant */}
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => setShowComponent((prev) => !prev)}
            >
                {showComponent ? "Masquer les statistiques" : "Afficher les statistiques"}
            </button>

            {showComponent && (
                <>
                    <p className="text-gray-700 font-semibold text-center">
                        Total des transactions affichées : {filteredExpenses.length}
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

                    <div className="flex justify-center space-x-12 w-full">
                        <div className="w-1/3 rounded-lg p-6 ml-12 bg-white shadow-lg">
                            {hasData ? (
                                <PieChart
                                    series={[{ data: chartData, innerRadius: 50 }]}
                                    width={400}
                                    height={400}
                                    slotProps={{ legend: { hidden: true } }}
                                />
                            ) : (
                                <p className="text-center text-gray-500 font-semibold">
                                    Aucune donnée à afficher
                                </p>
                            )}
                        </div>

                        {hasData && (
                            <div className="w-1/3 bg-white shadow-md rounded-lg p-6">
                                <h3 className="text-lg font-bold text-gray-700 text-center mb-4">
                                    Détails des Catégories
                                </h3>
                                {/* Conteneur scrollable pour la liste avec hauteur fixe */}
                                <div className="h-[400px] overflow-y-auto">
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
                </>
            )}
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
};

export { getColor };
