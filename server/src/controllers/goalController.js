const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const { commitMilestoneToBlockchain } = require('../services/blockchainService');
const { mockData } = require('../services/mockDataStore');

const getGoalAndRoadmap = async (req, res) => {
  try {
    const goal = await Goal.findOne({ tenantId: req.tenantId });
    const roadmaps = await Roadmap.find({ tenantId: req.tenantId });
    if (goal && roadmaps && roadmaps.length > 0) return res.json({ goal, roadmaps });
    res.json({ goal: mockData.goal, roadmaps: mockData.roadmaps });
  } catch (error) {
    res.json({ goal: mockData.goal, roadmaps: mockData.roadmaps });
  }
};

const updateGoalSkills = async (req, res) => {
  try {
    const { targetIncome, declaredSkills } = req.body;
    
    if (targetIncome !== undefined && targetIncome !== null) {
      const newTarget = Number(targetIncome);
      mockData.goal.targetIncome = newTarget;

      // Calculate current income towards goal
      const totalIncome = mockData.incomes.reduce((acc, inc) => acc + inc.amount, 0);
      const completionPct = newTarget > 0 ? Math.min(100, Math.round((totalIncome / newTarget) * 100)) : 0;

      // Dynamically update daily motivation banner message on Dashboard
      mockData.notifications.dailyMotivation.completionPct = completionPct;
      mockData.notifications.dailyMotivation.message = 
        `Awesome work! You are ${completionPct}% closer to your Rs. ${newTarget.toLocaleString()} monthly target goal. Complete Month 2 Python module!`;

      // Dynamically scale matched jobs based on new target goal
      mockData.goal.matchedJobs = [
        {
          role: 'Lead Financial Strategist',
          industry: 'FinTech',
          estimatedSalary: Math.round(newTarget * 1.05),
          matchPercentage: 75,
          gapSkills: ['Risk Management', 'Python']
        },
        {
          role: 'Senior Analytics Manager',
          industry: 'Enterprise Software',
          estimatedSalary: Math.round(newTarget * 1.10),
          matchPercentage: 80,
          gapSkills: ['SQL', 'Executive Reporting']
        }
      ];

      // Dynamically scale milestone target income increases
      if (mockData.roadmaps && mockData.roadmaps.length >= 2) {
        mockData.roadmaps[0].targetIncomeIncrease = Math.round(newTarget * 0.08);
        mockData.roadmaps[1].targetIncomeIncrease = Math.round(newTarget * 0.15);
      }
    }

    if (declaredSkills) {
      mockData.goal.declaredSkills = declaredSkills;
    }

    res.json({ goal: mockData.goal, roadmaps: mockData.roadmaps });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleTaskCompletion = async (req, res) => {
  try {
    const { roadmapId, taskId } = req.params;
    let foundTask = null;
    let targetRm = null;

    mockData.roadmaps.forEach(rm => {
      if (rm._id === roadmapId) {
        targetRm = rm;
        rm.tasks.forEach(t => {
          if (t._id === taskId) {
            t.completed = !t.completed;
            foundTask = t;
          }
        });
        const allCompleted = rm.tasks.every(t => t.completed);
        rm.isCompleted = allCompleted;
        if (allCompleted && !rm.blockchainVerified) {
          rm.blockchainVerified = true;
          rm.blockchainTxHash = '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2);
        }
      }
    });

    res.json({ roadmap: targetRm });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGoalAndRoadmap, updateGoalSkills, toggleTaskCompletion };
