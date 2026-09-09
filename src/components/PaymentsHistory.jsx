import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PaymentModal from './PaymentModal';
import { CreditCard, Plus, Trash2, Calendar, Search } from 'lucide-react';

export default function PaymentsHistory() {
  const { payments, removePayment, labors, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLaborForPay, setSelectedLaborForPay] = useState(null);

  const laborMap = new Map(labors.map(l => [l.id, l]));

  const filteredPayments = payments.filter(p => {
    const labor = laborMap.get(p.laborId);
    const laborName = labor ? labor.name.toLowerCase() : '';
    const note = (p.note || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return laborName.includes(query) || note.includes(query) || p.date.includes(query);
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPaidOut = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const handleDelete = (id) => {
    if (window.confirm('Delete this payment entry?')) {
      removePayment(id);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/80 p-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Payments History</span>
          </h2>
          <p className="text-xs text-slate-400">{payments.length} Payments Recorded</p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase">Total Payouts</span>
          <div className="text-base font-extrabold text-emerald-400">
            {settings.currency}{totalPaidOut}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Search by labor, date, or note..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-8 text-center text-slate-400 text-sm">
          No payment receipts found.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPayments.map((p) => {
            const labor = laborMap.get(p.laborId);
            return (
              <div
                key={p.id}
                className="bg-slate-800 rounded-2xl border border-slate-700 p-3.5 flex items-center justify-between shadow-sm"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white text-sm">
                    {labor ? labor.name : 'Unknown Labor'}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{p.date}</span>
                    </span>
                    {p.note && (
                      <>
                        <span>•</span>
                        <span className="text-slate-300 italic">{p.note}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-base font-extrabold text-emerald-400">
                    +{settings.currency}{p.amount}
                  </span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors"
                    title="Delete Payment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
