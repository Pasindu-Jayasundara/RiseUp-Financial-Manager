const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  userId: { type: mongoose.Schema.Types.Mixed, required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Housing', 'Healthcare', 'Food & Dining', 'Transport', 'Utilities', 'Hobbies & Leisure', 'Debt/Loan', 'General'], 
    default: 'General' 
  },
  isRecurring: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
