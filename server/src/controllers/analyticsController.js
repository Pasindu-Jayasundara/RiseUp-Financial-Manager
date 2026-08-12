const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Goal = require('../models/Goal');
const BudgetAllocation = require('../models/BudgetAllocation');
const User = require('../models/User');
const { generate12MonthForecast } = require('../services/forecastingEngine');
const { generateAIAnalysis } = require('../services/aiAdvisorService');

const getAnalyticsAndForecast = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.defaultTenant;
    const incomes = await Income.find({ tenantId });
    const expenses = await Expense.find({ tenantId });
    const goal = await Goal.findOne({ tenantId });
    const budget = await BudgetAllocation.findOne({ tenantId });

    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const categoryMap = {};
    expenses.forEach(exp => {
      const cat = exp.category || 'General';
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
      roadmapCompletionRate: 0.5,
      savingsRate: (budget?.savingsPct || 20) / 100,
      skillCount: goal?.declaredSkills?.length || 2,
      targetIncomeGoal: goal?.targetIncome || totalIncome * 1.5
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
    const tenantId = req.tenantId || req.user?.defaultTenant;
    const user = await User.findById(req.user._id).select('-password');
    const incomes = await Income.find({ tenantId });
    const expenses = await Expense.find({ tenantId });
    const goal = await Goal.findOne({ tenantId });
    const budget = await BudgetAllocation.findOne({ tenantId });

    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const categoryMap = {};
    expenses.forEach(exp => {
      const cat = exp.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount;
    });

    const spendBreakdown = Object.keys(categoryMap).map(cat => ({
      category: cat,
      amount: categoryMap[cat],
      percentage: totalExpense > 0 ? Math.round((categoryMap[cat] / totalExpense) * 100) : 0
    }));

    const userData = {
      user: user || req.user,
      summary: {
        totalIncome,
        totalExpense,
        netCashflow: totalIncome - totalExpense
      },
      goal: goal || { targetIncome: 0, declaredSkills: [] },
      budget: budget || { savingsPct: 20, dailyExpensesPct: 35 },
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
