import React, { useEffect, useState, useRef } from 'react';
import { getMedicines, getHistory, logDose } from '../services/api';
import { Medicine, DoseLog } from '../types';
import { Plus, Check, Clock, AlertTriangle, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  onAddMedicine: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddMedicine }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [todaysDoses, setTodaysDoses] = useState<{
    medicine: Medicine;
    time: string;
    status: 'pending' | 'taken' | 'missed' | 'snoozed';
  }[]>([]);
  const [stats, setStats] = useState({ completed: 0, missed: 0, adherence: 0 });
  const [lateWarning, setLateWarning] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Check for notifications every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${mins}`;

        todaysDoses.forEach(dose => {
            if (dose.status === 'pending' && dose.time === currentTime) {
                const key = `${dose.medicine.id}-${currentTime}`;
                // Prevent duplicate notifications for the same minute
                if (!notifiedRef.current.has(key)) {
                    if (Notification.permission === 'granted') {
                        new Notification(`Time to take ${dose.medicine.name}`, {
                            body: `It is ${currentTime}. Dosage: ${dose.medicine.dosage}`,
                            icon: '/vite.svg'
                        });
                        notifiedRef.current.add(key);
                    }
                }
            }
        });
        
        // Optional: Trigger a data refresh to update 'Missed' statuses visually if time passes
        if (now.getSeconds() === 0) {
            loadDashboardData();
        }

    }, 5000); 

    return () => clearInterval(interval);
  }, [todaysDoses]);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
        new Notification("Notifications Enabled", {
            body: "MediTrack will now remind you when it's time to take your pills!"
        });
    }
  };

  const loadDashboardData = async () => {
    const meds = await getMedicines();
    const history = await getHistory();
    setMedicines(meds);

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let completedCount = 0;
    let missedCount = 0;

    const todaysHistory = history.filter(h => h.scheduledTime.startsWith(today));

    const doses: typeof todaysDoses = [];
    
    meds.forEach(med => {
       if (today >= med.startDate && today <= med.endDate) {
         med.times.forEach(time => {
            const scheduledDateTime = `${today}T${time}:00`;
            const log = todaysHistory.find(h => h.medicineId === med.id && h.scheduledTime === scheduledDateTime);
            
            let status: 'pending' | 'taken' | 'missed' | 'snoozed' = 'pending';
            
            if (log) {
              status = log.status;
            } else if (time < currentTimeStr) {
               status = 'missed';
            }

            doses.push({
              medicine: med,
              time: time,
              status
            });
         });
       }
    });

    const lateTakes = history.filter(h => {
        if (!h.takenTime) return false;
        const scheduled = new Date(h.scheduledTime);
        const taken = new Date(h.takenTime);
        const diffMins = (taken.getTime() - scheduled.getTime()) / 60000;
        return diffMins > 60;
    });
    
    if (lateTakes.length > 3) {
        setLateWarning("You often take your meds late. Consider adjusting your schedule.");
    }

    doses.sort((a, b) => a.time.localeCompare(b.time));
    setTodaysDoses(doses);

    completedCount = todaysHistory.filter(h => h.status === 'taken').length;
    missedCount = todaysHistory.filter(h => h.status === 'missed').length;
    const autoMissed = doses.filter(d => d.status === 'missed' && !todaysHistory.find(h => h.medicineId === d.medicine.id && h.scheduledTime === `${today}T${d.time}:00`)).length;
    
    const totalDue = completedCount + missedCount + autoMissed + doses.filter(d => d.status === 'pending').length;

    setStats({
      completed: completedCount,
      missed: missedCount + autoMissed,
      adherence: totalDue > 0 ? Math.round((completedCount / totalDue) * 100) : 100
    });
  };

  const handleAction = async (medicine: Medicine, time: string, action: 'taken' | 'snooze') => {
    const today = new Date().toISOString().split('T')[0];
    const scheduledTime = `${today}T${time}:00`;
    
    const status = action === 'taken' ? 'taken' : 'snoozed';
    
    await logDose({
      medicineId: medicine.id,
      medicineName: medicine.name,
      scheduledTime,
      takenTime: new Date().toISOString(),
      status
    });
    
    loadDashboardData();
  };

  const chartData = [
    { name: 'Taken', value: stats.completed, color: '#10B981' },
    { name: 'Missed', value: stats.missed, color: '#EF4444' },
    { name: 'Pending', value: Math.max(0, todaysDoses.filter(d => d.status === 'pending').length), color: '#E5E7EB' },
  ];

  if (stats.completed === 0 && stats.missed === 0 && chartData[2].value === 0) {
      chartData[2].value = 1;
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Today's Overview</h2>
            <div className="flex space-x-2">
                {notificationPermission !== 'granted' && (
                    <button
                        onClick={requestNotificationPermission}
                        className="flex items-center text-sm bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-200 transition"
                        title="Enable Notifications"
                    >
                        <Bell className="w-4 h-4 mr-1" /> Enable Alerts
                    </button>
                )}
                <button 
                onClick={onAddMedicine}
                className="flex items-center text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                <Plus className="w-4 h-4 mr-1" /> Add Medicine
                </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
             <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-xs text-green-800">Taken</div>
             </div>
             <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.missed}</div>
                <div className="text-xs text-red-800">Missed</div>
             </div>
             <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.adherence}%</div>
                <div className="text-xs text-blue-800">Adherence</div>
             </div>
          </div>
          
          {lateWarning && (
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {lateWarning}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
            <h3 className="text-gray-500 font-medium mb-2">Daily Progress</h3>
            <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                        >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Schedule</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {todaysDoses.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No medicines scheduled for today.</div>
          ) : (
            todaysDoses.map((dose, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-start mb-3 sm:mb-0">
                  <div className={`mt-1 p-2 rounded-full mr-4 flex-shrink-0 ${
                      dose.status === 'taken' ? 'bg-green-100 text-green-600' :
                      dose.status === 'missed' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                  }`}>
                     {dose.status === 'taken' ? <Check className="w-5 h-5"/> : <Clock className="w-5 h-5"/>}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{dose.medicine.name}</h4>
                    <p className="text-sm text-gray-500">{dose.medicine.dosage} • {dose.time}</p>
                    {dose.status === 'missed' && <span className="text-xs text-red-500 font-medium">Missed</span>}
                    {dose.status === 'taken' && <span className="text-xs text-green-500 font-medium">Completed</span>}
                    {dose.status === 'snoozed' && <span className="text-xs text-orange-500 font-medium">Snoozed</span>}
                  </div>
                </div>
                
                {dose.status !== 'taken' && (
                    <div className="flex space-x-2 sm:ml-auto">
                        <button 
                            onClick={() => handleAction(dose.medicine, dose.time, 'snooze')}
                            className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                        >
                            Snooze
                        </button>
                        <button 
                            onClick={() => handleAction(dose.medicine, dose.time, 'taken')}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm"
                        >
                            Take
                        </button>
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
