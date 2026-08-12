/**
 * Multi-User Isolated In-Memory Data Store for RiseUp Financial Manager
 * Ensures each registered user receives their own isolated profile, incomes, goals, and budget policy.
 */

const defaultDemoUser = {
  _id: 'user_alex_1',
  name: 'Alex Rivera',
  email: 'alex@riseup.io',
  age: 42,
  ageBand: '30-49',
  medicalConditions: ['chronic_condition_high_cost'],
  isFirstLogin: false
};

const userStores = new Map();

function seedDemoStore() {
  const alexStore = {
    user: { ...defaultDemoUser },
    tenants: [
      { _id: 't_personal_alex', name: 'Personal Workspace', type: 'personal' },
      { _id: 't_household_alex', name: 'Rivera Household', type: 'household' }
    ],
    incomes: [
      { _id: 'inc_1', tenantId: 't_personal_alex', source: 'Senior Consultant Salary', amount: 480000, isFixed: true },
      { _id: 'inc_2', tenantId: 't_personal_alex', source: 'Freelance Advisory', amount: 120000, isFixed: false }
    ],
    expenses: [
      { _id: 'exp_1', tenantId: 't_personal_alex', title: 'Apartment Rent', amount: 180000, category: 'Housing' },
      { _id: 'exp_2', tenantId: 't_personal_alex', title: 'Health & Prescriptions', amount: 45000, category: 'Healthcare' },
      { _id: 'exp_3', tenantId: 't_personal_alex', title: 'Groceries & Dining', amount: 65000, category: 'Food & Dining' },
      { _id: 'exp_4', tenantId: 't_personal_alex', title: 'Car Loan & Fuel', amount: 40000, category: 'Transport' },
      { _id: 'exp_5', tenantId: 't_personal_alex', title: 'Hobbies & Streaming', amount: 12000, category: 'Hobbies & Leisure' }
    ],
    budget: {
      tenantId: 't_personal_alex',
      savingsPct: 15,
      loansPct: 15,
      familyPct: 20,
      dailyExpensesPct: 45,
      hobbiesPct: 5,
      policyApplied: {
        ageBand: '30-49',
        healthRiskTier: 'elevated_health_buffer',
        healthBufferPct: 15,
        notes: 'Health-aware policy active: Carved 15% health buffer due to chronic medical risk flags.'
      }
    },
    goal: {
      tenantId: 't_personal_alex',
      targetIncome: 850000,
      declaredSkills: ['Financial Modeling', 'Data Analytics', 'Project Management'],
      matchedJobs: [
        { role: 'Lead Financial Strategist', industry: 'FinTech', estimatedSalary: 880000, matchPercentage: 75, gapSkills: ['Risk Management', 'Python'] },
        { role: 'Senior Analytics Manager', industry: 'Enterprise Software', estimatedSalary: 920000, matchPercentage: 80, gapSkills: ['SQL', 'Executive Reporting'] }
      ]
    },
    roadmaps: [
      {
        _id: 'rm_1',
        tenantId: 't_personal_alex',
        month: 1,
        milestoneTitle: 'Month 1: Risk Management & Advanced Modeling Certification',
        targetIncomeIncrease: 50000,
        isCompleted: true,
        blockchainVerified: true,
        blockchainTxHash: '0x7a8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        tasks: [
          { _id: 'task_1', text: 'Complete Enterprise Risk Management Course', category: 'Skill Acquisition', completed: true },
          { _id: 'task_2', text: 'Build Automated Healthcare Buffer Savings Rule', category: 'Health Buffer', completed: true },
          { _id: 'task_3', text: 'Set aside LKR 120,000 in High-Yield Savings Account', category: 'Savings Target', completed: true }
        ]
      },
      {
        _id: 'rm_2',
        tenantId: 't_personal_alex',
        month: 2,
        milestoneTitle: 'Month 2: Python Data Analytics & FinTech Application Prep',
        targetIncomeIncrease: 100000,
        isCompleted: false,
        blockchainVerified: false,
        tasks: [
          { _id: 'task_4', text: 'Complete Python for Finance Certification', category: 'Skill Acquisition', completed: false },
          { _id: 'task_5', text: 'Apply to 3 Lead Financial Strategist positions', category: 'Job Application', completed: false },
          { _id: 'task_6', text: 'Maintain 20% Net Savings rate target', category: 'Savings Target', completed: false }
        ]
      }
    ],
    notifications: {
      dailyMotivation: {
        completionPct: 35,
        message: 'Awesome work Alex! You are 35% closer to your Rs. 850,000 monthly target goal. Complete Month 2 Python module!',
        suggestedNextAction: 'Complete your Python for Finance module to trigger your next milestone validation.'
      },
      notifications: [
        { title: 'Milestone Verified on Blockchain!', message: 'Month 1 milestone verified on-chain.', type: 'milestone' }
      ]
    },
    blockchainRecords: [
      {
        recordType: 'milestone_completion',
        sourceId: 'rm_1',
        dataHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        txHash: '0x7a8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        blockNumber: 18492011,
        timestamp: new Date()
      }
    ]
  };

  userStores.set('alex@riseup.io', alexStore);
  userStores.set('user_alex_1', alexStore);
  userStores.set('t_personal_alex', alexStore);
}

