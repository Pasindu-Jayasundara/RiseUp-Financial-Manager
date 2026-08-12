const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const { commitMilestoneToBlockchain } = require('../services/blockchainService');
const { getUserStore } = require('../services/mockDataStore');

const getGoalAndRoadmap = async (req, res) => {
  try {
    const store = getUserStore(req.user?.email || req.tenantId);
    const goal = await Goal.findOne({ tenantId: req.tenantId });
    const roadmaps = await Roadmap.find({ tenantId: req.tenantId });
    if (goal && roadmaps && roadmaps.length > 0) return res.json({ goal, roadmaps });
    res.json({ goal: store.goal, roadmaps: store.roadmaps });
  } catch (error) {
    const store = getUserStore(req.user?.email || req.tenantId);
    res.json({ goal: store.goal, roadmaps: store.roadmaps });
  }
};

const updateGoalSkills = async (req, res) => {
  try {
    const { targetIncome, declaredSkills } = req.body;
    const store = getUserStore(req.user?.email || req.tenantId);
    
    if (targetIncome !== undefined && targetIncome !== null) {
      const newTarget = Number(targetIncome);
      store.goal.targetIncome = newTarget;

      const totalIncome = store.incomes.reduce((acc, inc) => acc + inc.amount, 0);
      const completionPct = newTarget > 0 ? Math.min(100, Math.round((totalIncome / newTarget) * 100)) : 0;

      store.notifications.dailyMotivation.completionPct = completionPct;
      store.notifications.dailyMotivation.message = 
        `Awesome work ${store.user.name}! You are ${completionPct}% closer to your Rs. ${newTarget.toLocaleString()} monthly target goal. Complete Month 2 Python module!`;

      store.goal.matchedJobs = [
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

      if (store.roadmaps && store.roadmaps.length >= 2) {
        store.roadmaps[0].targetIncomeIncrease = Math.round(newTarget * 0.08);
        store.roadmaps[1].targetIncomeIncrease = Math.round(newTarget * 0.15);
      }
    }

    if (declaredSkills) {
      store.goal.declaredSkills = declaredSkills;
    }

    res.json(store.goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleMilestoneTask = async (req, res) => {
  try {
    const { roadmapId, taskId } = req.params;
    const store = getUserStore(req.user?.email || req.tenantId);

    const roadmap = store.roadmaps.find(r => r._id.toString() === roadmapId);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

    const task = roadmap.tasks.find(t => t._id.toString() === taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.completed = !task.completed;

    const allCompleted = roadmap.tasks.every(t => t.completed);
    if (allCompleted && !roadmap.isCompleted) {
      roadmap.isCompleted = true;
      roadmap.blockchainVerified = true;

      const recordData = {
        roadmapId: roadmap._id,
        milestoneTitle: roadmap.milestoneTitle,
        completedAt: new Date().toISOString()
      };

      const chainReceipt = await commitMilestoneToBlockchain(recordData);
      roadmap.blockchainTxHash = chainReceipt.txHash;

      store.blockchainRecords.push({
        recordType: 'milestone_completion',
        sourceId: roadmap._id,
        dataHash: chainReceipt.dataHash,
        txHash: chainReceipt.txHash,
        blockNumber: chainReceipt.blockNumber,
        timestamp: new Date()
      });
    }

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGoalAndRoadmap,
  updateGoalSkills,
  toggleMilestoneTask
};
