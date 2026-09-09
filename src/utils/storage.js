// Storage Keys
const KEYS = {
  USERS: 'labor_app_users',
  AUTH: 'labor_app_auth',
  SETTINGS: 'labor_app_settings',
  LABORS: 'labor_app_labors',
  ATTENDANCE: 'labor_app_attendance',
  PAYMENTS: 'labor_app_payments'
};

// Initial Seed Data for immediate preview
const SAMPLE_LABORS = [
  { id: 'l1', name: 'Ramesh Kumar', phone: '9876543210', dailyRate: 600, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'l2', name: 'Suresh Patel', phone: '9876543211', dailyRate: 550, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'l3', name: 'Anita Devi', phone: '9876543212', dailyRate: 500, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() }
];

// Helper to format Date to YYYY-MM-DD
export function formatDate(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

// Get dates array between start and end
export function getDatesInRange(startDateStr, endDateStr) {
  const dates = [];
  let curr = new Date(startDateStr);
  const end = new Date(endDateStr);
  while (curr <= end) {
    dates.push(formatDate(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

// Get current week range (Monday to Sunday)
export function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMon));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
}

// Helper getter & setter
function getItem(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Failed to parse storage key:', key, e);
    return defaultValue;
  }
}

function setItem(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save storage key:', key, e);
  }
}

// Initialize seed data if empty
export function initStorage() {
  if (!localStorage.getItem(KEYS.LABORS)) {
    setItem(KEYS.LABORS, SAMPLE_LABORS);
    
    // Seed attendance for current week
    const { start } = getCurrentWeekRange();
    const today = formatDate(new Date());
    const attendanceSeed = [
      { id: 'att_1', laborId: 'l1', date: today, status: 'present', customAmount: 600, notes: 'Full Day' },
      { id: 'att_2', laborId: 'l2', date: today, status: 'custom', customAmount: 350, notes: 'Worked 4 hours' },
      { id: 'att_3', laborId: 'l3', date: today, status: 'present', customAmount: 500, notes: 'Full Day' }
    ];
    setItem(KEYS.ATTENDANCE, attendanceSeed);

    // Seed payment
    const paymentSeed = [
      { id: 'p_1', laborId: 'l1', date: today, amount: 500, note: 'Advance cash payment' }
    ];
    setItem(KEYS.PAYMENTS, paymentSeed);
  }

  if (!localStorage.getItem(KEYS.SETTINGS)) {
    setItem(KEYS.SETTINGS, { currency: '₹', appName: 'Labor Handler' });
  }

  // Seed default user if no user exists
  if (!localStorage.getItem(KEYS.USERS)) {
    const defaultUser = { username: 'admin', pin: '1234', name: 'Master Admin', role: 'admin', createdAt: new Date().toISOString() };
    setItem(KEYS.USERS, [defaultUser]);
  }
}

// AUTH & USER MANAGEMENT FUNCTIONS
export function getUsers() {
  return getItem(KEYS.USERS, []);
}

export function registerUser(username, pin, name, role = 'supervisor') {
  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('User with this username already exists');
  }
  const newUser = { 
    username: username.trim(), 
    pin: pin.trim(), 
    name: name.trim(),
    role: role || 'supervisor',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  setItem(KEYS.USERS, users);
  return newUser;
}

export function deleteUser(username) {
  let users = getUsers();
  users = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
  setItem(KEYS.USERS, users);
  return users;
}

export function loginUser(username, pin) {
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.pin === pin);
  if (!user) {
    throw new Error('Invalid Username or PIN');
  }
  setItem(KEYS.AUTH, user);
  return user;
}

export function getAuthUser() {
  return getItem(KEYS.AUTH, null);
}

export function logoutUser() {
  localStorage.removeItem(KEYS.AUTH);
}

// SETTINGS
export function getSettings() {
  return getItem(KEYS.SETTINGS, { currency: '₹', appName: 'Labor Handler' });
}

export function saveSettings(settings) {
  const current = getSettings();
  const updated = { ...current, ...settings };
  setItem(KEYS.SETTINGS, updated);
  return updated;
}

// LABORS MANAGEMENT
export function getLabors() {
  return getItem(KEYS.LABORS, []);
}

export function saveLabor(laborData) {
  const labors = getLabors();
  if (laborData.id) {
    // Edit existing
    const index = labors.findIndex(l => l.id === laborData.id);
    if (index !== -1) {
      labors[index] = { ...labors[index], ...laborData, dailyRate: Number(laborData.dailyRate) };
    }
  } else {
    // Create new
    const newLabor = {
      ...laborData,
      id: 'l_' + Date.now(),
      dailyRate: Number(laborData.dailyRate),
      createdAt: new Date().toISOString()
    };
    labors.push(newLabor);
  }
  setItem(KEYS.LABORS, labors);
  return labors;
}

