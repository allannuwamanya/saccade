import React, { useState } from 'react';
import { X, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, name);
    onSuccess();
    onClose();
  };

  const handleDemoLogin = () => {
    login('alex.mercer@distributed.systems', 'Alex Mercer');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
            {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            {isSignUp ? 'Create your Saccade account' : 'Welcome to Saccade Studio'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your canonical career facts and truth-anchored tailored resumes.
          </p>
        </div>

        {/* Demo Fast Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full mb-4 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold rounded-xl border border-blue-500/20 flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Continue as Demo Candidate (Alex Mercer)</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Or with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="text-[11px] font-medium text-slate-300 mb-1 block">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-slate-300 mb-1 block">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300 mb-1 block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/25 transition mt-2 cursor-pointer"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4 text-xs text-slate-400">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
