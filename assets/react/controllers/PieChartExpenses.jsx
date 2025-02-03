import * as React from "react";
import { PieChart } from "@mui/x-charts";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

export default function PieChartExpenses({ expenses }) {
    const [timeFilter, setTimeFilter] = React.useState("mois");
    const [selectedYear, setSelectedYear] = React.useState(dayjs().year());
    const [selectedMonth, setSelectedMonth] = React.useState(dayjs().month() + 1);
    const [selectedQuarter, setSelectedQuarter] = React.useState(1);
    const [selectedSemester, setSelectedSemester] = React.useState(1);

    const availableYears = [
        ...new Set(expenses.map((exp) => dayjs(exp.date).year())),
    ].sort((a, b) => b - a);
    const availableMonths = Array.from({ length: 12 }, (_, i) => i + 1);

    const filterExpensesByTime = (expenses, period) => {
        const now = dayjs();
        let startDate;
        let endDate;

        switch (period) {
            case "annuel":
                startDate = dayjs(`${selectedYear}-01-01`);
                endDate = startDate.endOf("year");
                break;
            case "semestriel":
                startDate =
                    selectedSemester === 1
                        ? dayjs(`${selectedYear}-01-01`)
                        : dayjs(`${selectedYear}-07-01`);
                endDate = startDate.add(6, "month").endOf("month");
                break;
            case "trimestriel":
                startDate = dayjs(`${selectedYear}-${(selectedQuarter - 1) * 3 + 1}-01`);
                endDate = startDate.add(3, "month").endOf("month");
                break;
            case "mois":
                startDate = dayjs(`${selectedYear}-${selectedMonth}-01`);
                endDate = startDate.endOf("month");
                break;
            case "semaine":
                startDate = now.subtract(1, "week");
                endDate = now;
                break;
            default:
                return expenses;
        }

        return expenses.filter((expense) => {
            // Si vos dates sont locales, remplacez dayjs.utc() par dayjs()
            const expenseDate = dayjs.utc(expense.date);
            if (!expenseDate.isValid()) {
                console.warn("❌ Date invalide détectée pour la transaction :", expense);
                return false;
            }
            return expenseDate.isSameOrAfter(startDate) && expenseDate.isSameOrBefore(endDate);
        });
    };

    const filteredExpenses = filterExpensesByTime(
        expenses.filter((exp) => exp.type !== "income" && exp.amount < 0),
        timeFilter
    );

    // Log essentiel en production
    console.log("📊 Transactions affichées :", filteredExpenses.length);

    const hasData = filteredExpenses.length > 0;

    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
        const category = expense.category || "Autre";
        const amount = Math.abs(expense.amount);
        acc[category] = (acc[category] || 0) + amount;
        return acc;
    }, {});

    const chartData = Object.keys(categoryTotals).map((category, index) => ({
        id: `cat-${index}`,
        value: categoryTotals[category],
        label: category,
        color: getColor(index),
    }));

    return (
        <div className="flex flex-col items-center w-full space-y-6">
            <p className="text-gray-700 font-semibold text-center">
                Total des transactions affichées : {filteredExpenses.length}
            </p>

            {/* Sélecteurs */}
            <div className="flex flex-wrap justify-center space-x-4 w-full">
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

            {/* Graphique et légende */}
            <div className="flex justify-center space-x-12 w-full">
                <div className="w-1/3 rounded-lg p-6 h-auto ml-12 bg-white shadow-lg">
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
                    <div className="w-1/3 bg-white shadow-md rounded-lg p-6 h-auto">
                        <h3 className="text-lg font-bold text-gray-700 text-center mb-4">
                            Détails des Catégories
                        </h3>
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
                )}
            </div>
        </div>
    );
}

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
