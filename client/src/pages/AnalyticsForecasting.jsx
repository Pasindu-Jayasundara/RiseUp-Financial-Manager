import React, { useState } from 'react';
import { TrendingUp, PieChart, Sparkles, AlertCircle, HelpCircle, Bot, RefreshCw, CheckCircle2, Zap } from 'lucide-react';

export default function AnalyticsForecasting({ analyticsData, aiAnalysis, onRefreshAI }) {
  const [loadingAI, setLoadingAI] = useState(false);

  const breakdown = analyticsData?.spendBreakdown || [
    { category: 'Housing', amount: 180000, percentage: 53 },
    { category: 'Healthcare', amount: 45000, percentage: 13 },
    { category: 'Food & Dining', amount: 65000, percentage: 19 },
    { category: 'Transport', amount: 40000, percentage: 12 },
    { category: 'Hobbies & Leisure', amount: 12000, percentage: 3 }
  ];

  const forecast = analyticsData?.forecast || {
    confidenceScore: 85,
    projected12MonthRange: { low: 680000, mid: 820000, high: 940000 },
    explanationFactors: [
      "Roadmap Completion Pace: 75% (+3.5% monthly trajectory acceleration)",
      "Active Skills Leveraged: 3 verified skills driving career progression",
      "Current Net Savings Rate: 20% monthly reserve stability"
    ],
    forecastData: [
      { month: 'M1', incomeMid: 610000, cumulativeSavingsMid: 80000 },
      { month: 'M3', incomeMid: 650000, cumulativeSavingsMid: 260000 },
      { month: 'M6', incomeMid: 720000, cumulativeSavingsMid: 590000 },
      { month: 'M9', incomeMid: 780000, cumulativeSavingsMid: 980000 },
      { month: 'M12', incomeMid: 850000, cumulativeSavingsMid: 1420000 }
    ]
  };

  const handleRunAI = async () => {
    setLoadingAI(true);
    if (onRefreshAI) await onRefreshAI();
    setLoadingAI(false);
  };

  const aiReport = aiAnalysis || {
    isLiveAI: false,
    provider: 'Google Gemini 1.5 Flash (Add GEMINI_API_KEY to server/.env to activate live API)',
    aiOverview: 'Your net monthly savings rate offers strong leverage to achieve your career target goal.',
    actionableRecommendations: [
      'Optimize daily housing and transport budget by 5-10%.',
      'Leverage active skills to apply for Lead Financial Strategist roles.',
      'Maintain health buffer reserve for emergency protection.'
    ],
    riskMitigationNote: 'Health risk policy active: maintain dedicated reserve buffer.',
    careerStrategy: 'Focus on enterprise certifications to bridge target salary gap.'
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Analytics & Predictive Forecasting</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          ML-driven financial position projection, deterministic spend breakdowns, and external AI analysis.
        </p>
      </div>

      {/* External AI Financial & Strategy Advisor Card */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '24px', marginBottom: '28px', border: '1px solid rgba(124, 58, 237, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={24} color="var(--accent-purple)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                External AI Strategy & Advisory Engine
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Powered by {aiReport.provider}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`badge ${aiReport.isLiveAI ? 'badge-emerald' : 'badge-purple'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={14} /> {aiReport.isLiveAI ? 'Live Gemini AI Connected' : 'AI Analysis Ready'}
            </span>
            <button className="btn-primary" onClick={handleRunAI} disabled={loadingAI} id="run-ai-analysis-btn">
              <RefreshCw size={16} className={loadingAI ? 'spin' : ''} />
              {loadingAI ? 'Running AI...' : 'Re-Run AI Analysis'}
            </button>
          </div>
        </div>

        {/* Executive Overview */}
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '10px', border: '1px solid var(--bg-card-border)', marginBottom: '18px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
            AI Executive Assessment
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500 }}>
            {aiReport.aiOverview}
          </p>
        </div>

        {/* 3 Column AI Insights Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {/* Recommendations */}
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid var(--bg-card-border)' }}>
            <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '10px' }}>
              Actionable AI Recommendations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(aiReport.actionableRecommendations || []).map((rec, rIdx) => (
                <div key={rIdx} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Mitigation */}
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid var(--bg-card-border)' }}>
            <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-rose)', fontWeight: 700, marginBottom: '10px' }}>
              Risk Mitigation & Health Strategy
            </h4>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {aiReport.riskMitigationNote}
            </p>
          </div>

          {/* Career Strategy */}
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid var(--bg-card-border)' }}>
            <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: '10px' }}>
              Skill & Career Acceleration
            </h4>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {aiReport.careerStrategy}
            </p>
          </div>
        </div>
      </div>

      {/* Spend Breakdown & ML Model Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Spend Breakdown Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} color="var(--accent-amber)" /> Spend Breakdown by Category
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {breakdown.map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.category}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Rs. {item.amount.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      background: i % 2 === 0 ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #d97706, #e11d48)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ML Forecast Summary Card */}
        <div className="glass-panel glass-panel-glow" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--accent-cyan)" /> System-Inferred ML Position Forecast
            </h3>
            <span className="badge badge-cyan">{forecast.confidenceScore}% Confidence</span>
          </div>

          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--bg-card-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Projected 12-Month Monthly Income Range
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '4px 0' }}>
              Rs. {forecast.projected12MonthRange.low.toLocaleString()} &ndash; Rs. {forecast.projected12MonthRange.high.toLocaleString()} / mo
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Midpoint Expected: Rs. {forecast.projected12MonthRange.mid.toLocaleString()} / month
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-purple)', marginBottom: '8px' }}>Explainable Model Factors:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(forecast.explanationFactors || []).map((factor, fidx) => (
                <div key={fidx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                  {factor}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 12-Month Trajectory Chart Visualizer */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="var(--accent-emerald)" /> 12-Month Financial Trajectory Forecast
        </h3>

        {/* Trajectory Bar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${forecast.forecastData.length}, 1fr)`, gap: '16px', alignItems: 'end', height: '220px', padding: '16px 0', borderBottom: '1px solid var(--bg-card-border)' }}>
          {forecast.forecastData.map((d, idx) => {
            const heightPct = Math.min(100, Math.max(20, (d.incomeMid / 1000000) * 100));
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '6px' }}>
                  Rs. {(d.incomeMid / 1000).toFixed(0)}k
                </div>
                <div style={{
                  width: '80%',
                  height: `${heightPct}%`,
                  background: 'var(--gradient-primary)',
                  borderRadius: '6px 6px 0 0',
                  boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
                  transition: 'height 0.3s ease'
                }} />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {d.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
