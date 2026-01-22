import React, { useEffect, useState } from 'react';
import { getHistory } from '../services/api';
import { DoseLog } from '../types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<DoseLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const data = await getHistory();
        setLogs(data.sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()));
    };
    fetchData();
  }, []);

  const formatDate = (iso: string) => {
      return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const formatTime = (iso: string) => {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="px-4 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dose History</h2>
      
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No history available yet.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Time</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                    <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                ${log.status === 'taken' ? 'bg-green-100 text-green-800' : 
                                  log.status === 'missed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {log.status === 'taken' && <CheckCircle className="w-3 h-3 mr-1"/>}
                                {log.status === 'missed' && <XCircle className="w-3 h-3 mr-1"/>}
                                {log.status === 'snoozed' && <Clock className="w-3 h-3 mr-1"/>}
                                {log.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.medicineName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.scheduledTime)} at {formatTime(log.scheduledTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.takenTime ? formatTime(log.takenTime) : '-'}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};