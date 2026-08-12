const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * External AI Service using Google Gemini API
 * Analyzes financial metrics, age, health risk factors, skills, and goals
 * to produce actionable strategic advice and personalized motivation.
 */
const generateAIAnalysis = async ({
  totalIncome,
  totalExpense,
  netSavings,
  targetIncomeGoal,
  declaredSkills = [],
  user = {},
  spendBreakdown = []
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;
  const age = user.age || 42;
  const conditions = user.medicalConditions || [];
  const skillsText = declaredSkills.length > 0 ? declaredSkills.join(', ') : 'Financial Analytics';

  // Structured Prompt Context
  const prompt = `
You are an expert AI Financial Strategist and Career Advisor for RiseUp Financial Manager.
Analyze the following user financial and profile metrics:
- Monthly Income: Rs. ${totalIncome.toLocaleString()}
- Monthly Expenses: Rs. ${totalExpense.toLocaleString()}
- Monthly Net Savings: Rs. ${netSavings.toLocaleString()} (${savingsRate}% savings rate)
- Target Monthly Goal: Rs. ${targetIncomeGoal.toLocaleString()}
- User Age: ${age}
- Health Risk Flags: ${conditions.join(', ') || 'None'}
- Declared Career Skills: ${skillsText}
- Top Spend Categories: ${spendBreakdown.map(b => `${b.category} (${b.percentage}%)`).join(', ')}

Please provide a JSON response with the following keys:
1. "aiOverview": A concise, 2-sentence executive assessment of their current position.
2. "actionableRecommendations": An array of 3 bullet points with specific steps to reach their target goal.
3. "riskMitigationNote": A 1-sentence note addressing health/emergency buffer considerations based on age/medical profile.
4. "careerStrategy": A 1-sentence suggestion on how to leverage skills (${skillsText}) to reach Rs. ${targetIncomeGoal.toLocaleString()}.

Return ONLY valid JSON format without markdown code fences.
  `;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleanedText);
      return {
        isLiveAI: true,
        provider: 'Google Gemini 1.5 Flash',
        ...parsed
      };
    } catch (err) {
      console.warn('Gemini API call warning, using intelligent local engine fallback:', err.message);
    }
  }

  // Intelligent Fallback Strategy when GEMINI_API_KEY is not configured
  return {
    isLiveAI: false,
    provider: 'RiseUp Deterministic AI Engine (Configure GEMINI_API_KEY for Live Gemini 1.5)',
    aiOverview: `With a monthly reserve of Rs. ${netSavings.toLocaleString()} (${savingsRate}% savings rate), you are actively building financial momentum toward your target goal of Rs. ${targetIncomeGoal.toLocaleString()}.`,
    actionableRecommendations: [
      `Optimize Housing & Healthcare spend to boost monthly net savings from ${savingsRate}% to 25%.`,
      `Leverage skills in ${skillsText} to qualify for high-tier advisory roles reaching Rs. ${targetIncomeGoal.toLocaleString()}/mo.`,
      `Set aside a dedicated ${age >= 50 || conditions.length > 0 ? '15%' : '10%'} health buffer to protect against unexpected medical costs.`
    ],
    riskMitigationNote: age >= 50 || conditions.length > 0
      ? `Health-aware policy active: Carved elevated emergency buffer due to age (${age}) and medical risk profile.`
      : `Standard risk buffer active: Maintain at least 6 months of daily expenses in liquid savings.`,
    careerStrategy: `Focus on mastering high-value certifications in ${skillsText} to bridge the gap to your target income of Rs. ${targetIncomeGoal.toLocaleString()}.`
  };
};

module.exports = { generateAIAnalysis };
