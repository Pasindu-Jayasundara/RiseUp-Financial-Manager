const Income = require('../models/Income');
const Expense = require('../models/Expense');
const BudgetAllocation = require('../models/BudgetAllocation');
const { calculatePolicyAllocation } = require('../services/suggestionPolicy');
const { getUserStore } = require('../services/mockDataStore');

const getFinancialSummary = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const store = getUserStore(req.user?.email || tenantId);

    let dbIncomes = await Income.find({ tenantId });
    let dbExpenses = await Expense.find({ tenantId });

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
    const netCashflow = totalIncome - totalExpense;

    let budget = await BudgetAllocation.findOne({ tenantId });
    if (!budget) budget = store.budget;

    res.json({
      totalIncome,
      totalExpense,
      netCashflow,
      incomes,
      expenses,
      budget
    });
  } catch (error) {
    const store = getUserStore(req.user?.email || req.tenantId);
    const totalIncome = store.incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = store.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    res.json({
      totalIncome,
      totalExpense,
      netCashflow: totalIncome - totalExpense,
      incomes: store.incomes,
      expenses: store.expenses,
      budget: store.budget
    });
  }
};

const addIncome = async (req, res) => {
  try {
    const { source, amount, frequency, isFixed } = req.body;
    const store = getUserStore(req.user?.email || req.tenantId);

    let incomeObj = {
      _id: 'inc_' + Date.now(),
      tenantId: req.tenantId,
      source,
      amount: Number(amount),
      frequency: frequency || 'monthly',
      isFixed: isFixed !== undefined ? isFixed : true
    };

    try {
      const dbInc = await Income.create({
        tenantId: req.tenantId,
        source,
        amount: Number(amount),
        frequency: frequency || 'monthly',
        isFixed: isFixed !== undefined ? isFixed : true
      });
      incomeObj = dbInc;
    } catch (e) {}

    store.incomes.push(incomeObj);
    res.status(201).json(incomeObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const store = getUserStore(req.user?.email || req.tenantId);
    const { id } = req.params;

    try {
      await Income.findByIdAndDelete(id);
    } catch (e) {}

    store.incomes = store.incomes.filter(i => i._id.toString() !== id.toString());
    res.json({ message: 'Income entry deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;
    const store = getUserStore(req.user?.email || req.tenantId);

    let expObj = {
      _id: 'exp_' + Date.now(),
      tenantId: req.tenantId,
      title,
      amount: Number(amount),
      category: category || 'General'
    };

    try {
      const dbExp = await Expense.create({
        tenantId: req.tenantId,
        title,
        amount: Number(amount),
        category: category || 'General'
      });
      expObj = dbExp;
    } catch (e) {}

    store.expenses.push(expObj);
    res.status(201).json(expObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const store = getUserStore(req.user?.email || req.tenantId);
    const { id } = req.params;

    try {
      await Expense.findByIdAndDelete(id);
    } catch (e) {}

    store.expenses = store.expenses.filter(e => e._id.toString() !== id.toString());
    res.json({ message: 'Expense entry deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBudgetAllocation = async (req, res) => {
  try {
    const { savingsPct, loansPct, familyPct, dailyExpensesPct, hobbiesPct } = req.body;
    const store = getUserStore(req.user?.email || req.tenantId);

    store.budget = {
      ...store.budget,
      savingsPct,
      loansPct,
      familyPct,
      dailyExpensesPct,
      hobbiesPct
    };

    res.json(store.budget);
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
