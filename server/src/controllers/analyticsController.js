const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { generate12MonthForecast } = require('../services/forecastingEngine');
const { mockData } = require('../services/mockDataStore');
const { generateAIAnalysis } = require('../services/aiAdvisorService');

const getAnalyticsAndForecast = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    let dbIncomes = [];
    let dbExpenses = [];

    try {
      dbIncomes = await Income.find({ tenantId });
      dbExpenses = await Expense.find({ tenantId });
    } catch (e) {
      // DB query error, fallback to mockData
    }

    let incomes = (dbIncomes && dbIncomes.length > 0) ? dbIncomes : mockData.incomes;
    let expenses = (dbExpenses && dbExpenses.length > 0) ? dbExpenses : mockData.expenses;

    // Normalize any legacy unscaled amounts (< 1000 => * 100 for LKR currency consistency)
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

const getAIAnalysisReport = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    let dbIncomes = [];
    let dbExpenses = [];

    try {
      dbIncomes = await Income.find({ tenantId });
      dbExpenses = await Expense.find({ tenantId });
    } catch (e) {
      // DB query error, fallback to mockData
    }

    let incomes = (dbIncomes && dbIncomes.length > 0) ? dbIncomes : mockData.incomes;
    let expenses = (dbExpenses && dbExpenses.length > 0) ? dbExpenses : mockData.expenses;

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
    const netSavings = totalIncome - totalExpense;

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

    const aiAnalysis = await generateAIAnalysis({
      totalIncome,
      totalExpense,
      netSavings,
      targetIncomeGoal: mockData.goal?.targetIncome || 850000,
      declaredSkills: mockData.goal?.declaredSkills || [],
      user: mockData.user || {},
      spendBreakdown
    });

    res.json(aiAnalysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalyticsAndForecast, getAIAnalysisReport };
