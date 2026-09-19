import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { authenticateUser, DEMO_CREDENTIALS } from '../services/authService.js';

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear previous error message as soon as user types in the email input
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  // Clear previous error message as soon as user types in the password input
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  // Quick fill demo credentials button
  const handleFillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrors({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors before checking
    setErrors({ email: '', password: '' });

    // Client-side quick check
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrors((prev) => ({ ...prev, email: 'Email invalid' }));
      return;
    }

    if (!cleanPassword) {
      setErrors((prev) => ({ ...prev, password: 'Incorrect password' }));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authenticateUser({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (result.success) {
        onLoginSuccess(result.user);
      }
    } catch (err) {
      // Map error to specific field to show inline feedback
      if (err.field === 'email' || err.message === 'Email invalid') {
        setErrors({ email: 'Email invalid', password: '' });
      } else if (err.field === 'password' || err.message === 'Incorrect password') {
        setErrors({ email: '', password: 'Incorrect password' });
      } else {
        // Fallback generic mapping based on error text
        if (err.message?.toLowerCase().includes('email')) {
          setErrors({ email: 'Email invalid', password: '' });
        } else {
          setErrors({ email: '', password: 'Incorrect password' });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 z-20">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-accent-cyan via-purple-500 to-accent-violet p-0.5 shadow-glow mb-4">
            <div className="w-full h-full bg-base-950/90 rounded-[22px] flex items-center justify-center backdrop-blur-md">
              <Sparkles size={28} className="text-accent-cyan animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Aetheris <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-violet">AI</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Enterprise Generative Conversational Studio
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-panel border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Ambient Accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-violet/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-cyan/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock size={18} className="text-accent-cyan" /> Sign In
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sign in with personal email or demo account
              </p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={12} /> AES-256
            </span>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="name@example.com (or personal email)"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-base-950/60 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 border ${
                    errors.email
                      ? 'border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-white/10 focus:border-accent-cyan/60 focus:ring-2 focus:ring-accent-cyan/20'
                  }`}
                />
              </div>

              {/* Inline Error Message for Email */}
              {errors.email && (
                <div
                  id="email-error"
                  className="flex items-center gap-1.5 text-xs text-rose-400 mt-1.5 pl-1 animate-fadeIn"
                >
                  <AlertCircle size={13} className="shrink-0 text-rose-400" />
                  <span className="font-medium">{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl bg-base-950/60 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 border ${
                    errors.password
                      ? 'border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-white/10 focus:border-accent-cyan/60 focus:ring-2 focus:ring-accent-cyan/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Inline Error Message for Password */}
              {errors.password && (
                <div
                  id="password-error"
                  className="flex items-center gap-1.5 text-xs text-rose-400 mt-1.5 pl-1 animate-fadeIn"
                >
                  <AlertCircle size={13} className="shrink-0 text-rose-400" />
                  <span className="font-medium">{errors.password}</span>
                </div>
              )}
            </div>

            {/* Submit Button - Disabled while submitting */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                isSubmitting
                  ? 'bg-slate-700/60 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-accent-violet via-purple-600 to-accent-cyan hover:from-accent-violet/90 hover:to-accent-cyan/90 shadow-glow active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill Pill */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
            <p className="text-[11px] text-slate-400 mb-2">
              Valid Demo Credentials:
            </p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-all"
              title="Click to automatically fill demo credentials"
            >
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>user@example.com / password123</span>
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-4 mt-6 text-[11px] text-slate-500 font-mono">
          <span>🔒 End-to-End Encrypted</span>
          <span>•</span>
          <span>🛡️ JWT Session Auth</span>
          <span>•</span>
          <span>⚡ Zero-Trust Protocol</span>
        </div>
      </div>
    </div>
  );
}
