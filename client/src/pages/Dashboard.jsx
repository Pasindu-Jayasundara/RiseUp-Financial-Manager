import React from 'react';
import { Wallet, TrendingUp, Target, ShieldCheck, HeartPulse, Sparkles, ArrowUpRight, CheckCircle2, User, Award } from 'lucide-react';

export default function Dashboard({ user, financeData, goalData, analyticsData, notifications, setActiveTab }) {
  const summary = financeData || { totalIncome: 600000, totalExpense: 342000, netCashflow: 258000 };
  const dailyMotivation = notifications?.dailyMotivation || {
    completionPct: 35,
    message: "You are 35% closer to your monthly target goal. Complete Month 2 Python module!",
    suggestedNextAction: "Complete your Python for Finance module to trigger your next milestone validation."
  };

  const budget = summary.budget || {
    savingsPct: 20,
    loansPct: 15,
    familyPct: 20,
    dailyExpensesPct: 35,
    hobbiesPct: 10
  };

  const userName = user?.name || 'Alex Rivera';
  const userAge = user?.age || 42;
  const userAgeBand = user?.ageBand || '30-49';
  const hasMedicalRisk = user?.medicalConditions && user.medicalConditions.length > 0 && !user.medicalConditions.includes('none');
  const targetIncome = goalData?.goal?.targetIncome || 850000;

  return (
    <div>
      {/* User Personal Profile Bar */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.1rem'
          }}>
            {userName[0]}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Welcome back, {userName}!
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {user?.email || 'alex@riseup.io'} &bull; Personal Workspace Active
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}>
            <User size={14} /> Age {userAge} ({userAgeBand})
          </span>

          <span className={hasMedicalRisk ? 'badge badge-rose' : 'badge badge-purple'} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}>
            <HeartPulse size={14} /> {hasMedicalRisk ? 'Elevated Health Buffer Active (15%)' : 'Standard Health Policy (5%)'}
          </span>

          <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}>
            <Target size={14} /> Target: Rs. {targetIncome.toLocaleString()} / mo
          </span>
        </div>
      </div>

      {/* Hero Welcome Banner */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '24px 28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-cyan">AI Motivation Engine</span>
              <span className="badge badge-emerald">Daily Status</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', color: '#0f172a', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
              How close are you to your target income?
            </h1>
            <p style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 500, maxWidth: '650px', lineHeight: 1.5 }}>
              {dailyMotivation.message}
            </p>
          </div>
          <button className="btn-primary" onClick={() => setActiveTab('roadmap')} id="dashboard-go-roadmap-btn">
            <Target size={18} />
            View Career Roadmap
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
            <span style={{ color: '#475569', fontWeight: 600 }}>Goal Progression Pace</span>
            <span style={{ color: '#0284c7', fontWeight: 700 }}>{dailyMotivation.completionPct}% Completed</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${dailyMotivation.completionPct}%` }} />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Monthly Income</span>
            <Wallet size={20} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Rs. {summary.totalIncome.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> Fixed & Variable Sources
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Monthly Expenses</span>
            <TrendingUp size={20} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Rs. {summary.totalExpense.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Across 5 Budget Buckets
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Net Monthly Reserve</span>
            <Sparkles size={20} color="#059669" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: summary.netCashflow >= 0 ? '#059669' : '#e11d48' }}>
            Rs. {summary.netCashflow.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: summary.netCashflow >= 0 ? '#059669' : '#e11d48', marginTop: '4px', fontWeight: 600 }}>
            {summary.netCashflow >= 0 ? 'Surplus Reserve Available' : 'Deficit Reserve Alert'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Health Safety Buffer</span>
            <HeartPulse size={20} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7c3aed' }}>
            {budget.dailyExpensesPct}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#7c3aed', marginTop: '4px', fontWeight: 600 }}>
            {hasMedicalRisk ? 'Carved Elevated Risk Buffer' : 'Standard Allocated Buffer'}
          </div>
        </div>
      </div>

      {/* 5-Bucket Budget Policy Visualizer */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#0284c7" />
            5-Bucket Dynamic Personalization Allocation
          </h3>
          <button className="btn-secondary" style={{ fontSize: '0.82rem' }} onClick={() => setActiveTab('finance')} id="dashboard-adjust-buckets-btn">
            Adjust Allocations
          </button>
        </div>

        {/* Bucket grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(2, 132, 199, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(2, 132, 199, 0.18)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Savings Bucket</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7', margin: '4px 0' }}>
              {budget.savingsPct}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
              Rs. {((summary.totalIncome * budget.savingsPct) / 100).toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'rgba(217, 119, 6, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(217, 119, 6, 0.18)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Loans & Obligations</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>
              {budget.loansPct}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
              Rs. {((summary.totalIncome * budget.loansPct) / 100).toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'rgba(124, 58, 237, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(124, 58, 237, 0.18)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Family Buffer</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed', margin: '4px 0' }}>
              {budget.familyPct}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
              Rs. {((summary.totalIncome * budget.familyPct) / 100).toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'rgba(5, 150, 105, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(5, 150, 105, 0.18)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Daily / Health</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', margin: '4px 0' }}>
              {budget.dailyExpensesPct}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
              Rs. {((summary.totalIncome * budget.dailyExpensesPct) / 100).toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'rgba(225, 29, 72, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(225, 29, 72, 0.18)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Hobbies & Leisure</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e11d48', margin: '4px 0' }}>
              {budget.hobbiesPct}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
              Rs. {((summary.totalIncome * budget.hobbiesPct) / 100).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
