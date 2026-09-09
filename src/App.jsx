import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import DailyAttendance from './components/DailyAttendance';
import LaborList from './components/LaborList';
import WeeklyReport from './components/WeeklyReport';
import PaymentsHistory from './components/PaymentsHistory';
import Settings from './components/Settings';

function MainContent() {
  const { user, activeTab, notification } = useApp();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Sticky Navbar */}
      <Navbar />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
          <div className={`p-3 rounded-2xl text-xs font-semibold shadow-2xl border text-center backdrop-blur-md animate-bounce ${
            notification.type === 'error'
              ? 'bg-rose-500/90 text-white border-rose-400'
              : notification.type === 'info'
              ? 'bg-sky-500/90 text-white border-sky-400'
              : 'bg-emerald-500/90 text-slate-950 border-emerald-400 font-bold'
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Screen Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4">
        {activeTab === 'attendance' && <DailyAttendance />}
        {activeTab === 'labors' && <LaborList />}
        {activeTab === 'reports' && <WeeklyReport />}
        {activeTab === 'payments' && <PaymentsHistory />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
