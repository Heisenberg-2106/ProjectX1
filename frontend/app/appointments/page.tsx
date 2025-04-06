"use client"

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/globals.css";
import { useState } from "react";

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    location: string;
    image: string;
    availability: string[];
}

interface Appointment {
    doctor: string;
    time: string;
    location: string;
}

export default function AppointmentPage() {
    // State for selected doctor and appointment
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    
    const doctors: Doctor[] = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            specialty: "General Practitioner",
            rating: 4.9,
            reviews: 128,
            location: "Main Hospital",
            image: "/doctor1.jpg",
            availability: ["Mon 10am", "Tue 2pm", "Wed 4pm", "Fri 9am"]
        },
        {
            id: 2,
            name: "Dr. Michael Chen",
            specialty: "Cardiologist",
            rating: 4.8,
            reviews: 95,
            location: "Downtown Clinic",
            image: "/doctor2.jpg",
            availability: ["Tue 11am", "Thu 3pm", "Sat 10am"]
        },{
            id: 3,
            name: "Dr. Priya Patel",
            specialty: "Dermatologist",
            rating: 4.7,
            reviews: 76,
            location: "Northside Medical Center",
            image: "/doctor3.jpg",
            availability: ["Mon 1pm", "Wed 10am", "Fri 2pm"]
        }
    ];

    const handleBookAppointment = (doctor: Doctor, time: string) => {
        setSelectedAppointment({
            doctor: doctor.name,
            time: time,
            location: doctor.location
        });
        setIsModalOpen(true);
    };

    const handleConfirm = () => {
        console.log("Appointment confirmed:", selectedAppointment);
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
            <Navbar />
            
            <main className="flex-grow">
                <section className="py-16 bg-gradient-to-r from-blue-500 to-green-500 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Book Your Appointment</h1>
                        <p className="text-xl max-w-3xl mx-auto">
                            Schedule a consultation with our certified healthcare professionals
                        </p>
                    </div>
                </section>

                <section className="py-20 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-1 bg-gray-50 p-6 rounded-xl shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Find a Doctor</h2>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                        <option>General Practitioner</option>
                                        <option>Cardiologist</option>
                                        <option>Dermatologist</option>
                                        <option>Pediatrician</option>
                                        <option>Neurologist</option>
                                        <option>Psychiatrist</option>
                                    </select>
                                </div>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                        <option>Main Hospital</option>
                                        <option>Downtown Clinic</option>
                                        <option>Northside Medical Center</option>
                                        <option>Virtual Consultation</option>
                                    </select>
                                </div>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <input type="radio" id="anytime" name="availability" className="h-4 w-4 text-blue-600" defaultChecked />
                                            <label htmlFor="anytime" className="ml-2 text-sm text-gray-700">Anytime</label>
                                        </div>
                                        <div className="flex items-center">
                                            <input type="radio" id="morning" name="availability" className="h-4 w-4 text-blue-600" />
                                            <label htmlFor="morning" className="ml-2 text-sm text-gray-700">Morning (8am-12pm)</label>
                                        </div>
                                        <div className="flex items-center">
                                            <input type="radio" id="afternoon" name="availability" className="h-4 w-4 text-blue-600" />
                                            <label htmlFor="afternoon" className="ml-2 text-sm text-gray-700">Afternoon (12pm-5pm)</label>
                                        </div>
                                        <div className="flex items-center">
                                            <input type="radio" id="evening" name="availability" className="h-4 w-4 text-blue-600" />
                                            <label htmlFor="evening" className="ml-2 text-sm text-gray-700">Evening (5pm-9pm)</label>
                                        </div>
                                    </div>
                                </div>
                                
                                <button className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition">
                                    Search Doctors
                                </button>
                            </div>
                            
                            <div className="md:col-span-2">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Doctors</h2>
                                
                                <div className="space-y-6">
                                    {doctors.map(doctor => (
                                        <div key={doctor.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:border-blue-200 transition">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-shrink-0">
                                                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                                                        <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold">
                                                            {doctor.name.charAt(0)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                                                            <p className="text-gray-600">{doctor.specialty}</p>
                                                            <div className="flex items-center mt-2">
                                                                <div className="flex text-yellow-400">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <svg key={i} className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 20 20">
                                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                        </svg>
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm text-gray-500 ml-1">({doctor.reviews} reviews)</span>
                                                            </div>
                                                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {doctor.location}
                                                            </div>
                                                        </div>
                                                        <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition">
                                                            View Profile
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="mt-6">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Available Time Slots</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {doctor.availability.map((time, i) => (
                                                                <button 
                                                                    key={i}
                                                                    onClick={() => handleBookAppointment(doctor, time)}
                                                                    className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 text-sm rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                                                                >
                                                                    {time}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Confirmation Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Confirm Appointment</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Doctor</p>
                                    <p className="font-medium">{selectedAppointment?.doctor}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date & Time</p>
                                    <p className="font-medium">{selectedAppointment?.time}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium">{selectedAppointment?.location}</p>
                                </div>
                                
                                <div className="pt-4 mt-4 border-t border-gray-200">
                                    <label className="flex items-start">
                                        <input type="checkbox" className="mt-1 h-4 w-4 text-blue-600" />
                                        <span className="ml-2 text-sm text-gray-600">
                                            I agree to the <a href="#" className="text-blue-500 hover:underline">terms and conditions</a> and understand the cancellation policy.
                                        </span>
                                    </label>
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleConfirm}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Confirm Appointment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
}