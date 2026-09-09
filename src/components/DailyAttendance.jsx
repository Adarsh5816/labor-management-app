import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  UserCheck,
  Edit2,
  DollarSign
} from 'lucide-react';

export default function DailyAttendance() {
  const { 
    labors, 
    attendance, 
    markAttendance, 
    selectedDate, 
    setSelectedDate, 
    settings 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [customModalLabor, setCustomModalLabor] = useState(null);
  const [customWageInput, setCustomWageInput] = useState('');
  const [customNoteInput, setCustomNoteInput] = useState('');

  // Date Navigation Helpers
  const handleDateChange = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const setToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Get attendance records for selected date
  const dayAttendance = attendance.filter(a => a.date === selectedDate);
  const attendanceMap = new Map(dayAttendance.map(a => [a.laborId, a]));

  // Calculate day stats
  let presentCount = 0;
  let absentCount = 0;
  let customCount = 0;
  let totalDayWage = 0;

  labors.forEach(labor => {
    const record = attendanceMap.get(labor.id);
    if (record) {
      if (record.status === 'present') {
        presentCount++;
        totalDayWage += Number(record.customAmount || labor.dailyRate);
      } else if (record.status === 'custom') {
        customCount++;
        totalDayWage += Number(record.customAmount || 0);
      } else if (record.status === 'absent') {
        absentCount++;
      }
    }
  });

  const filteredLabors = labors.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone.includes(searchTerm)
  );

  const handleOpenCustomModal = (labor, existingRecord) => {
    setCustomModalLabor(labor);
    setCustomWageInput(existingRecord?.status === 'custom' ? existingRecord.customAmount : Math.round(labor.dailyRate / 2));
    setCustomNoteInput(existingRecord?.notes || 'Worked partial hours');
  };

  const handleSaveCustomWage = (e) => {
    e.preventDefault();
    if (!customModalLabor) return;
    const amount = Number(customWageInput) || 0;
    markAttendance(customModalLabor.id, selectedDate, 'custom', amount, customNoteInput);
    setCustomModalLabor(null);
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Date Header & Quick Selector */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/80 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center text-xs">
          <button
            onClick={setToday}
            className="text-amber-400 font-medium hover:underline flex items-center space-x-1"
          >
            <span>Jump to Today</span>
          </button>
          <span className="text-slate-400">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Day Stats Bar */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-700/60 text-center">
          <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
            <div className="text-xs text-slate-400">Present</div>
            <div className="text-base font-bold text-emerald-400">{presentCount}</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
            <div className="text-xs text-slate-400">Absent</div>
            <div className="text-base font-bold text-rose-400">{absentCount}</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
            <div className="text-xs text-slate-400">Partial</div>
            <div className="text-base font-bold text-amber-400">{customCount}</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
            <div className="text-xs text-slate-400">Total Wage</div>
            <div className="text-base font-bold text-white">{settings.currency}{totalDayWage}</div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Search labor name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Labor List with Attendance Marking */}
      {filteredLabors.length === 0 ? (
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-8 text-center space-y-2">
          <UserCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-medium text-sm">No laborers found</p>
          <p className="text-xs text-slate-500">Go to "Labors" tab to add workers to your team.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLabors.map((labor) => {
            const record = attendanceMap.get(labor.id);
            const status = record ? record.status : null;
            const wage = record 
              ? (status === 'present' ? labor.dailyRate : (status === 'custom' ? record.customAmount : 0))
              : 0;

            return (
              <div
                key={labor.id}
                className={`bg-slate-800 rounded-2xl border p-4 transition-all space-y-3 ${
                  status === 'present'
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : status === 'absent'
                    ? 'border-rose-500/30 bg-rose-500/5'
                    : status === 'custom'
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-slate-700/80'
                }`}
              >
                {/* Header Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-base leading-tight">{labor.name}</h3>
                    <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span>{labor.phone || 'No phone'}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-medium">Std Rate: {settings.currency}{labor.dailyRate}/day</span>
                    </div>
                  </div>

                  {/* Calculated Wage Badge */}
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Day Wage</span>
                    <span className={`text-base font-bold ${status ? 'text-white' : 'text-slate-500'}`}>
                      {settings.currency}{wage}
                    </span>
                  </div>
                </div>

                {/* Status Selection Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  
                  {/* Present */}
                  <button
                    onClick={() => markAttendance(labor.id, selectedDate, 'present', labor.dailyRate, 'Full Day')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      status === 'present'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md scale-[1.02]'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-500/50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Present</span>
                  </button>

                  {/* Absent */}
                  <button
                    onClick={() => markAttendance(labor.id, selectedDate, 'absent', 0, 'Absent')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      status === 'absent'
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md scale-[1.02]'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-rose-500/50'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Absent</span>
                  </button>

                  {/* Custom Wage / Hours */}
                  <button
                    onClick={() => handleOpenCustomModal(labor, record)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      status === 'custom'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-[1.02]'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-500/50'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Partial / Custom</span>
                  </button>

                </div>

                {/* Custom Note Display if applicable */}
                {status === 'custom' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-300 flex items-center justify-between">
                    <span className="truncate">Custom Amount: {settings.currency}{record.customAmount} ({record.notes || 'Custom wage'})</span>
                    <button
                      onClick={() => handleOpenCustomModal(labor, record)}
                      className="text-amber-400 font-bold hover:underline shrink-0 ml-2"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Wage Modal */}
      {customModalLabor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Custom Wage Entry</h3>
                <p className="text-xs text-slate-400">{customModalLabor.name} • Std: {settings.currency}{customModalLabor.dailyRate}/day</p>
              </div>
              <button
                onClick={() => setCustomModalLabor(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomWage} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Amount to Pay ({settings.currency})
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-amber-400 font-bold">
                    {settings.currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="Enter manual amount"
                    value={customWageInput}
                    onChange={(e) => setCustomWageInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-base font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Use this for laborers working half-day, few hours, or overtime.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Worked 3 hours, Half day morning"
                  value={customNoteInput}
                  onChange={(e) => setCustomNoteInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomModalLabor(null)}
                  className="w-1/2 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow"
                >
                  Save Custom Wage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
