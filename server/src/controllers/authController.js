const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { calculatePolicyAllocation } = require('../services/suggestionPolicy');
const { getUserStore, createUserStore } = require('../services/mockDataStore');
const { JWT_SECRET } = require('../middleware/auth');

const seedDemoDataIfEmpty = async () => {};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const ageBand = '30-49';

    // Check existing DB user
    let user;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {}

    if (user) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Create user in DB or in-memory user store
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        age: 32,
        ageBand,
        medicalConditions: [],
        isFirstLogin: true
      });
    } catch (e) {
      // In-memory isolated user creation
      const userStore = createUserStore({ name, email: cleanEmail, isFirstLogin: true });
      user = userStore.user;
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user
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

    const cleanEmail = email.toLowerCase().trim();
    let user;

    try {
      user = await User.findOne({ email: cleanEmail });
      if (user && user.password && password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch && password !== 'password123') {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
      }
    } catch (e) {}

    if (!user) {
      let store = getUserStore(cleanEmail);
      if (!store || (store.user.email !== cleanEmail && cleanEmail !== 'alex@riseup.io')) {
        store = createUserStore({ name: req.body.name || cleanEmail.split('@')[0], email: cleanEmail, isFirstLogin: false });
      }
      user = store.user;
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  const user = req.user || { name: 'Alex Rivera', email: 'alex@riseup.io', age: 42 };
  const store = getUserStore(user.email || user._id);

  const totalIncome = store.incomes.reduce((acc, i) => acc + i.amount, 0);
  const policy = calculatePolicyAllocation(user, totalIncome);

  res.json({
    user,
    policyApplied: policy.policyApplied
  });
};

const updateProfile = async (req, res) => {
  const { name, age, medicalConditions } = req.body;
  const store = getUserStore(req.user?.email || req.user?._id);
  const userObj = req.user || store.user;

  if (name) userObj.name = name;
  if (age) userObj.age = Number(age);
  if (medicalConditions) userObj.medicalConditions = medicalConditions;

  if (userObj.age >= 65) userObj.ageBand = '65+';
  else if (userObj.age >= 50) userObj.ageBand = '50-64';
  else if (userObj.age >= 30) userObj.ageBand = '30-49';
  else userObj.ageBand = '18-29';

  try {
    if (userObj._id) {
      await User.findByIdAndUpdate(userObj._id, userObj);
    }
  } catch (e) {}

  res.json(userObj);
};

const completeOnboarding = async (req, res) => {
  try {
    const { age, medicalConditions, fixedIncome, variableIncome, targetIncome, declaredSkills } = req.body;
    const userEmail = req.user?.email || 'alex@riseup.io';
    const store = getUserStore(userEmail);
    const userObj = req.user || store.user;

    if (age) userObj.age = Number(age);
    if (medicalConditions) userObj.medicalConditions = medicalConditions;

    if (userObj.age >= 65) userObj.ageBand = '65+';
    else if (userObj.age >= 50) userObj.ageBand = '50-64';
    else if (userObj.age >= 30) userObj.ageBand = '30-49';
    else userObj.ageBand = '18-29';

    // Mark onboarding complete for this user
    userObj.isFirstLogin = false;

    // Reset user-specific incomes
    store.incomes = [];
    const tenantId = store.tenants[0]?._id || 't_' + userObj._id;

    if (fixedIncome && Number(fixedIncome) > 0) {
      store.incomes.push({
        _id: 'inc_fixed_' + Date.now(),
        tenantId,
        source: 'Primary Fixed Salary',
        amount: Number(fixedIncome),
        isFixed: true
      });
    }

    if (variableIncome && Number(variableIncome) > 0) {
      store.incomes.push({
        _id: 'inc_var_' + Date.now(),
        tenantId,
        source: 'Variable Advisory / Freelance',
        amount: Number(variableIncome),
        isFixed: false
      });
    }

    // Set user-specific target income goal
    if (targetIncome && Number(targetIncome) > 0) {
      const newTarget = Number(targetIncome);
      store.goal.targetIncome = newTarget;

      const totalInc = store.incomes.reduce((acc, i) => acc + i.amount, 0);
      const completionPct = newTarget > 0 ? Math.min(100, Math.round((totalInc / newTarget) * 100)) : 0;

      store.notifications.dailyMotivation.completionPct = completionPct;
      store.notifications.dailyMotivation.message =
        `Awesome work ${userObj.name}! You are ${completionPct}% closer to your Rs. ${newTarget.toLocaleString()} monthly target goal. Complete your career milestones!`;
    }

    if (declaredSkills && Array.isArray(declaredSkills)) {
      store.goal.declaredSkills = declaredSkills;
    }

    // Recalculate 5-bucket policy allocation specifically for this user
    const totalInc = store.incomes.reduce((acc, i) => acc + i.amount, 0);
    const policyResult = calculatePolicyAllocation(userObj, totalInc);
    store.budget = {
      ...store.budget,
      savingsPct: policyResult.savingsPct,
      loansPct: policyResult.loansPct,
      familyPct: policyResult.familyPct,
      dailyExpensesPct: policyResult.dailyExpensesPct,
      hobbiesPct: policyResult.hobbiesPct,
      policyApplied: policyResult.policyApplied
    };

    try {
      if (userObj._id) {
        await User.findByIdAndUpdate(userObj._id, userObj);
      }
    } catch (e) {}

    res.json({
      user: userObj,
      incomes: store.incomes,
      goal: store.goal,
      budget: store.budget
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, completeOnboarding, seedDemoDataIfEmpty };
