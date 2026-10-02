import React, { useState } from 'react';
import { Lock, CheckCircle, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../App';

interface AuthPageProps {
  onNavigate: (page: Page) => void;
}

// Seeded demo account — create this user once in the Supabase dashboard.
const DEMO_EMAIL = 'demo@saccade.langratia.com';
const DEMO_PASSWORD = 'saccade-demo-2026';

export const AuthPage = ({ onNavigate }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, signup, authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name || undefined);
      }
      onNavigate('studio');
    } catch (err: any) {
      setError(authError || err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
      onNavigate('studio');
    } catch (err: any) {
      setError('Demo account unavailable. Please sign up for a free account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address above, then click Forgot password.');
      return;
    }
    const { supabase } = await import('../lib/supabaseClient');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      alert(`Password reset link sent to ${email}`);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Left side - Product info */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-[var(--color-surface)] border-r border-[var(--color-border)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 flex items-center gap-2 font-bold text-xl text-white">
          <div className="w-8 h-8 rounded bg-[var(--color-accent)] flex items-center justify-center">
            <span className="text-white text-sm">S</span>
          </div>
          Saccade
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            The engineering-grade application pipeline.
          </h1>

          <div className="space-y-4 mb-12">
            {[
              'Pixel-perfect LaTeX rendering engine',
              'Cryptographic truth-anchoring',
              'Local MCP agent integration',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <CheckCircle size={20} className="text-[var(--color-success)]" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md">
          <div className="flex text-[var(--color-accent)] mb-4">★★★★★</div>
          <p className="text-[var(--color-text-primary)] font-medium mb-4">
            "Saccade changed how I apply for roles. No more word processor formatting nightmares, just pure logic and clean PDFs."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500"></div>
            <div>
              <div className="text-sm font-bold text-white">Alex Mercer</div>
              <div className="text-xs text-[var(--color-text-muted)]">Senior Staff Engineer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[var(--color-bg)]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-2 font-bold text-xl text-white mb-12">
            <div className="w-8 h-8 rounded bg-[var(--color-accent)] flex items-center justify-center">
              <span className="text-white text-sm">S</span>
            </div>
            Saccade
          </div>

          <div className="mb-4">
            <button
              onClick={() => onNavigate('landing')}
              className="text-xs text-[var(--color-text-muted)] hover:text-white transition-colors flex items-center gap-1.5"
            >
              ← Back to Saccade
            </button>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {isLogin
                ? 'Enter your details to access your studio'
                : 'Start compiling your professional future'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                type="text"
                label="Full name"
                placeholder="Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            )}
            <Input
              type="email"
              label="Email address"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              icon={<Mail size={16} />}
              required
            />

            <div>
              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                icon={<Lock size={16} />}
                required
              />
              {isLogin && (
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-[var(--color-accent)] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
              {isLogin ? 'Sign In to Studio' : 'Create Free Account'}
            </Button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--color-bg)] text-[var(--color-text-muted)]">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleDemo}
              isLoading={isLoading}
            >
              Continue as Demo Candidate
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
