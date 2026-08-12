const { generate12MonthForecast } = require('../services/forecastingEngine');
const { mockData } = require('../services/mockDataStore');

const getAnalyticsAndForecast = async (req, res) => {
  try {
    const totalIncome = mockData.incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = mockData.expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const categoryMap = {};
    mockData.expenses.forEach(exp => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
    });

    const spendBreakdown = Object.keys(categoryMap).map(cat => ({
      category: cat,
      amount: categoryMap[cat],
      percentage: totalExpense > 0 ? Math.round((categoryMap[cat] / totalExpense) * 100) : 0
    }));

    const forecast = generate12MonthForecast({
      currentMonthlyIncome: totalIncome,
      currentMonthlyExpense: totalExpense,
      roadmapCompletionRate: 0.75,
      savingsRate: (mockData.budget?.savingsPct || 15) / 100,
      skillCount: mockData.goal?.declaredSkills?.length || 3,
      targetIncomeGoal: mockData.goal?.targetIncome || 850000
    });

    res.json({
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      spendBreakdown: spendBreakdown.length > 0 ? spendBreakdown : [
        { category: 'Housing', amount: 180000, percentage: 53 },
        { category: 'Healthcare', amount: 45000, percentage: 13 },
        { category: 'Food & Dining', amount: 65000, percentage: 19 },
        { category: 'Transport', amount: 40000, percentage: 12 },
        { category: 'Hobbies & Leisure', amount: 12000, percentage: 3 }
      ],
      forecast
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalyticsAndForecast };
