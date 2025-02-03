import * as React from "react";
import { PieChart } from "@mui/x-charts";
import dayjs from "dayjs";

export default function PieChartExpenses({ expenses }) {
    // Extraire toutes les années disponibles à partir des données
    const availableYears = [
        ...new Set(expenses.map(exp => dayjs(exp.date, "YYYY-MM-DD HH:mm:ss").year()))
    ].sort((a, b) => b - a); // Trier par ordre décroissant

    // Année sélectionnée par défaut = plus récente
    const [selectedYear, setSelectedYear] = React.useState(availableYears[0] || dayjs().year());
    const [timeFilter, setTimeFilter] = React.useState("annuel");

    // Extraire les mois disponibles pour l'année sélectionnée
    const availableMonths = [
        ...new Set(expenses
            .filter(exp => dayjs(exp.date, "YYYY-MM-DD HH:mm:ss").year() === selectedYear)
            .map(exp => dayjs(exp.date, "YYYY-MM-DD HH:mm:ss").month() + 1)
        )
    ].sort((a, b) => a - b);

    // Définition par défaut des valeurs
    const [selectedMonth, setSelectedMonth] = React.useState(availableMonths[0] || 1);
    const [selectedQuarter, setSelectedQuarter] = React.useState(1);
    const [selectedSemester, setSelectedSemester] = React.useState(1);

    console.log("🚀 Années disponibles :", availableYears);
    console.log("📅 Année sélectionnée :", selectedYear);
    console.log("📆 Mois disponibles pour cette année :", availableMonths);

    const filterExpensesByTime = (expenses) => {
        let startDate, endDate;

        switch (timeFilter) {
            case "annuel":
                startDate = dayjs(`${selectedYear}-01-01`).startOf("year");
                endDate = dayjs(`${selectedYear}-12-31`).endOf("year");
                break;
            case "mois":
                startDate = dayjs(`${selectedYear}-${selectedMonth}-01`).startOf("month");
                endDate = startDate.endOf("month");
                break;
            case "trimestriel":
                startDate = dayjs(`${selectedYear}-01-01`).startOf("year").add((selectedQuarter - 1) * 3, "months");
                endDate = startDate.add(2, "months").endOf("month");
                break;
            case "semestriel":
                startDate = dayjs(`${selectedYear}-01-01`).startOf("year").add((selectedSemester - 1) * 6, "months");
                endDate = startDate.add(5, "months").endOf("month");
                break;
            case "semaine":
                startDate = dayjs().subtract(1, "week").startOf("week");
                endDate = startDate.endOf("week");
                break;
            default:
                return expenses;
        }

        console.log(`📆 Filtrage : Dépenses entre ${startDate.format("YYYY-MM-DD")} et ${endDate.format("YYYY-MM-DD")}`);

        return expenses.filter(expense => {
            const expenseDate = dayjs(expense.date, "YYYY-MM-DD HH:mm:ss");
            return expenseDate.isAfter(startDate) && expenseDate.isBefore(endDate);
        });
    };

    const filteredExpenses = filterExpensesByTime(
        expenses.filter(exp => exp.type === "expense")
    );

    const hasData = filteredExpenses.length > 0;

    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
        const category = expense.category || "Autre";
        acc[category] = (acc[category] || 0) + Math.abs(expense.amount);
        return acc;
    }, {});

    const chartData = Object.keys(categoryTotals).map((category, index) => ({
        id: `cat-${index}`,
        value: categoryTotals[category],
        label: category,
        color: getColor(index)
    }));

    return (
        <div className="flex flex-col items-center w-full space-y-6">
            {/* Conteneur des filtres */}
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mb-4">
                {/* Sélection de la période */}
                <div>
                    <label className="block text-gray-700 font-medium text-center mb-1">Filtrer par :</label>
                    <select
                        className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-auto"
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
                <div>
                    <label className="block text-gray-700 font-medium text-center mb-1">Année :</label>
                    <select
                        className="p-2 border border-gray-300 rounded-md shadow-sm w-auto"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Sélection du mois (visible uniquement si la période sélectionnée est "mois") */}
                {timeFilter === "mois" && (
                    <div>
                        <label className="block text-gray-700 font-medium text-center mb-1">Mois :</label>
                        <select
                            className="p-2 border border-gray-300 rounded-md shadow-sm w-auto"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        >
                            {availableMonths.map(month => (
                                <option key={month} value={month}>{dayjs().month(month - 1).format("MMMM")}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Sélection du trimestre */}
                {timeFilter === "trimestriel" && (
                    <div>
                        <label className="block text-gray-700 font-medium text-center mb-1">Trimestre :</label>
                        <select
                            className="p-2 border border-gray-300 rounded-md shadow-sm w-auto"
                            value={selectedQuarter}
                            onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                        >
                            {[1, 2, 3, 4].map(q => (
                                <option key={q} value={q}>Trimestre {q}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Sélection du semestre */}
                {timeFilter === "semestriel" && (
                    <div>
                        <label className="block text-gray-700 font-medium text-center mb-1">Semestre :</label>
                        <select
                            className="p-2 border border-gray-300 rounded-md shadow-sm w-auto"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(Number(e.target.value))}
                        >
                            {[1, 2].map(s => (
                                <option key={s} value={s}>{s}er Semestre</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex justify-center space-x-12 w-full">
                {hasData ? (
                    <PieChart series={[{ data: chartData, innerRadius: 50 }]} width={400} height={400} />
                ) : (
                    <p className="text-center text-gray-500 font-semibold">Aucune donnée à afficher</p>
                )}
            </div>
        </div>
    );
}

function getColor(index) {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFD700"];
    return colors[index % colors.length];
}
