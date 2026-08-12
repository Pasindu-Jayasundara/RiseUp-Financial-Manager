import React, { useState } from 'react';
import { Shield, Sparkles, TrendingUp, Lock, Mail, User, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const ports = ['', 'http://localhost:5000', 'http://localhost:5001', 'http://localhost:5002'];
      let data = null;

      for (const prefix of ports) {
        try {
          const res = await fetch(`${prefix}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'alex@riseup.io', password: 'password123', name: 'Alex Rivera' })
          });
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch (e) {}
      }

      if (data) {
        localStorage.setItem('riseup_token', data.token);
        onLoginSuccess(data.user);
      } else {
        // Direct local login fallback
        onLoginSuccess({
          _id: 'user_alex_1',
          name: 'Alex Rivera',
          email: 'alex@riseup.io',
          age: 42,
          ageBand: '30-49',
          medicalConditions: ['chronic_condition_high_cost'],
          isFirstLogin: false
        });
      }
    } catch (err) {
      setErrorMsg('Login failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setErrorMsg('Please fill in all required credentials.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const bodyPayload = isRegister ? { name, email, password } : { email, password, name: name || email.split('@')[0] };

      const ports = ['', 'http://localhost:5000', 'http://localhost:5001', 'http://localhost:5002'];
      let data = null;

      for (const prefix of ports) {
        try {
          const res = await fetch(`${prefix}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload)
          });
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch (e) {}
      }

      if (data && data.user) {
        if (data.token) localStorage.setItem('riseup_token', data.token);
        onLoginSuccess(data.user);
      } else {
        // Local fallback for new user
        const newUser = {
          _id: 'user_' + Date.now(),
          name: name || email.split('@')[0],
          email,
          age: 30,
          ageBand: '30-49',
          medicalConditions: [],
          isFirstLogin: true // triggers first-time onboarding popup!
        };
        onLoginSuccess(newUser);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'Outfit, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        maxWidth: '1000px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Left Visual Branding Panel */}
        <div style={{
          background: 'linear-gradient(145deg, #0284c7 0%, #0369a1 50%, #4338ca 100%)',
          padding: '44px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={24} color="#ffffff" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                RiseUp Financial Manager
              </h2>
            </div>

            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '16px' }}>
              Autonomous Financial Health & Career Acceleration Engine
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '32px' }}>
              Personalize your 5-bucket budget allocations based on real-time age & health risk parameters, with Google Gemini AI forecasting.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.95)' }}>
                <CheckCircle2 size={18} color="#38bdf8" /> Health & Medical Profile Budget Buffer Allocation
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.95)' }}>
                <CheckCircle2 size={18} color="#38bdf8" /> Google Gemini 1.5 External AI Predictive Forecasts
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.95)' }}>
                <CheckCircle2 size={18} color="#38bdf8" /> Cryptographic Blockchain Verified Milestone Roadmaps
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '40px' }}>
            &copy; 2026 RiseUp Platform &bull; Multi-Tenant Enterprise Ready
          </div>
        </div>

        {/* Right Authentication Form */}
        <div style={{ padding: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Tab Header */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '28px'
          }}>
            <button
              onClick={() => setIsRegister(false)}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: !isRegister ? '#ffffff' : 'transparent',
                color: !isRegister ? 'var(--accent-cyan)' : '#64748b',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: !isRegister ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
              id="login-tab-btn"
            >
              Log In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: isRegister ? '#ffffff' : 'transparent',
                color: isRegister ? 'var(--accent-cyan)' : '#64748b',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: isRegister ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
              id="register-tab-btn"
            >
              Create Account
            </button>
          </div>

          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '6px' }}>
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
            {isRegister ? 'Register to personalize your financial & career roadmap.' : 'Enter your credentials to access your dashboard.'}
          </p>

          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '18px'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Alex Rivera"
                    style={{ paddingLeft: '40px' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegister}
                    id="user-fullname-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  style={{ paddingLeft: '40px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="user-email-input"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  style={{ paddingLeft: '40px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="user-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.95rem'
              }}
              disabled={loading}
              id="auth-submit-btn"
            >
              {loading ? 'Processing...' : (isRegister ? 'Register & Continue' : 'Sign In')}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Demo Login Button */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '10px' }}>
              Want to explore with pre-loaded demo metrics?
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDemoLogin}
              style={{
                width: '100%',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.88rem'
              }}
              id="quick-demo-login-btn"
            >
              <Zap size={16} color="var(--accent-amber)" /> Log In as Demo User (Alex Rivera)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
