import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, DollarSign, Calendar, FileText } from 'lucide-react';
import { formatDate } from '../utils/storage';

export default function PaymentModal({ labor, pendingBalance = 0, onClose }) {
  const { recordPayment, settings } = useApp();
  const [amount, setAmount] = useState(pendingBalance > 0 ? pendingBalance : '');
  const [date, setDate] = useState(formatDate(new Date()));
  const [note, setNote] = useState('Weekly Payout');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    recordPayment(labor.id, Number(amount), date, note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-700/60 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>Record Payment</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{labor.name} • {labor.phone || 'No phone'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Current Balance Display */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50 flex justify-between items-center text-xs">
          <span className="text-slate-400">Current Pending Balance:</span>
          <span className={`font-bold text-sm ${pendingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {settings.currency}{pendingBalance}
          </span>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Paid Amount ({settings.currency})
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-400 font-bold">
                {settings.currency}
              </span>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="Enter paid amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-base font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            {pendingBalance > 0 && (
              <button
                type="button"
                onClick={() => setAmount(pendingBalance)}
                className="text-[11px] text-amber-400 font-medium hover:underline mt-1 block"
              >
                Pay Full Pending ({settings.currency}{pendingBalance})
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Payment Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Payment Note / Mode</label>
            <input
              type="text"
              placeholder="e.g. Cash, GPay, Bank transfer, Weekly settlement"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow"
            >
              Save Payment
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
