import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, UserPlus, Phone, DollarSign, Edit3, Trash2, Search, HardHat } from 'lucide-react';

export default function LaborList() {
  const { labors, addOrUpdateLabor, removeLabor, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLabor, setEditingLabor] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dailyRate, setDailyRate] = useState('');

  const handleOpenAdd = () => {
    setEditingLabor(null);
    setName('');
    setPhone('');
    setDailyRate('500');
    setModalOpen(true);
  };

  const handleOpenEdit = (labor) => {
    setEditingLabor(labor);
    setName(labor.name);
    setPhone(labor.phone || '');
    setDailyRate(labor.dailyRate);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !dailyRate) return;

    addOrUpdateLabor({
      id: editingLabor ? editingLabor.id : null,
      name: name.trim(),
      phone: phone.trim(),
      dailyRate: Number(dailyRate)
    });

    setModalOpen(false);
  };

  const handleDelete = (laborId, laborName) => {
    if (window.confirm(`Are you sure you want to delete ${laborName}? All past attendance and payment records for this labor will also be removed.`)) {
      removeLabor(laborId);
    }
  };

  const filteredLabors = labors.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header Bar & Add Button */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/80 p-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Labor Directory</span>
          </h2>
          <p className="text-xs text-slate-400">{labors.length} Laborers Registered</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow transition-transform active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Labor</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Labor List Cards */}
      {filteredLabors.length === 0 ? (
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-8 text-center space-y-3">
          <HardHat className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-medium text-sm">No labor records found</p>
          <button
            onClick={handleOpenAdd}
            className="py-2 px-4 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs inline-block"
          >
            Add Your First Laborer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLabors.map((labor) => (
            <div
              key={labor.id}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3 shadow-sm hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{labor.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{labor.phone || 'No phone number'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Standard Salary</span>
                  <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm">
                    <span>{settings.currency}{labor.dailyRate} / day</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-700/60">
                <button
                  onClick={() => handleOpenEdit(labor)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-amber-500/50 rounded-xl text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Rate</span>
                </button>
                <button
                  onClick={() => handleDelete(labor.id, labor.name)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-red-500/50 rounded-xl text-slate-400 hover:text-red-400 text-xs font-semibold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Labor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {editingLabor ? 'Edit Labor Profile' : 'Add New Laborer'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Labor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Standard Per Day Salary ({settings.currency})
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-amber-400 font-bold text-sm">
                    {settings.currency}
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Standard wage rate per full day"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  This standard amount will be automatically calculated whenever you mark "Present".
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow"
                >
                  {editingLabor ? 'Save Changes' : 'Create Labor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
