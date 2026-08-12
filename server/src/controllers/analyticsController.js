const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { generate12MonthForecast } = require('../services/forecastingEngine');
const { getUserStore } = require('../services/mockDataStore');
const { generateAIAnalysis } = require('../services/aiAdvisorService');

const getAnalyticsAndForecast = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const store = getUserStore(req.user?.email || tenantId);

    let dbIncomes = [];
    let dbExpenses = [];

    try {
      dbIncomes = await Income.find({ tenantId });
      dbExpenses = await Expense.find({ tenantId });
    } catch (e) {}

    let incomes = (dbIncomes && dbIncomes.length > 0) ? dbIncomes : store.incomes;
    let expenses = (dbExpenses && dbExpenses.length > 0) ? dbExpenses : store.expenses;

    // Normalize legacy unscaled amounts (< 1000 => * 100)
    incomes = incomes.map(inc => ({
      ...inc.toObject ? inc.toObject() : inc,
      amount: inc.amount < 1000 ? inc.amount * 100 : inc.amount
    }));

    expenses = expenses.map(exp => ({
      ...exp.toObject ? exp.toObject() : exp,
      amount: exp.amount < 1000 ? exp.amount * 100 : exp.amount
    }));

    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const categoryMap = {};
    expenses.forEach(exp => {
      const cat = exp.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount;
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
      savingsRate: (store.budget?.savingsPct || 15) / 100,
      skillCount: store.goal?.declaredSkills?.length || 3,
      targetIncomeGoal: store.goal?.targetIncome || 850000
    });

    res.json({
      totalIncome,
      totalExpense,
      spendBreakdown,
      forecast
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAIAnalysisReport = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const store = getUserStore(req.user?.email || tenantId);

    let dbIncomes = [];
    let dbExpenses = [];

    try {
      dbIncomes = await Income.find({ tenantId });
      dbExpenses = await Expense.find({ tenantId });
    } catch (e) {}

    let incomes = (dbIncomes && dbIncomes.length > 0) ? dbIncomes : store.incomes;
    let expenses = (dbExpenses && dbExpenses.length > 0) ? dbExpenses : store.expenses;

    incomes = incomes.map(inc => ({
      ...inc.toObject ? inc.toObject() : inc,
      amount: inc.amount < 1000 ? inc.amount * 100 : inc.amount
    }));

    expenses = expenses.map(exp => ({
      ...exp.toObject ? exp.toObject() : exp,
      amount: exp.amount < 1000 ? exp.amount * 100 : exp.amount
    }));

    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const categoryMap = {};
    expenses.forEach(exp => {
      const cat = exp.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount;
    });

    const spendBreakdown = Object.keys(categoryMap).map(cat => ({
      category: cat,
      amount: categoryMap[cat],
      percentage: totalExpense > 0 ? Math.round((categoryMap[cat] / totalExpense) * 100) : 0
    }));

    const userData = {
      user: store.user,
      summary: {
        totalIncome,
        totalExpense,
        netCashflow: totalIncome - totalExpense
      },
      goal: store.goal,
      budget: store.budget,
      spendBreakdown
    };

    const aiReport = await generateAIAnalysis(userData);
    res.json(aiReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalyticsAndForecast,
  getAIAnalysisReport
};
