import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateWeeklyReport, getCurrentWeekRange, formatDate } from '../utils/storage';
import PaymentModal from './PaymentModal';
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';

export default function WeeklyReport() {
  const { settings } = useApp();
  
  // Quick presets
  const currentWeek = getCurrentWeekRange();
  const [startDate, setStartDate] = useState(currentWeek.start);
  const [endDate, setEndDate] = useState(currentWeek.end);
  const [activePreset, setActivePreset] = useState('this_week');

  const [payModalLabor, setPayModalLabor] = useState(null);
  const [expandedLaborId, setExpandedLaborId] = useState(null);

  const report = calculateWeeklyReport(startDate, endDate);

  const handlePreset = (preset) => {
    setActivePreset(preset);
    const now = new Date();

    if (preset === 'this_week') {
      const w = getCurrentWeekRange();
      setStartDate(w.start);
      setEndDate(w.end);
    } else if (preset === 'last_week') {
      const now = new Date();
      const day = now.getDay();
      const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
      const mon = new Date(now.setDate(diffToMon));
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      setStartDate(formatDate(mon));
      setEndDate(formatDate(sun));
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(lastDay));
    } else if (preset === 'all_time') {
      setStartDate('2020-01-01');
      setEndDate('2030-12-31');
    }
  };

  const toggleExpand = (laborId) => {
    setExpandedLaborId(expandedLaborId === laborId ? null : laborId);
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Title & Preset Controls */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/80 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>Weekly Payroll Report</span>
          </h2>
          <span className="text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-medium">
            Auto Calculated
          </span>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-1.5 pt-1 text-xs">
          <button
            onClick={() => handlePreset('this_week')}
            className={`py-1.5 rounded-xl font-medium border transition-colors ${
              activePreset === 'this_week'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => handlePreset('last_week')}
            className={`py-1.5 rounded-xl font-medium border transition-colors ${
              activePreset === 'last_week'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => handlePreset('this_month')}
            className={`py-1.5 rounded-xl font-medium border transition-colors ${
              activePreset === 'this_month'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => handlePreset('all_time')}
            className={`py-1.5 rounded-xl font-medium border transition-colors ${
              activePreset === 'all_time'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Date Range Inputs */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setActivePreset('custom');
              }}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setActivePreset('custom');
              }}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* KPI Overview Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        
        <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Payable</span>
          <div className="text-base font-extrabold text-white truncate">
            {settings.currency}{report.overall.totalEarned}
          </div>
          <span className="text-[10px] text-slate-500">Gross Waged</span>
        </div>

        <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Paid</span>
          <div className="text-base font-extrabold text-emerald-400 truncate">
            {settings.currency}{report.overall.totalPaid}
          </div>
          <span className="text-[10px] text-slate-500">Amount Paid</span>
        </div>

        <div className="bg-slate-800 p-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-semibold">Net Pending</span>
          <div className="text-base font-extrabold text-amber-400 truncate">
            {settings.currency}{report.overall.totalPending}
          </div>
          <span className="text-[10px] text-amber-400/70">To Be Settled</span>
        </div>

      </div>

      {/* Labor Reports List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Labor-Wise Summary Breakdown
        </h3>

        {report.laborReports.length === 0 ? (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-6 text-center text-slate-400 text-xs">
            No labor data recorded for this date range.
          </div>
        ) : (
          report.laborReports.map(({ labor, presentDays, customDays, absentDays, totalEarned, totalPaid, pendingBalance, attendanceRecords, paymentRecords }) => {
            const isExpanded = expandedLaborId === labor.id;

            return (
              <div
                key={labor.id}
                className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm hover:border-slate-600 transition-colors"
              >
                {/* Main Summary Card Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight">{labor.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Std Rate: {settings.currency}{labor.dailyRate}/day</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Pending Balance</span>
                      <span className={`text-base font-extrabold ${pendingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {settings.currency}{pendingBalance}
                      </span>
                    </div>
                  </div>

                  {/* Attendance Stats Pills */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-medium">
                      {presentDays} Full Days
                    </span>
                    {customDays > 0 && (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg font-medium">
                        {customDays} Custom
                      </span>
                    )}
                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-lg font-medium">
                      {absentDays} Absent
                    </span>
                  </div>

                  {/* Financial Bar */}
                  <div className="bg-slate-900/80 rounded-xl p-2.5 grid grid-cols-2 gap-2 text-xs border border-slate-700/50">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Gross Payable:</span>
                      <span className="font-bold text-white">{settings.currency}{totalEarned}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Paid:</span>
                      <span className="font-bold text-emerald-400">{settings.currency}{totalPaid}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => toggleExpand(labor.id)}
                      className="text-xs text-amber-400 font-semibold flex items-center space-x-1 hover:underline"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Daily Log & Payouts'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setPayModalLabor({ labor, pendingBalance })}
                      className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1 shadow"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Payment</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div className="bg-slate-900/90 border-t border-slate-700/80 p-4 space-y-4 text-xs">
                    
                    {/* Attendance Entries */}
                    <div>
                      <h5 className="font-bold text-slate-300 mb-2 uppercase text-[10px] tracking-wider">
                        Attendance Records ({attendanceRecords.length})
                      </h5>
                      {attendanceRecords.length === 0 ? (
                        <p className="text-slate-500 italic">No attendance recorded in this period.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {attendanceRecords.map(att => (
                            <div key={att.id} className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg border border-slate-700/40">
                              <div>
                                <span className="font-semibold text-white">{att.date}</span>
                                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                  att.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' :
                                  att.status === 'custom' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-rose-500/20 text-rose-400'
                                }`}>
                                  {att.status}
                                </span>
                                {att.notes && <span className="text-slate-400 text-[11px] ml-2">({att.notes})</span>}
                              </div>
                              <span className="font-bold text-white">{settings.currency}{att.customAmount}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Payment Entries */}
                    <div>
                      <h5 className="font-bold text-slate-300 mb-2 uppercase text-[10px] tracking-wider">
                        Payment Receipts ({paymentRecords.length})
                      </h5>
                      {paymentRecords.length === 0 ? (
                        <p className="text-slate-500 italic">No payments recorded in this period.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {paymentRecords.map(pay => (
                            <div key={pay.id} className="flex justify-between items-center bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                              <div>
                                <span className="font-semibold text-emerald-300">{pay.date}</span>
                                {pay.note && <span className="text-slate-400 text-[11px] ml-2">• {pay.note}</span>}
                              </div>
                              <span className="font-bold text-emerald-400">+{settings.currency}{pay.amount}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {payModalLabor && (
        <PaymentModal
          labor={payModalLabor.labor}
          pendingBalance={payModalLabor.pendingBalance}
          onClose={() => setPayModalLabor(null)}
        />
      )}

    </div>
  );
}
