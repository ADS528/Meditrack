import React, { useState, useEffect } from 'react';
import { getAppointments, addAppointment } from '../services/api';
import { Appointment } from '../types';
import { Calendar as CalendarIcon, MapPin, User, Plus } from 'lucide-react';

export const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
      const data = await getAppointments();
      setAppointments(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAppointment({
        doctorName,
        specialty,
        date,
        time,
        notes
    });
    setShowForm(false);
    resetForm();
    loadData();
  };

  const resetForm = () => {
      setDoctorName('');
      setSpecialty('');
      setDate('');
      setTime('');
      setNotes('');
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Doctor Appointments</h2>
        <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
            <Plus className="w-4 h-4 mr-2" /> Add Appointment
        </button>
      </div>

      {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6 animate-fade-in-down">
              <h3 className="text-lg font-semibold mb-4">New Appointment</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required placeholder="Doctor Name" className="border p-2 rounded" value={doctorName} onChange={e => setDoctorName(e.target.value)} />
                  <input required placeholder="Specialty (e.g. Cardiologist)" className="border p-2 rounded" value={specialty} onChange={e => setSpecialty(e.target.value)} />
                  <input required type="date" className="border p-2 rounded" value={date} onChange={e => setDate(e.target.value)} />
                  <input required type="time" className="border p-2 rounded" value={time} onChange={e => setTime(e.target.value)} />
                  <textarea placeholder="Notes (Location, purpose, etc.)" className="border p-2 rounded md:col-span-2" value={notes} onChange={e => setNotes(e.target.value)} />
                  <div className="md:col-span-2 flex justify-end space-x-2">
                      <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                  </div>
              </form>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map(apt => (
            <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900">{apt.doctorName}</h3>
                        <p className="text-blue-600 text-sm font-medium">{apt.specialty}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <User className="w-5 h-5 text-blue-500" />
                    </div>
                </div>
                
                <div className="mt-4 space-y-2">
                    <div className="flex items-center text-gray-600 text-sm">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(apt.date).toLocaleDateString()} at {apt.time}
                    </div>
                    {apt.notes && (
                        <div className="flex items-start text-gray-500 text-sm mt-2 pt-2 border-t border-gray-50">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                            {apt.notes}
                        </div>
                    )}
                </div>
            </div>
        ))}
        {appointments.length === 0 && !showForm && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No upcoming appointments.</p>
            </div>
        )}
      </div>
    </div>
  );
};