'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import VaultCore from '@/components/3d/VaultCore';
import SpatialButton from '@/components/ui/SpatialButton';
import { useSpatialStore, UserProfile } from '@/lib/store';
import { authService } from '@/lib/auth/auth-service';
import {
  Mail, Lock, User, Shield, Check, AlertCircle, Eye, EyeOff,
  ArrowRight, ArrowLeft, RefreshCw, Sparkles, KeyRound, X, CheckCircle2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { setUser, setAuthenticated } = useSpatialStore();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [step, setStep] = useState<'form' | 'verify_otp' | 'success'>('form');

  const [loginIdentity, setLoginIdentity] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [require2FA, setRequire2FA] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState<'candidate' | 'recruiter' | 'hiring_manager'>('candidate');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeEmail, setActiveEmail] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState('123456');
  const [verificationPurpose, setVerificationPurpose] = useState<'signup' | 'login'>('signup');
  const [countdown, setCountdown] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isVaultVerified, setIsVaultVerified] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep('form');
      setAuthError(null);
      setAuthSuccessMessage(null);
      setIsVaultVerified(false);
      setIsAuthenticating(false);
      setOtpDigits(['', '', '', '', '', '']);
    }
  }, [isOpen, initialMode]);

  // Countdown timers for OTP and resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'verify_otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  useEffect(() => {
    let resendTimer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      resendTimer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(resendTimer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Password Strength Calculation
  const passLength = signupPassword.length >= 8;
  const passUpper = /[A-Z]/.test(signupPassword);
  const passSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(signupPassword);
  const strengthScore = (passLength ? 1 : 0) + (passUpper ? 1 : 0) + (passSymbol ? 1 : 0);
  const passwordsMatch = signupPassword.length > 0 && signupPassword === signupConfirmPassword;

  // Quick Demo Auto-Fill Handlers
  const handleQuickDemo = (role: 'alex' | 'sarah') => {
    setAuthError(null);
    if (role === 'alex') {
      setLoginIdentity('alex.chen@example.com');
      setLoginPassword('Password123!');
    } else {
      setLoginIdentity('sarah.recruiter@example.com');
      setLoginPassword('Password123!');
    }
  };

  // OTP Input Management
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    if (cleaned.length === 1) {
      const next = [...otpDigits];
      next[index] = cleaned;
      setOtpDigits(next);
      if (index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else if (cleaned.length === 6) {
      // Pasted full 6-digit code
      const next = cleaned.split('').slice(0, 6);
      setOtpDigits(next);
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleFillDemoOtp = () => {
    const code = demoOtpCode || '123456';
    const digits = code.padEnd(6, '0').slice(0, 6).split('');
    setOtpDigits(digits);
    otpInputRefs.current[5]?.focus();
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setAuthError(null);
    try {
      const res = await authService.sendVerification(activeEmail, verificationPurpose);
      setDemoOtpCode(res.demo_code || '123456');
      setCountdown(600);
      setResendCooldown(30);
      setAuthSuccessMessage(`New 6-digit security code dispatched to ${activeEmail}`);
      setTimeout(() => setAuthSuccessMessage(null), 3500);
    } catch (err: any) {
      setAuthError(err?.response?.data?.detail || 'Failed to dispatch verification code. Please try again.');
    }
  };

  // 1. Handle Sign In Submission
  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginIdentity.trim() || !loginPassword) {
      setAuthError('Please enter your identity email/handle and access key.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await authService.login({
        identity: loginIdentity.trim(),
        password: loginPassword,
        require_2fa: require2FA,
      });

      if (res.status === 'MFA_REQUIRED') {
        // Transition to 2FA OTP verification step
        setActiveEmail(res.email || loginIdentity.trim());
        setDemoOtpCode(res.demo_code || '123456');
        setVerificationPurpose('login');
        setCountdown(600);
        setResendCooldown(30);
        setOtpDigits(['', '', '', '', '', '']);
        setStep('verify_otp');
        setIsAuthenticating(false);
        return;
      }

      // Successful Direct Authentication
      finalizeSuccessfulAuth(res);
    } catch (err: any) {
      setIsAuthenticating(false);
      setAuthError(err?.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
    }
  };

  // 2. Handle Sign Up Initial Submission (Triggers Email OTP)
  const handleSignUpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    // Validation checks
    if (!signupName.trim()) {
      setAuthError('Please enter your full name or handle.');
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(signupEmail.trim())) {
      setAuthError('Please provide a valid corporate or professional email address.');
      return;
    }
    if (strengthScore < 2) {
      setAuthError('Please strengthen your access key (at least 8 chars with uppercase and a number/symbol).');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setAuthError('Access keys do not match. Please verify.');
      return;
    }

    setIsAuthenticating(true);

    try {
      // Dispatch verification OTP to email
      const cleanEmail = signupEmail.trim().toLowerCase();
      const res = await authService.sendVerification(cleanEmail, 'signup');

      setActiveEmail(cleanEmail);
      setDemoOtpCode(res.demo_code || '123456');
      setVerificationPurpose('signup');
      setCountdown(600);
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setStep('verify_otp');
      setIsAuthenticating(false);
    } catch (err: any) {
      console.error('sendVerification error:', err);
      setIsAuthenticating(false);
      const detail = err?.response?.data?.detail || err?.response?.data?.message || (err?.code === 'ERR_NETWORK' ? 'Unable to reach backend server on port 8000. Please ensure the backend is running.' : null) || err?.message || 'Could not initiate identity verification. Please verify email.';
      setAuthError(detail);
    }
  };

  // 3. Handle 6-Digit OTP Verification for Sign Up or Login
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredCode = otpDigits.join('').trim();
    if (enteredCode.length !== 6) {
      setAuthError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      if (verificationPurpose === 'login') {
        // Verify 2FA and complete login session
        const res = await authService.login({
          identity: loginIdentity.trim(),
          password: loginPassword,
          require_2fa: true,
          code: enteredCode,
        });
        finalizeSuccessfulAuth(res);
      } else {
        // Verify Signup OTP code first
        await authService.verifyCode(activeEmail, enteredCode, 'signup');

        // Complete Registration with validated credentials
        const formattedUsername = signupName.trim().toLowerCase().replace(/\s+/g, '_');
        const regRes = await authService.register({
          username: formattedUsername,
          email: activeEmail,
          password: signupPassword,
          role: signupRole,
          tenant_id: 'tenant_default',
        });

        finalizeSuccessfulAuth(regRes);
      }
    } catch (err: any) {
      setIsAuthenticating(false);
      setAuthError(err?.response?.data?.detail || 'Invalid or expired verification code. Please check or click Resend.');
    }
  };

  // Common successful authentication finalizer
  const finalizeSuccessfulAuth = (res: any) => {
    setIsAuthenticating(false);
    setIsVaultVerified(true);
    setStep('success');

    const profile: UserProfile = {
      id: String(res.user?.id || res.id || Date.now()),
      email: res.user?.email || res.email || activeEmail || loginIdentity,
      name: res.user?.name || res.username?.replace(/_/g, ' ') || 'Spatial Member',
      role: res.user?.role || res.role || 'candidate',
      tenant_id: res.user?.tenant_id || res.tenant_id || 'tenant_default',
    };

    setUser(profile);
    setAuthenticated(true);

    // Give visual animation feedback before closing
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Dark Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#02040a]/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Main Glassmorphic Modal Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-3xl border border-emerald-500/25 shadow-[0_0_50px_rgba(16,185,129,0.15)] bg-slate-900/90 text-slate-100 backdrop-blur-2xl z-10 my-auto"
      >
        {/* Biometric Laser Sweep Animation across modal during authentication */}
        {isAuthenticating && (
          <motion.div
            initial={{ top: '-10%' }}
            animate={{ top: '110%' }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_25px_#00f5a0] z-50 pointer-events-none"
          />
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Left Column: 3D Holographic Vault (Interactive Three.js Core) */}
        <div className="hidden md:flex md:col-span-5 relative flex-col items-center justify-center bg-[#02040a] p-6 border-r border-white/5 overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full h-[320px] relative">
            <Canvas camera={{ position: [0, 0, 4] }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} color={isVaultVerified ? '#00f5a0' : '#10b981'} />
              <Environment preset="city" />
              <VaultCore isAuthenticating={isAuthenticating} isAuthenticated={isVaultVerified} />
              <ContactShadows opacity={0.4} scale={5} blur={2} far={10} resolution={256} color="#000" />
            </Canvas>
          </div>

          <div className="text-center mt-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-widest uppercase mb-1">
              <Shield size={12} />
              {isVaultVerified ? 'Verified Identity' : 'Spatial Security Vault'}
            </div>
            <h4 className="text-xs font-mono text-white/50 uppercase tracking-widest">
              {step === 'verify_otp'
                ? 'Awaiting OTP Verification'
                : mode === 'signin'
                ? 'Encrypted Credential Auth'
                : 'Professional Verification'}
            </h4>
          </div>
        </div>

        {/* Right Column: Dynamic Form Area */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-gradient-to-b from-slate-900/90 to-slate-950/95">
          {/* Tab Selector: [ Sign In ] | [ Create Account ] */}
          {step === 'form' && (
            <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 mb-6 max-w-sm">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setAuthError(null);
                }}
                className={`relative flex-1 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setAuthError(null);
                }}
                className={`relative flex-1 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback & Alert Banners */}
          <AnimatePresence mode="wait">
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 shadow-sm"
              >
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-mono leading-relaxed">{authError}</div>
              </motion.div>
            )}

            {authSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5 shadow-sm"
              >
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-mono leading-relaxed">{authSuccessMessage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* STEP 1A: SIGN IN FORM                                                    */}
          {/* ========================================================================= */}
          {step === 'form' && mode === 'signin' && (
            <motion.form
              key="signin-form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleLoginSubmit}
              className="space-y-4"
            >
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Welcome Back <Sparkles size={18} className="text-emerald-400" />
                </h3>
                <p className="text-white/50 text-xs mt-1">
                  Authenticate your credentials to access your Career Readiness Dashboard.
                </p>
              </div>

              {/* Quick Demo Accounts Picker */}
              <div className="pt-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 mb-2 flex items-center gap-1.5">
                  <KeyRound size={11} /> Quick Demo Profiles
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('alex')}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-xs text-white/80 hover:text-emerald-300 transition-all flex items-center gap-1.5"
                  >
                    <User size={12} className="text-emerald-400" />
                    <span>Alex Chen (Candidate)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('sarah')}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-xs text-white/80 hover:text-cyan-300 transition-all flex items-center gap-1.5"
                  >
                    <Shield size={12} className="text-cyan-400" />
                    <span>Sarah (Recruiter)</span>
                  </button>
                </div>
              </div>

              {/* Input: Identity (Email or Username) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={12} /> Identity Email / Handle
                </label>
                <input
                  type="text"
                  value={loginIdentity}
                  onChange={(e) => setLoginIdentity(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                  required
                />
              </div>

              {/* Input: Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={12} /> Access Key (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* 2FA Security Toggle */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={require2FA}
                  onChange={(e) => setRequire2FA(e.target.checked)}
                  className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500/40 bg-white/10 cursor-pointer"
                />
                <Shield size={14} className={require2FA ? 'text-emerald-400' : 'text-white/40'} />
                <span className="text-xs text-white/80">Require 2-Factor Authentication (OTP Verification)</span>
              </label>

              {/* Submit Button */}
              <SpatialButton
                type="submit"
                variant="primary"
                className="w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Verifying Credentials...
                  </>
                ) : require2FA ? (
                  <>
                    Continue to 2FA Verification <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Initialize Session <ArrowRight size={16} />
                  </>
                )}
              </SpatialButton>
            </motion.form>
          )}

          {/* ========================================================================= */}
          {/* STEP 1B: SIGN UP FORM                                                    */}
          {/* ========================================================================= */}
          {step === 'form' && mode === 'signup' && (
            <motion.form
              key="signup-form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleSignUpSubmit}
              className="space-y-3.5"
            >
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Create Account <Sparkles size={18} className="text-emerald-400" />
                </h3>
                <p className="text-white/50 text-xs mt-0.5">
                  Register your identity with verifiable proof-of-readiness protocols.
                </p>
              </div>

              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={12} /> Full Name / Handle
                  </label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} /> Identity Email
                  </label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Role Selector Pills */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={12} /> Enterprise Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'candidate', label: 'Candidate' },
                    { id: 'recruiter', label: 'Recruiter' },
                    { id: 'hiring_manager', label: 'Hiring Lead' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSignupRole(r.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                        signupRole === r.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={12} /> Access Key
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 pr-9 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Check size={12} /> Confirm Key
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter access key"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 pr-9 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Verification Checklist */}
              {signupPassword.length > 0 && (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/60 font-mono">Password Verification:</span>
                    <span
                      className={`font-semibold font-mono ${
                        strengthScore === 3
                          ? 'text-emerald-400'
                          : strengthScore === 2
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {strengthScore === 3 ? 'Strong' : strengthScore === 2 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>

                  {/* Visual Strength Meter Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strengthScore === 3
                          ? 'w-full bg-emerald-400 shadow-[0_0_10px_#00f5a0]'
                          : strengthScore === 2
                          ? 'w-2/3 bg-amber-400'
                          : 'w-1/3 bg-rose-400'
                      }`}
                    />
                  </div>

                  {/* Checklist Rules */}
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono pt-1 text-white/60">
                    <div className="flex items-center gap-1">
                      <span className={passLength ? 'text-emerald-400' : 'text-white/30'}>
                        {passLength ? '✓' : '•'}
                      </span>
                      <span>8+ characters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={passUpper ? 'text-emerald-400' : 'text-white/30'}>
                        {passUpper ? '✓' : '•'}
                      </span>
                      <span>Uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={passSymbol ? 'text-emerald-400' : 'text-white/30'}>
                        {passSymbol ? '✓' : '•'}
                      </span>
                      <span>Number or symbol</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={passwordsMatch ? 'text-emerald-400' : 'text-white/30'}>
                        {passwordsMatch ? '✓' : '•'}
                      </span>
                      <span>Keys match</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <SpatialButton
                type="submit"
                variant="primary"
                className="w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-1"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Verifying Details...
                  </>
                ) : (
                  <>
                    Verify Identity & Continue <ArrowRight size={16} />
                  </>
                )}
              </SpatialButton>
            </motion.form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: 6-DIGIT EMAIL & IDENTITY OTP VERIFICATION                         */}
          {/* ========================================================================= */}
          {step === 'verify_otp' && (
            <motion.form
              key="otp-verification-step"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setAuthError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-emerald-400 font-mono transition-colors mb-2 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to credentials
                </button>
                <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Security Verification <Shield size={20} className="text-emerald-400" />
                </h3>
                <p className="text-white/60 text-xs mt-1">
                  We've dispatched a 6-digit security verification code to{' '}
                  <span className="text-emerald-300 font-semibold">{activeEmail}</span>.
                </p>
              </div>

              {/* Security Notice */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
                <Mail size={16} className="text-emerald-400 shrink-0" />
                <span className="text-xs text-emerald-200/90 leading-relaxed font-mono">
                  Please enter the 6-digit verification code delivered to your email inbox.
                </span>
              </div>

              {/* 6-Digit PIN Boxes */}
              <div className="flex justify-between gap-2 sm:gap-3 py-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 rounded-xl bg-white/5 border border-white/15 text-center text-xl font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 transition-all shadow-inner"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Expiry Countdown & Resend Option */}
              <div className="flex items-center justify-between text-xs text-white/50 font-mono pt-1">
                <span>
                  Code expires in:{' '}
                  <span className="text-emerald-400 font-semibold">{formatTimer(countdown)}</span>
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className={`flex items-center gap-1 transition-colors ${
                    resendCooldown > 0
                      ? 'text-white/30 cursor-not-allowed'
                      : 'text-emerald-400 hover:text-emerald-300 underline cursor-pointer'
                  }`}
                >
                  <RefreshCw size={12} className={resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform'} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              {/* Confirm Verification Button */}
              <SpatialButton
                type="submit"
                variant="primary"
                className="w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
                disabled={isAuthenticating || otpDigits.join('').length !== 6}
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Verifying Security Code...
                  </>
                ) : (
                  <>
                    Confirm Verification & Activate <ArrowRight size={16} />
                  </>
                )}
              </SpatialButton>
            </motion.form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: SUCCESS STATE ANIMATION                                          */}
          {/* ========================================================================= */}
          {step === 'success' && (
            <motion.div
              key="auth-success-step"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(0,245,160,0.3)]">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Identity Verified</h3>
                <p className="text-white/60 text-xs mt-1">
                  Session initialized. Welcome to the Career Readiness Platform.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Opening Spatial Engine...
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
