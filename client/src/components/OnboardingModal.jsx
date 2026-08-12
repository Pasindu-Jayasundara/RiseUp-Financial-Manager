import React, { useState } from 'react';
import { UserCheck, DollarSign, Activity, Target, ArrowRight, ShieldAlert, Sparkles, Check } from 'lucide-react';

export default function OnboardingModal({ user, onCompleteOnboarding }) {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState(user?.age || 32);
  const [conditions, setConditions] = useState(user?.medicalConditions || []);
  const [fixedInc, setFixedInc] = useState(480000);
  const [varInc, setVarInc] = useState(120000);
  const [targetInc, setTargetInc] = useState(850000);
  const [skills, setSkills] = useState(['React', 'Node.js', 'Financial Modeling']);
  const [newSkillStr, setNewSkillStr] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleCondition = (condKey) => {
    if (condKey === 'none') {
      setConditions([]);
      return;
    }
    if (conditions.includes(condKey)) {
      setConditions(conditions.filter(c => c !== condKey));
    } else {
      setConditions([...conditions.filter(c => c !== 'none'), condKey]);
    }
  };

  const handleAddSkill = () => {
    if (newSkillStr.trim() && !skills.includes(newSkillStr.trim())) {
      setSkills([...skills, newSkillStr.trim()]);
      setNewSkillStr('');
    }
  };

  const handleRemoveSkill = (sToRemove) => {
    setSkills(skills.filter(s => s !== sToRemove));
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    const onboardingPayload = {
      age: Number(age),
      medicalConditions: conditions,
      fixedIncome: Number(fixedInc),
      variableIncome: Number(varInc),
      targetIncome: Number(targetInc),
      declaredSkills: skills
    };

    if (onCompleteOnboarding) {
      await onCompleteOnboarding(onboardingPayload);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        maxWidth: '650px',
        width: '100%',
        boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        fontFamily: 'Outfit, sans-serif'
      }}>
        {/* Onboarding Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          padding: '24px 30px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#bae6fd', fontWeight: 700 }}>
              First-Time User Personalization Wizard
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px', color: '#ffffff' }}>
              Welcome to RiseUp, {user?.name || 'Partner'}!
            </h2>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 700
          }}>
            Step {step} of 3
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '30px' }}>
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <UserCheck size={22} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                  Personal Age & Health Safety Parameters
                </h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.5 }}>
                Our <strong>Policy Suggestion Engine</strong> uses your age and medical conditions to automatically adjust your 5-Bucket Safety Buffer (carving extra reserves for high-cost healthcare needs).
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Your Current Age
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={{ fontSize: '1.1rem', fontWeight: 700, width: '100%' }}
                  id="onboarding-age-input"
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Calculated Age Band: <strong>{age >= 50 ? '50-64 (Elevated Health Buffer)' : '30-49 (Standard Policy)'}</strong>
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                  Select Applicable Health / Medical Status Flags:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'chronic_condition_high_cost', label: 'Chronic High-Cost Medical Condition' },
                    { key: 'diabetic', label: 'Diabetes or Cardiovascular Care' },
                    { key: 'elderly_care', label: 'Elderly / Dependent Healthcare Expenses' },
                    { key: 'none', label: 'None (Standard Health Status)' }
                  ].map((cond) => {
                    const isSelected = cond.key === 'none' ? conditions.length === 0 : conditions.includes(cond.key);
                    return (
                      <div
                        key={cond.key}
                        onClick={() => toggleCondition(cond.key)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid #cbd5e1',
                          background: isSelected ? 'rgba(2, 132, 199, 0.06)' : '#f8fafc',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--accent-cyan)' : '#334155' }}>
                          {cond.label}
                        </span>
                        {isSelected && <Check size={18} color="var(--accent-cyan)" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <DollarSign size={22} color="var(--accent-emerald)" />
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                  Starting Monthly Income Streams (LKR)
                </h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.5 }}>
                Enter your initial monthly income streams. This populates your Finance Engine & Dashboard metrics.
              </p>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Primary Monthly Fixed Salary (Rs.)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b', fontWeight: 600 }}>Rs.</span>
                  <input
                    type="number"
                    className="form-input"
                    value={fixedInc}
                    onChange={(e) => setFixedInc(e.target.value)}
                    style={{ paddingLeft: '42px', fontSize: '1.1rem', fontWeight: 700 }}
                    id="onboarding-fixed-income-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Secondary / Variable Monthly Income (Rs.)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b', fontWeight: 600 }}>Rs.</span>
                  <input
                    type="number"
                    className="form-input"
                    value={varInc}
                    onChange={(e) => setVarInc(e.target.value)}
                    style={{ paddingLeft: '42px', fontSize: '1.1rem', fontWeight: 700 }}
                    id="onboarding-var-income-input"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Target size={22} color="var(--accent-purple)" />
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                  Career Target Income & Verified Skills
                </h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.5 }}>
                Define your target monthly income goal. Our ML Career Engine matches your skills against market job roles to close the gap.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Target Monthly Income Goal (Rs.)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b', fontWeight: 600 }}>Rs.</span>
                  <input
                    type="number"
                    className="form-input"
                    value={targetInc}
                    onChange={(e) => setTargetInc(e.target.value)}
                    style={{ paddingLeft: '42px', fontSize: '1.1rem', fontWeight: 700 }}
                    id="onboarding-target-income-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Your Declared Career Skills
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add skill (e.g. Python, SQL, Financial Analysis)"
                    value={newSkillStr}
                    onChange={(e) => setNewSkillStr(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    id="onboarding-add-skill-input"
                  />
                  <button type="button" className="btn-secondary" onClick={handleAddSkill}>
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.map((s, idx) => (
                    <span key={idx} className="badge badge-purple" style={{ padding: '6px 12px', cursor: 'pointer' }} onClick={() => handleRemoveSkill(s)}>
                      {s} &times;
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            {step > 1 ? (
              <button className="btn-secondary" onClick={() => setStep(step - 1)}>
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button className="btn-primary" onClick={() => setStep(step + 1)} id="onboarding-next-btn">
                Continue to Step {step + 1} <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={handleFinalSubmit}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                id="onboarding-finish-btn"
              >
                <Sparkles size={18} />
                {loading ? 'Personalizing Dashboard...' : 'Complete & Launch Dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