seedDemoStore();

function getUserStore(identifier) {
  if (!identifier) {
    return userStores.get('alex@riseup.io');
  }

  if (userStores.has(identifier)) {
    return userStores.get(identifier);
  }

  for (const store of userStores.values()) {
    if (
      store.user.email === identifier ||
      store.user._id === identifier ||
      store.tenants.some(t => t._id === identifier)
    ) {
      return store;
    }
  }

  return userStores.get('alex@riseup.io');
}

function createUserStore(userData) {
  const email = userData.email || `user_${Date.now()}@riseup.io`;
  const userId = userData._id || 'user_' + Date.now();
  const tenantId = 't_' + userId;

  const newUserStore = {
    user: {
      _id: userId,
      name: userData.name || email.split('@')[0],
      email: email,
      age: userData.age || 30,
      ageBand: userData.ageBand || '30-49',
      medicalConditions: userData.medicalConditions || [],
      isFirstLogin: userData.isFirstLogin !== undefined ? userData.isFirstLogin : true
    },
    tenants: [
      { _id: tenantId, name: `${userData.name || 'Personal'}'s Workspace`, type: 'personal' }
    ],
    incomes: [],
    expenses: [],
    budget: {
      tenantId: tenantId,
      savingsPct: 20,
      loansPct: 15,
      familyPct: 20,
      dailyExpensesPct: 35,
      hobbiesPct: 10,
      policyApplied: {
        ageBand: '30-49',
        healthRiskTier: 'standard_health_buffer',
        healthBufferPct: 5,
        notes: 'Standard policy active.'
      }
    },
    goal: {
      tenantId: tenantId,
      targetIncome: 500000,
      declaredSkills: ['Communication', 'Project Management'],
      matchedJobs: []
    },
    roadmaps: [
      {
        _id: 'rm_' + Date.now(),
        tenantId: tenantId,
        month: 1,
        milestoneTitle: 'Month 1: Financial Assessment & Core Skill Building',
        targetIncomeIncrease: 50000,
        isCompleted: false,
        blockchainVerified: false,
        tasks: [
          { _id: 'task_u1', text: 'Set up automated savings buffer', category: 'Savings Target', completed: false },
          { _id: 'task_u2', text: 'Complete initial skill development module', category: 'Skill Acquisition', completed: false }
        ]
      }
    ],
    notifications: {
      dailyMotivation: {
        completionPct: 0,
        message: `Welcome ${userData.name || 'Partner'}! Complete your profile to set your monthly income target.`,
        suggestedNextAction: 'Add your starting income streams and career target.'
      },
      notifications: [
        { title: 'Welcome to RiseUp!', message: 'Your personal financial dashboard is active.', type: 'info' }
      ]
    },
    blockchainRecords: []
  };

  userStores.set(email, newUserStore);
  userStores.set(userId, newUserStore);
  userStores.set(tenantId, newUserStore);
  return newUserStore;
}

// Backward compatibility accessor for fallback single mockData reference
const mockData = new Proxy({}, {
  get(target, prop) {
    const defaultStore = userStores.get('alex@riseup.io');
    return defaultStore[prop];
  },
  set(target, prop, value) {
    const defaultStore = userStores.get('alex@riseup.io');
    defaultStore[prop] = value;
    return true;
  }
});

module.exports = { getUserStore, createUserStore, mockData };
