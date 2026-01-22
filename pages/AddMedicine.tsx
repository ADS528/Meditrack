import React, { useState } from 'react';
import { addMedicine } from '../services/api';
import { ArrowLeft } from 'lucide-react';

interface AddMedicineProps {
  onCancel: () => void;
  onSave: () => void;
}

export const AddMedicine: React.FC<AddMedicineProps> = ({ onCancel, onSave }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'twice' | 'custom'>('once');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [times, setTimes] = useState<string[]>(['09:00']);

  const handleFrequencyChange = (freq: 'once' | 'twice' | 'custom') => {
    setFrequency(freq);
    if (freq === 'once') setTimes(['09:00']);
    if (freq === 'twice') setTimes(['09:00', '21:00']);
    if (freq === 'custom') setTimes(['09:00']);
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const addTimeSlot = () => {
    setTimes([...times, '12:00']);
  };

  const removeTimeSlot = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMedicine({
        name,
        dosage,
        frequency,
        times,
        startDate,
        endDate: endDate || '2099-12-31'
    });
    onSave();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <button onClick={onCancel} className="mb-4 flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </button>
      
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Medicine</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Amoxicillin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Dosage</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              placeholder="e.g. 500mg, 1 tablet"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                    type="date"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                <input
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                />
              </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <div className="flex space-x-4">
               {(['once', 'twice', 'custom'] as const).map(f => (
                   <button
                    key={f}
                    type="button"
                    onClick={() => handleFrequencyChange(f)}
                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                        frequency === f 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                   >
                       {f} Daily
                   </button>
               ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Times</label>
             <div className="space-y-2">
                 {times.map((time, idx) => (
                     <div key={idx} className="flex items-center space-x-2">
                         <input
                            type="time"
                            required
                            value={time}
                            onChange={e => handleTimeChange(idx, e.target.value)}
                            className="block w-40 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         />
                         {frequency === 'custom' && times.length > 1 && (
                             <button type="button" onClick={() => removeTimeSlot(idx)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                         )}
                     </div>
                 ))}
                 {frequency === 'custom' && (
                     <button type="button" onClick={addTimeSlot} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                         + Add another time
                     </button>
                 )}
             </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};