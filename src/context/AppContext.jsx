import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initStorage, 
  getAuthUser, 
  loginUser as storageLogin, 
  logoutUser as storageLogout,
  registerUser as storageRegister,
  getSettings,
  saveSettings as storageSaveSettings,
  getLabors,
  saveLabor as storageSaveLabor,
  deleteLabor as storageDeleteLabor,
  getAttendance,
  saveAttendanceRecord,
  getPayments,
  addPayment as storageAddPayment,
  deletePayment as storageDeletePayment
} from '../utils/storage';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({ currency: '₹', appName: 'Labor Handler' });
  const [labors, setLabors] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'labors' | 'reports' | 'payments' | 'settings'
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [notification, setNotification] = useState(null);

  // Initialize offline storage on mount
  useEffect(() => {
    initStorage();
    const authUser = getAuthUser();
    if (authUser) {
      setUser(authUser);
    }
    refreshData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const refreshData = () => {
    setSettings(getSettings());
    setLabors(getLabors());
    setAttendance(getAttendance());
    setPayments(getPayments());
  };

  const login = (username, pin) => {
    try {
      const loggedUser = storageLogin(username, pin);
      setUser(loggedUser);
      showNotification(`Welcome back, ${loggedUser.name || loggedUser.username}!`);
      return true;
    } catch (err) {
      showNotification(err.message, 'error');
      return false;
    }
  };

  const register = (username, pin, name) => {
    try {
      const newUser = storageRegister(username, pin, name);
      setUser(newUser);
      showNotification('Account created successfully!');
      return true;
    } catch (err) {
      showNotification(err.message, 'error');
      return false;
    }
  };

  const logout = () => {
    storageLogout();
    setUser(null);
    showNotification('Logged out successfully');
  };

  const updateSettings = (newSettings) => {
    const updated = storageSaveSettings(newSettings);
    setSettings(updated);
    showNotification('Settings updated');
  };

  const addOrUpdateLabor = (laborData) => {
    storageSaveLabor(laborData);
    refreshData();
    showNotification(laborData.id ? 'Labor updated' : 'Labor created successfully');
  };

  const removeLabor = (laborId) => {
    storageDeleteLabor(laborId);
    refreshData();
    showNotification('Labor removed', 'info');
  };

  const markAttendance = (laborId, dateStr, status, customAmount = 0, notes = '') => {
    saveAttendanceRecord(laborId, dateStr, status, customAmount, notes);
    refreshData();
  };

  const recordPayment = (laborId, amount, dateStr, note) => {
    storageAddPayment(laborId, amount, dateStr, note);
    refreshData();
    showNotification('Payment recorded successfully');
  };

  const removePayment = (paymentId) => {
    storageDeletePayment(paymentId);
    refreshData();
    showNotification('Payment deleted', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        settings,
        updateSettings,
        labors,
        addOrUpdateLabor,
        removeLabor,
        attendance,
        markAttendance,
        payments,
        recordPayment,
        removePayment,
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        notification,
        showNotification,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
