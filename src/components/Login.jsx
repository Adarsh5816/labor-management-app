import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, KeyRound, UserPlus, LogIn, HardHat, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('admin');
  const [pin, setPin] = useState('1234');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !pin.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      const success = register(username, pin, name);
      if (!success) setError('Username already exists or registration failed');
    } else {
      const success = login(username, pin);
      if (!success) setError('Invalid username or PIN');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <HardHat className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Labor Handler</h1>
          <p className="text-sm text-slate-400">Offline Payroll & Attendance Management</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Your Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <UserCheck className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <UserCheck className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">PIN / Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <KeyRound className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                placeholder="4-digit PIN or password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm mt-6"
          >
            {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            <span>{isRegister ? 'Create Account' : 'Unlock / Login'}</span>
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="text-center pt-2 border-t border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-amber-400 hover:underline font-medium"
          >
            {isRegister ? 'Already have an account? Sign In' : 'First time? Create a New Account'}
          </button>
        </div>

        {/* Offline Badge */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3 flex items-center space-x-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>100% Offline App. All data stays securely on your phone.</span>
        </div>

        {/* Quick Demo Info */}
        {!isRegister && (
          <div className="text-center text-xs text-slate-500">
            Default Demo PIN: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-400">1234</code>
          </div>
        )}

      </div>
    </div>
  );
}
