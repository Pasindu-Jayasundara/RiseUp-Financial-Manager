const Income = require('../models/Income');
const Expense = require('../models/Expense');
const BudgetAllocation = require('../models/BudgetAllocation');
const User = require('../models/User');
const { calculatePolicyAllocation } = require('../services/suggestionPolicy');

const getFinancialSummary = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.defaultTenant;
    const incomes = await Income.find({ tenantId });
    const expenses = await Expense.find({ tenantId });

    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netCashflow = totalIncome - totalExpense;

    let budget = await BudgetAllocation.findOne({ tenantId });

    if (!budget) {
      const user = await User.findById(req.user._id);
      const policyResult = calculatePolicyAllocation(user || { age: 30, ageBand: '30-49', medicalConditions: [] }, totalIncome);

      budget = await BudgetAllocation.create({
        tenantId,
        totalIncome,
        savingsPct: policyResult.savingsPct,
        loansPct: policyResult.loansPct,
        familyPct: policyResult.familyPct,
        dailyExpensesPct: policyResult.dailyExpensesPct,
        hobbiesPct: policyResult.hobbiesPct,
        policyApplied: policyResult.policyApplied
      });
    }

    res.json({
      totalIncome,
      totalExpense,
      netCashflow,
      incomes,
      expenses,
      budget
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addIncome = async (req, res) => {
  try {
    const { source, amount, frequency, isFixed } = req.body;
    const tenantId = req.tenantId || req.user?.defaultTenant;

    const income = await Income.create({
      tenantId,
      userId: req.user._id,
      source,
      amount: Number(amount),
      frequency: frequency || 'monthly',
      isFixed: isFixed !== undefined ? isFixed : true
    });

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    await Income.findByIdAndDelete(id);
    res.json({ message: 'Income entry deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;
    const tenantId = req.tenantId || req.user?.defaultTenant;

    const expense = await Expense.create({
      tenantId,
      userId: req.user._id,
      title,
      amount: Number(amount),
      category: category || 'General'
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    res.json({ message: 'Expense entry deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBudgetAllocation = async (req, res) => {
  try {
    const { savingsPct, loansPct, familyPct, dailyExpensesPct, hobbiesPct } = req.body;
    const tenantId = req.tenantId || req.user?.defaultTenant;

    const budget = await BudgetAllocation.findOneAndUpdate(
      { tenantId },
      {
        savingsPct,
        loansPct,
        familyPct,
        dailyExpensesPct,
        hobbiesPct,
        isCustomized: true,
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFinancialSummary,
  addIncome,
  deleteIncome,
  addExpense,
  deleteExpense,
  updateBudgetAllocation
};
