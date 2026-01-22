import { User, Medicine, DoseLog, Appointment } from '../types';

const USERS_KEY = 'meditrack_users';
const MEDICINES_KEY = 'meditrack_medicines';
const HISTORY_KEY = 'meditrack_history';
const APPOINTMENTS_KEY = 'meditrack_appointments';
const SESSION_KEY = 'meditrack_session';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const registerUser = async (user: User, password: string): Promise<User> => {
  await delay(500);
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  if (users.find(u => u.email === user.email)) {
    throw new Error('User already exists');
  }

  const newUser = { ...user, password };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: newUser.email, name: newUser.name }));
  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  await delay(500);
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, name: user.name }));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const getMedicines = async (): Promise<Medicine[]> => {
  await delay(300);
  const user = getCurrentUser();
  if (!user) return [];
  
  const allMeds: Medicine[] = JSON.parse(localStorage.getItem(MEDICINES_KEY) || '[]');
  return allMeds.filter(m => m.userId === user.email);
};

export const addMedicine = async (medicine: Omit<Medicine, 'id' | 'userId'>): Promise<Medicine> => {
  await delay(300);
  const user = getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const allMeds: Medicine[] = JSON.parse(localStorage.getItem(MEDICINES_KEY) || '[]');
  
  const newMed: Medicine = {
    ...medicine,
    id: Math.random().toString(36).substr(2, 9),
    userId: user.email
  };
  
  allMeds.push(newMed);
  localStorage.setItem(MEDICINES_KEY, JSON.stringify(allMeds));
  return newMed;
};

export const getHistory = async (): Promise<DoseLog[]> => {
  await delay(300);
  const user = getCurrentUser();
  if (!user) return [];
  
  const allHistory: DoseLog[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  return allHistory.filter(h => h.userId === user.email);
};

export const logDose = async (log: Omit<DoseLog, 'id' | 'userId'>): Promise<DoseLog> => {
  await delay(200);
  const user = getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const allHistory: DoseLog[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  
  const existing = allHistory.find(h => 
    h.medicineId === log.medicineId && 
    h.scheduledTime === log.scheduledTime &&
    h.userId === user.email
  );

  if (existing) {
    if (existing.status !== 'taken' || log.status === 'snoozed') {
       Object.assign(existing, log);
       localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
       return existing;
    }
    console.warn("Dose already marked!");
    return existing;
  }

  const newLog: DoseLog = {
    ...log,
    id: Math.random().toString(36).substr(2, 9),
    userId: user.email
  };
  
  allHistory.push(newLog);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
  return newLog;
};

export const getAppointments = async (): Promise<Appointment[]> => {
  await delay(300);
  const user = getCurrentUser();
  if (!user) return [];
  
  const allApps: Appointment[] = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]');
  return allApps.filter(a => a.userId === user.email).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const addAppointment = async (appt: Omit<Appointment, 'id' | 'userId'>): Promise<Appointment> => {
  await delay(300);
  const user = getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const allApps: Appointment[] = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]');
  const newAppt: Appointment = {
    ...appt,
    id: Math.random().toString(36).substr(2, 9),
    userId: user.email
  };
  
  allApps.push(newAppt);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(allApps));
  return newAppt;
};