export interface User {
  email: string;
  name: string;
  password?: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'custom';
  times: string[];
  startDate: string;
  endDate: string;
  userId: string;
}

export type DoseStatus = 'pending' | 'taken' | 'missed' | 'snoozed';

export interface DoseLog {
  id: string;
  medicineId: string;
  medicineName: string;
  scheduledTime: string;
  takenTime?: string;
  status: DoseStatus;
  userId: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  notes?: string;
  userId: string;
}