import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportBackup, importBackup } from '../utils/storage';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Smartphone, 
  Trash2, 
  User,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Users
} from 'lucide-react';

export default function Settings() {
  const { 
    settings, 
    updateSettings, 
    showNotification, 
    refreshData, 
    user, 
    usersList, 
    createUserAccount, 
    removeUserAccount, 
    logout 
  } = useApp();

  const [currency, setCurrency] = useState(settings.currency || '₹');
  const [appName, setAppName] = useState(settings.appName || 'Labor Handler');

  // User Creation State (Admin Only)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState('supervisor');

  const isAdmin = user?.role === 'admin' || user?.username.toLowerCase() === 'admin';

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({ currency, appName });
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPin.trim() || !newName.trim()) return;

    const success = createUserAccount(newUsername, newPin, newName, newRole);
    if (success) {
      setNewUsername('');
      setNewName('');
      setNewPin('');
      setShowAddUserModal(false);
    }
  };

  const handleDeleteUser = (u) => {
    if (u.username.toLowerCase() === user.username.toLowerCase()) {
      alert('You cannot delete your own logged-in user account.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete user @${u.username}?`)) {
      removeUserAccount(u.username);
    }
  };

  const handleExport = () => {
    try {
      const json = exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LaborHandler_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('Backup file downloaded successfully');
    } catch (e) {
      showNotification('Failed to export backup', 'error');
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        importBackup(evt.target.result);
        refreshData();
        showNotification('Backup imported successfully!');
      } catch (err) {
        showNotification('Invalid backup JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('WARNING: This will clear ALL stored labor, attendance, payment, and user data on this device. Make sure you have downloaded a backup first. Proceed?')) {
      localStorage.clear();
      refreshData();
      showNotification('All local data has been reset.', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/80 p-4 shadow-sm">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-amber-400" />
          <span>App Preferences</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Customize display settings and backup your data</p>
      </div>

      {/* Account Info */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active User Profile</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-base border border-amber-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center space-x-2">
                <span>{user?.name || user?.username}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  isAdmin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700 text-slate-300'
                }`}>
                  {user?.role || (isAdmin ? 'Admin' : 'Supervisor')}
                </span>
              </div>
              <div className="text-xs text-slate-400">Username: @{user?.username}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 rounded-xl hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* USER MANAGEMENT (ADMIN ONLY - HIDDEN FOR SUPERVISORS / LABOR HANDLERS) */}
      {isAdmin && (
        <div className="bg-slate-800 rounded-2xl border border-amber-500/30 p-4 space-y-3 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-4 h-4" />
                <span>Admin User Management</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Only Master Admin can create supervisor accounts</p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1 shadow"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          </div>

          {/* Existing Users Directory */}
          <div className="space-y-2 pt-2">
            {usersList.map((u) => (
              <div
                key={u.username}
                className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>{u.name || u.username}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-amber-400 border border-slate-700 rounded">
                      @{u.username}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">
                      ({u.role || 'supervisor'})
                    </span>
                  </div>
                </div>

                {u.username.toLowerCase() !== user?.username.toLowerCase() && (
                  <button
                    onClick={() => handleDeleteUser(u)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete User Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences Form */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display Preferences</h3>
        
        <form onSubmit={handleSaveSettings} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Currency Symbol</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="₹">₹ - Indian Rupee (INR)</option>
              <option value="$">$ - US Dollar (USD)</option>
              <option value="€">€ - Euro (EUR)</option>
              <option value="£">£ - British Pound (GBP)</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="SAR">SAR - Saudi Riyal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">App Title</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow"
          >
            Save Preferences
          </button>
        </form>
      </div>

      {/* Backup & Restore Data */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Offline Data Backup</h3>
          <p className="text-xs text-slate-400 mt-0.5">Export or restore your records as a JSON file anytime.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExport}
            className="py-2.5 px-3 bg-slate-900 border border-slate-700 hover:border-amber-500/50 rounded-xl text-xs font-bold text-amber-400 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup</span>
          </button>

          <label className="py-2.5 px-3 bg-slate-900 border border-slate-700 hover:border-amber-500/50 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Installation Guide */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>Install on iPhone & Android</span>
        </h3>
        
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50 space-y-1">
            <span className="font-bold text-amber-400">📱 iPhone (iOS):</span>
            <p>Open this app in Safari, tap the <strong>Share</strong> icon (box with arrow), then select <strong>"Add to Home Screen"</strong>.</p>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50 space-y-1">
            <span className="font-bold text-emerald-400">🤖 Android:</span>
            <p>Open this app in Chrome, tap 3 dots at top right, and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
          </div>
        </div>
      </div>

      {/* Danger Zone (Admin Only) */}
      {isAdmin && (
        <div className="bg-slate-800 rounded-2xl border border-red-500/30 p-4 space-y-3">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1">
            <Trash2 className="w-4 h-4" />
            <span>Reset Application Data</span>
          </h3>
          <p className="text-xs text-slate-400">Wipes all stored records from local device storage.</p>
          
          <button
            onClick={handleClearAll}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-xl text-xs"
          >
            Clear All Local Storage
          </button>
        </div>
      )}

      {/* Modal: Create User (Admin Only) */}
      {showAddUserModal && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Create Supervisor Account</span>
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Supervisor"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. supervisor1"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">PIN / Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter PIN or password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role Permission</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="supervisor">Supervisor / Labor Handler</option>
                  <option value="admin">Master Admin</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="w-1/2 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