export function deleteLabor(laborId) {
  let labors = getLabors();
  labors = labors.filter(l => l.id !== laborId);
  setItem(KEYS.LABORS, labors);
  
  // clean up attendance and payments
  let attendance = getItem(KEYS.ATTENDANCE, []);
  attendance = attendance.filter(a => a.laborId !== laborId);
  setItem(KEYS.ATTENDANCE, attendance);

  let payments = getItem(KEYS.PAYMENTS, []);
  payments = payments.filter(p => p.laborId !== laborId);
  setItem(KEYS.PAYMENTS, payments);
}

// ATTENDANCE MANAGEMENT
export function getAttendance() {
  return getItem(KEYS.ATTENDANCE, []);
}

export function getAttendanceByDate(dateStr) {
  const attendance = getAttendance();
  return attendance.filter(a => a.date === dateStr);
}

export function saveAttendanceRecord(laborId, dateStr, status, customAmount = 0, notes = '') {
  const attendance = getAttendance();
  const labors = getLabors();
  const labor = labors.find(l => l.id === laborId);
  
  let wageAmount = 0;
  if (status === 'present') {
    wageAmount = labor ? Number(labor.dailyRate) : 0;
  } else if (status === 'custom') {
    wageAmount = Number(customAmount) || 0;
  } else {
    wageAmount = 0; // absent
  }

  const existingIndex = attendance.findIndex(a => a.laborId === laborId && a.date === dateStr);
  if (existingIndex !== -1) {
    attendance[existingIndex] = {
      ...attendance[existingIndex],
      status,
      customAmount: wageAmount,
      notes
    };
  } else {
    attendance.push({
      id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      laborId,
      date: dateStr,
      status,
      customAmount: wageAmount,
      notes
    });
  }

  setItem(KEYS.ATTENDANCE, attendance);
  return attendance;
}

// PAYMENTS MANAGEMENT
export function getPayments() {
  return getItem(KEYS.PAYMENTS, []);
}

export function addPayment(laborId, amount, dateStr, note = '') {
  const payments = getPayments();
  const newPayment = {
    id: 'pay_' + Date.now(),
    laborId,
    amount: Number(amount),
    date: dateStr || formatDate(new Date()),
    note
  };
  payments.push(newPayment);
  setItem(KEYS.PAYMENTS, payments);
  return newPayment;
}

export function deletePayment(paymentId) {
  let payments = getPayments();
  payments = payments.filter(p => p.id !== paymentId);
  setItem(KEYS.PAYMENTS, payments);
}

// REPORT & SUMMARY CALCULATIONS
export function getLaborSummary(laborId, startDateStr = null, endDateStr = null) {
  const labor = getLabors().find(l => l.id === laborId);
  if (!labor) return null;

  let attendance = getAttendance().filter(a => a.laborId === laborId);
  let payments = getPayments().filter(p => p.laborId === laborId);

  if (startDateStr && endDateStr) {
    attendance = attendance.filter(a => a.date >= startDateStr && a.date <= endDateStr);
    payments = payments.filter(p => p.date >= startDateStr && p.date <= endDateStr);
  }

  let presentDays = 0;
  let customDays = 0;
  let absentDays = 0;
  let totalEarned = 0;

  attendance.forEach(a => {
    if (a.status === 'present') {
      presentDays++;
      totalEarned += Number(a.customAmount || labor.dailyRate);
    } else if (a.status === 'custom') {
      customDays++;
      totalEarned += Number(a.customAmount || 0);
    } else if (a.status === 'absent') {
      absentDays++;
    }
  });

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingBalance = totalEarned - totalPaid;

  return {
    labor,
    presentDays,
    customDays,
    absentDays,
    totalEarned,
    totalPaid,
    pendingBalance,
    attendanceRecords: attendance,
    paymentRecords: payments
  };
}

export function calculateWeeklyReport(startDateStr, endDateStr) {
  const labors = getLabors();
  const reports = labors.map(labor => getLaborSummary(labor.id, startDateStr, endDateStr));

  const totalEarned = reports.reduce((sum, r) => sum + (r ? r.totalEarned : 0), 0);
  const totalPaid = reports.reduce((sum, r) => sum + (r ? r.totalPaid : 0), 0);
  const totalPending = totalEarned - totalPaid;

  return {
    startDate: startDateStr,
    endDate: endDateStr,
    laborReports: reports.filter(Boolean),
    overall: {
      totalEarned,
      totalPaid,
      totalPending
    }
  };
}

// BACKUP & RESTORE
export function exportBackup() {
  const backup = {
    users: getItem(KEYS.USERS, []),
    settings: getItem(KEYS.SETTINGS, {}),
    labors: getItem(KEYS.LABORS, []),
    attendance: getItem(KEYS.ATTENDANCE, []),
    payments: getItem(KEYS.PAYMENTS, []),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackup(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.labors || !Array.isArray(data.labors)) {
      throw new Error('Invalid backup file format.');
    }
    if (data.users) setItem(KEYS.USERS, data.users);
    if (data.settings) setItem(KEYS.SETTINGS, data.settings);
    if (data.labors) setItem(KEYS.LABORS, data.labors);
    if (data.attendance) setItem(KEYS.ATTENDANCE, data.attendance);
    if (data.payments) setItem(KEYS.PAYMENTS, data.payments);
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    throw e;
  }
}
