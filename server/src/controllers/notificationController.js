const Notification = require('../models/Notification');
const Income = require('../models/Income');
const Goal = require('../models/Goal');

const getNotifications = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.defaultTenant;
    let notifs = await Notification.find({ tenantId }).sort({ createdAt: -1 });

    const goal = await Goal.findOne({ tenantId });
    const incomes = await Income.find({ tenantId });
    const totalIncome = incomes.reduce((acc, i) => acc + i.amount, 0);

    const targetVal = goal?.targetIncome || 0;
    const completionPct = targetVal > 0 ? Math.min(100, Math.round((totalIncome / targetVal) * 100)) : 0;

    const dailyMotivation = {
      completionPct,
      message: targetVal > 0 
        ? `Awesome work ${req.user.name}! You are ${completionPct}% closer to your Rs. ${targetVal.toLocaleString()} monthly target goal.` 
        : `Welcome ${req.user.name}! Complete your profile to set your target income goal.`,
      suggestedNextAction: completionPct > 0 ? 'Complete your active milestone tasks!' : 'Set your career income target.'
    };

    res.json({
      dailyMotivation,
      notifications: notifs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications };
