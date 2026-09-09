import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initStorage, 
  getAuthUser, 
  loginUser as storageLogin, 
  logoutUser as storageLogout,
  registerUser as storageRegister,
  getUsers,
  deleteUser as storageDeleteUser,
  getSettings,
  saveSettings as storageSaveSettings,
  getLabors,
  saveLabor as storageSaveLabor,
  deleteLabor as storageDeleteLabor,
  getAttendance,
  saveAttendanceRecord,
  getPayments,
  addPayment as storageAddPayment,
  deletePayment as storageDeletePayment,
  exportBackup,
  importBackup
} from '../utils/storage';

import { pushToGoogleSheet, pullFromGoogleSheet } from '../utils/googleSheets';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [settings, setSettings] = useState({ currency: '₹', appName: 'Labor Handler', googleSheetUrl: '' });
  const [labors, setLabors] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('attendance');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [notification, setNotification] = useState(null);

  // Initialize offline storage on mount & check cloud sync
  useEffect(() => {
    initStorage();
    const authUser = getAuthUser();
    if (authUser) {
      setUser(authUser);
    }
    const currentSettings = getSettings();
    setSettings(currentSettings);
    refreshData();

    if (currentSettings.googleSheetUrl) {
      syncFromCloud(currentSettings.googleSheetUrl);
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const refreshData = () => {
    setUsersList(getUsers());
    setSettings(getSettings());
    setLabors(getLabors());
    setAttendance(getAttendance());
    setPayments(getPayments());
  };

  const autoCloudPush = async (overrideSettings = null) => {
    const activeSettings = overrideSettings || settings;
    if (!activeSettings.googleSheetUrl) return;

    try {
      setIsSyncing(true);
      const backupJsonStr = exportBackup();
      const backupObj = JSON.parse(backupJsonStr);
      await pushToGoogleSheet(activeSettings.googleSheetUrl, backupObj);
    } catch (e) {
      console.error('Auto Cloud Push Failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncFromCloud = async (sheetUrl = null) => {
    const targetUrl = sheetUrl || settings.googleSheetUrl;
    if (!targetUrl) return false;

    try {
      setIsSyncing(true);
      const cloudData = await pullFromGoogleSheet(targetUrl);
      if (cloudData && (cloudData.labors || cloudData.users)) {
        importBackup(JSON.stringify(cloudData));
        refreshData();
        showNotification('Data synced with Google Sheet cloud!', 'success');
        return true;
      }
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
    return false;
  };

  const syncToCloud = async () => {
    if (!settings.googleSheetUrl) {
      showNotification('Please add a Google Sheet Webhook URL in Settings', 'error');
      return false;
    }
    await autoCloudPush();
    showNotification('Uploaded all records to Google Sheet!', 'success');
    return true;
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

  const createUserAccount = (username, pin, name, role = 'supervisor') => {
    try {
      storageRegister(username, pin, name, role);
      refreshData();
      autoCloudPush();
      showNotification(`User @${username} created successfully!`);
      return true;
    } catch (err) {
      showNotification(err.message, 'error');
      return false;
    }
  };

  const removeUserAccount = (username) => {
    storageDeleteUser(username);
    refreshData();
    autoCloudPush();
    showNotification(`User @${username} deleted`, 'info');
  };

  const logout = () => {
    storageLogout();
    setUser(null);
    showNotification('Logged out successfully');
  };

  const updateSettings = (newSettings) => {
    const updated = storageSaveSettings(newSettings);
    setSettings(updated);
    if (newSettings.googleSheetUrl) {
      autoCloudPush(updated);
    }
    showNotification('Settings updated');
  };

  const addOrUpdateLabor = (laborData) => {
    storageSaveLabor(laborData);
    refreshData();
    autoCloudPush();
    showNotification(laborData.id ? 'Labor updated' : 'Labor created successfully');
  };

  const removeLabor = (laborId) => {
    storageDeleteLabor(laborId);
    refreshData();
    autoCloudPush();
    showNotification('Labor removed', 'info');
  };

  const markAttendance = (laborId, dateStr, status, customAmount = 0, notes = '') => {
    saveAttendanceRecord(laborId, dateStr, status, customAmount, notes);
    refreshData();
    autoCloudPush();
  };

  const recordPayment = (laborId, amount, dateStr, note) => {
    storageAddPayment(laborId, amount, dateStr, note);
    refreshData();
    autoCloudPush();
    showNotification('Payment recorded successfully');
  };

  const removePayment = (paymentId) => {
    storageDeletePayment(paymentId);
    refreshData();
    autoCloudPush();
    showNotification('Payment deleted', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        usersList,
        login,
        createUserAccount,
        removeUserAccount,
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
        refreshData,
        isSyncing,
        syncFromCloud,
        syncToCloud
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
