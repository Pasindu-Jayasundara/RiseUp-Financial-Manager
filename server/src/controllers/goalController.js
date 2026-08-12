const Goal = require('../models/Goal');
const Roadmap = require('../models/Roadmap');
const Income = require('../models/Income');
const { commitMilestoneToBlockchain } = require('../services/blockchainService');

const getGoalAndRoadmap = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.defaultTenant;
    let goal = await Goal.findOne({ tenantId });
    let roadmaps = await Roadmap.find({ tenantId });

    if (!goal) {
      goal = {
        tenantId,
        targetIncome: 0,
        declaredSkills: ['Project Management', 'Communication'],
        matchedJobs: []
      };
    }

    if (!roadmaps || roadmaps.length === 0) {
      roadmaps = [];
    }

    res.json({ goal, roadmaps });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGoalSkills = async (req, res) => {
  try {
    const { targetIncome, declaredSkills } = req.body;
    const tenantId = req.tenantId || req.user?.defaultTenant;

    let goal = await Goal.findOne({ tenantId });
    const targetVal = targetIncome !== undefined ? Number(targetIncome) : (goal?.targetIncome || 0);

    const matchedJobs = targetVal > 0 ? [
      {
        role: 'Lead Financial Strategist',
        industry: 'FinTech',
        estimatedSalary: Math.round(targetVal * 1.05),
        matchPercentage: 75,
        gapSkills: ['Risk Management', 'Python']
      },
      {
        role: 'Senior Analytics Manager',
        industry: 'Enterprise Software',
        estimatedSalary: Math.round(targetVal * 1.10),
        matchPercentage: 80,
        gapSkills: ['SQL', 'Executive Reporting']
      }
    ] : [];

    const updatedSkills = declaredSkills || goal?.declaredSkills || [];

    goal = await Goal.findOneAndUpdate(
      { tenantId },
      {
        tenantId,
        userId: req.user._id,
        targetIncome: targetVal,
        declaredSkills: updatedSkills,
        matchedJobs
      },
      { upsert: true, new: true }
    );

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleMilestoneTask = async (req, res) => {
  try {
    const { roadmapId, taskId } = req.params;
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

    const task = roadmap.tasks.id(taskId);
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
    }

    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGoalAndRoadmap,
  updateGoalSkills,
  toggleMilestoneTask,
  toggleTaskCompletion: toggleMilestoneTask
};
