const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  userId: { type: mongoose.Schema.Types.Mixed, required: true },
  title: { type: String, default: 'Career Target Goal' },
  targetIncome: { type: Number, required: true, default: 0 },
  currentIncome: { type: Number, default: 0 },
  targetMonths: { type: Number, default: 12 },
  declaredSkills: [{ type: String }],
  matchedJobs: [{
    role: String,
    industry: String,
    estimatedSalary: Number,
    requiredSkills: [String],
    gapSkills: [String],
    matchPercentage: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', GoalSchema);
