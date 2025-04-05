"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface Medicine {
  _id?: string;
  name: string;
  days: number;
  time: string;
  frequency: number;
  mealTime: 'before' | 'after' | 'anytime';
}

const API_BASE_URL = 'http://localhost:3000'; // Adjust if PORT is different

export default function MyMedsPage() {
  const [medicine, setMedicine] = useState('');
  const [days, setDays] = useState<number | ''>('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState<number | ''>('');
  const [mealTime, setMealTime] = useState<'before' | 'after' | 'anytime'>('anytime');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [timeouts, setTimeouts] = useState<NodeJS.Timeout[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null); // Store JWT token

  // Check for token on mount (e.g., from localStorage)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      toast.error('Please log in to access your medicines');
      // Optionally redirect to login page
    }
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      if (!token) return; // Skip if not authenticated
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/medicines`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMedicines(response.data);
        response.data.forEach((med: Medicine) => scheduleNotifications(med));
      } catch (error: any) {
        console.error('Error fetching medicines:', {
          message: error.message || 'No message',
          code: error.code || 'No code',
          response: error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          } : 'No response',
        });
        toast.error('Failed to load medicines');
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [token]); // Re-run when token changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Please log in to save medicines');
      return;
    }

    if (!medicine.trim()) {
      toast.error('Please enter a medicine name');
      return;
    }

    const daysValue = days === '' ? 1 : days;
    if (daysValue < 1 || daysValue > 365) {
      toast.error('Please enter a valid number of days (1-365)');
      return;
    }

    const frequencyValue = frequency === '' ? 1 : frequency;
    if (frequencyValue < 1 || frequencyValue > 10) {
      toast.error('Please enter a valid frequency (1-10 times per day)');
      return;
    }

    const medicineData = {
      name: medicine.trim(),
      days: daysValue,
      time: time || '12:00',
      frequency: frequencyValue,
      mealTime,
    };

    setLoading(true);
    try {
      if (editingId) {
        const response = await axios.put(`${API_BASE_URL}/medicines/${editingId}`, medicineData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMedicines(prev => prev.map(m => m._id === editingId ? response.data : m));
        toast.success('Medicine updated successfully!');
      } else {
        const response = await axios.post(`${API_BASE_URL}/medicines`, medicineData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMedicines(prev => [...prev, response.data]);
        scheduleNotifications(response.data);
        toast.success('Medicine added successfully!');
      }

      setMedicine('');
      setDays('');
      setTime('');
      setFrequency('');
      setMealTime('anytime');
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving medicine:', {
        message: error.message || 'No message',
        code: error.code || 'No code',
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        } : 'No response',
      });
      toast.error(`Failed to ${editingId ? 'update' : 'add'} medicine`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      toast.error('Please log in to delete medicines');
      return;
    }

    if (!confirm('Are you sure you want to delete this medicine?')) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/medicines/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicines(prev => prev.filter(m => m._id !== id));
      toast.success('Medicine deleted successfully');
    } catch (error: any) {
      console.error('Error deleting medicine:', {
        message: error.message || 'No message',
        code: error.code || 'No code',
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        } : 'No response',
      });
      toast.error('Failed to delete medicine');
    } finally {
      setLoading(false);
    }
  };

  // Rest of your code (scheduleNotifications, handleEdit, handleNumberChange, and JSX) remains unchanged
  const scheduleNotifications = (med: Medicine) => {
    const [hours, minutes] = med.time.split(':').map(Number);
    const now = new Date();
    const newTimeouts: NodeJS.Timeout[] = [];

    for (let day = 0; day < med.days; day++) {
      for (let i = 0; i < med.frequency; i++) {
        const notificationTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + day,
          hours + Math.floor(i * (24 / med.frequency)),
          minutes
        );

        const timeout = notificationTime.getTime() - now.getTime();

        if (timeout > 0) {
          const timeoutId = setTimeout(() => {
            toast.info(
              <div>
                <div className="font-bold">Time to take your medicine!</div>
                <div>{med.name} - {med.frequency > 1 ? `Dose ${i + 1} of ${med.frequency}` : ''}</div>
                <div>({med.mealTime === 'before' ? 'Before meal' : med.mealTime === 'after' ? 'After meal' : 'Anytime'})</div>
              </div>,
              { autoClose: 10000 }
            );
          }, timeout);
          newTimeouts.push(timeoutId);
        }
      }
    }

    setTimeouts(prev => [...prev, ...newTimeouts]);
  };

  const handleEdit = (med: Medicine) => {
    if (!med._id) return;
    setEditingId(med._id);
    setMedicine(med.name);
    setDays(med.days);
    setTime(med.time);
    setFrequency(med.frequency);
    setMealTime(med.mealTime);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number | ''>>) => {
    const value = e.target.value;
    setter(value === '' ? '' : Math.max(1, parseInt(value) || 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50">
      {/* Hero Section */}
      <div className="relative w-full h-64 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute right-10 bottom-0 w-1/3 h-full bg-blue-700 opacity-20"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">MedTrack Pro</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Never miss a dose with our intelligent medication tracking system
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 -mt-16 z-20 relative">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            {/* Information Panel */}
            <div className="md:w-2/5 bg-blue-50 p-8 relative z-10">
              <div className="sticky top-8">
                <h2 className="text-2xl font-bold text-blue-800 mb-6">Medication Management Made Simple</h2>
                <div className="space-y-5">
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                    <h3 className="font-semibold text-blue-700 mb-2">Why Tracking Matters</h3>
                    <p className="text-blue-600 text-sm">
                      Proper medication adherence can improve treatment outcomes by up to 80% and reduce complications significantly.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                    <h3 className="font-semibold text-blue-700 mb-2">Key Benefits</h3>
                    <ul className="text-blue-600 text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        Automated reminders for each dose
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        Meal-time coordination
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        Multi-day scheduling
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="md:w-3/5 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-blue-700 mb-2">
                  {editingId ? 'Edit Medication' : 'Create New Reminder'}
                </h2>
                <p className="text-blue-600">Fill in your medication details below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Medicine Name */}
                <div className="space-y-1">
                  <label className="block text-blue-700 font-medium">Medicine Name*</label>
                  <input
                    type="text"
                    value={medicine}
                    onChange={(e) => setMedicine(e.target.value)}
                    placeholder="e.g., Amoxicillin, Lipitor"
                    className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-400 bg-blue-50 text-blue-900"
                    required
                  />
                </div>

                {/* Days and Frequency */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-blue-700 font-medium">Duration (days)*</label>
                    <input
                      type="number"
                      value={days}
                      onChange={(e) => handleNumberChange(e, setDays)}
                      min="1"
                      max="365"
                      placeholder="e.g., 30"
                      className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 placeholder-blue-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-blue-700 font-medium">Times per day*</label>
                    <input
                      type="number"
                      value={frequency}
                      onChange={(e) => handleNumberChange(e, setFrequency)}
                      min="1"
                      max="10"
                      placeholder="e.g., 2"
                      className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 placeholder-blue-400"
                      required
                    />
                  </div>
                </div>

                {/* Time and Meal Relation */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-blue-700 font-medium">First Dose Time*</label>
                    <div className="relative">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900"
                        required
                      />
                      {!time && (
                        <span className="absolute left-4 top-3 pointer-events-none text-blue-400">
                          Select time
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-blue-700 font-medium">Meal Relation*</label>
                    <select
                      value={mealTime}
                      onChange={(e) => setMealTime(e.target.value as 'before' | 'after' | 'anytime')}
                      className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900"
                    >
                      <option value="before">Before eating</option>
                      <option value="after">After eating</option>
                      <option value="anytime">Anytime</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg px-4 py-4 hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-md hover:shadow-lg"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : editingId ? 'Update Reminder' : 'Set Reminder'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setMedicine('');
                        setDays('');
                        setTime('');
                        setFrequency('');
                        setMealTime('anytime');
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 font-semibold rounded-lg px-4 py-4 hover:bg-gray-300 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {medicines.length > 0 && (
                <div className="mt-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-blue-800">Your Medication Schedule</h2>
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {medicines.length} active reminder{medicines.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {medicines.map((med) => (
                      <div
                        key={med._id}
                        className="border border-blue-100 rounded-lg p-4 bg-white hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-blue-900">{med.name}</span>
                            <div className="text-sm text-blue-600 mt-1">
                              {med.frequency}x/day • {med.days} day{med.days !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              {med.mealTime === 'before' ? 'Before meal' : med.mealTime === 'after' ? 'After meal' : 'Anytime'}
                            </div>
                            <button
                              onClick={() => handleEdit(med)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => med._id && handleDelete(med._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-blue-700">
                          First dose at <span className="font-medium">{med.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-blue-100">
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Understanding Medication Adherence</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-3">The Importance of Timing</h3>
              <p className="text-blue-600 text-sm">
                Taking medications at consistent times maintains stable drug levels in your bloodstream for optimal effectiveness.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-3">Meal Interactions</h3>
              <p className="text-blue-600 text-sm">
                Some medications work better when taken with food, while others should be taken on an empty stomach.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-3">Dosage Frequency</h3>
              <p className="text-blue-600 text-sm">
                Multiple daily doses help maintain therapeutic levels and prevent side effects from dosage spikes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        toastClassName="bg-blue-50 text-blue-900 border border-blue-200"
        progressClassName="bg-gradient-to-r from-blue-400 to-blue-600"
      />
    </div>
  );
}