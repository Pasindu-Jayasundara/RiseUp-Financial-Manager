const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Income = require('../models/Income');
const Goal = require('../models/Goal');
const { calculatePolicyAllocation } = require('../services/suggestionPolicy');
const { mockData } = require('../services/mockDataStore');
const { JWT_SECRET } = require('../middleware/auth');

const seedDemoDataIfEmpty = async () => {};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    const ageBand = '30-49';
    mockData.user = {
      _id: 'user_' + Date.now(),
      name,
      email,
      age: 32,
      ageBand,
      medicalConditions: [],
      isFirstLogin: true
    };

    const token = jwt.sign({ id: mockData.user._id, email: mockData.user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: mockData.user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Default or fallback user
    if (!mockData.user.email || mockData.user.email === email) {
      mockData.user.email = email;
      if (req.body.name) mockData.user.name = req.body.name;
    } else {
      mockData.user.name = email.split('@')[0];
      mockData.user.email = email;
      mockData.user.isFirstLogin = false; // demo login assumes profile set
    }

    const token = jwt.sign({ id: mockData.user._id, email: mockData.user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: mockData.user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  const totalIncome = mockData.incomes.reduce((acc, i) => acc + i.amount, 0);
  const policy = calculatePolicyAllocation(mockData.user, totalIncome);
  res.json({
    user: mockData.user,
    policyApplied: policy.policyApplied
  });
};

const updateProfile = async (req, res) => {
  const { name, age, medicalConditions } = req.body;
  if (name) mockData.user.name = name;
  if (age) mockData.user.age = Number(age);
  if (medicalConditions) mockData.user.medicalConditions = medicalConditions;

  if (mockData.user.age >= 65) mockData.user.ageBand = '65+';
  else if (mockData.user.age >= 50) mockData.user.ageBand = '50-64';
  else if (mockData.user.age >= 30) mockData.user.ageBand = '30-49';
  else mockData.user.ageBand = '18-29';

  res.json(mockData.user);
};

const completeOnboarding = async (req, res) => {
  try {
    const { age, medicalConditions, fixedIncome, variableIncome, targetIncome, declaredSkills } = req.body;

    if (age) mockData.user.age = Number(age);
    if (medicalConditions) mockData.user.medicalConditions = medicalConditions;

    if (mockData.user.age >= 65) mockData.user.ageBand = '65+';
    else if (mockData.user.age >= 50) mockData.user.ageBand = '50-64';
    else if (mockData.user.age >= 30) mockData.user.ageBand = '30-49';
    else mockData.user.ageBand = '18-29';

    // Mark onboarding complete
    mockData.user.isFirstLogin = false;

    // Reset initial incomes from onboarding if provided
    mockData.incomes = [];
    if (fixedIncome && Number(fixedIncome) > 0) {
      mockData.incomes.push({
        _id: 'inc_fixed_' + Date.now(),
        tenantId: 't_personal',
        source: 'Primary Fixed Salary',
        amount: Number(fixedIncome),
        isFixed: true
      });
    }

    if (variableIncome && Number(variableIncome) > 0) {
      mockData.incomes.push({
        _id: 'inc_var_' + Date.now(),
        tenantId: 't_personal',
        source: 'Variable Advisory / Freelance',
        amount: Number(variableIncome),
        isFixed: false
      });
    }

    // Set goal target
    if (targetIncome && Number(targetIncome) > 0) {
      const newTarget = Number(targetIncome);
      mockData.goal.targetIncome = newTarget;

      const totalInc = mockData.incomes.reduce((acc, i) => acc + i.amount, 0);
      const completionPct = Math.min(100, Math.round((totalInc / newTarget) * 100));

      mockData.notifications.dailyMotivation.completionPct = completionPct;
      mockData.notifications.dailyMotivation.message =
        `Awesome work! You are ${completionPct}% closer to your Rs. ${newTarget.toLocaleString()} monthly target goal. Complete Month 2 Python module!`;
    }

    if (declaredSkills && Array.isArray(declaredSkills)) {
      mockData.goal.declaredSkills = declaredSkills;
    }

    // Recalculate 5-bucket policy allocation
    const totalInc = mockData.incomes.reduce((acc, i) => acc + i.amount, 0);
    const policyResult = calculatePolicyAllocation(mockData.user, totalInc);
    mockData.budget = {
      ...mockData.budget,
      savingsPct: policyResult.savingsPct,
      loansPct: policyResult.loansPct,
      familyPct: policyResult.familyPct,
      dailyExpensesPct: policyResult.dailyExpensesPct,
      hobbiesPct: policyResult.hobbiesPct,
      policyApplied: policyResult.policyApplied
    };

    res.json({
      user: mockData.user,
      incomes: mockData.incomes,
      goal: mockData.goal,
      budget: mockData.budget
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, completeOnboarding, seedDemoDataIfEmpty };
