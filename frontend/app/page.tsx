// Updated page.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import './globals.css'

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
            <Navbar />
            <Hero />

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Us?</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Comprehensive healthcare solutions powered by AI and medical expertise
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[{
                            title: "AI Symptom Checker",
                            desc: "Receive instant preliminary diagnoses with risk factor analysis.",
                            icon: "🔍"
                        }, {
                            title: "Secure Patient Records",
                            desc: "Your health data is protected with HIPAA-compliant encryption.",
                            icon: "🔒"
                        }, {
                            title: "Virtual Consultations",
                            desc: "Connect with certified healthcare professionals in minutes.",
                            icon: "💬"
                        }, {
                            title: "Medication Management",
                            desc: "Track prescriptions and set reminders for better adherence.",
                            icon: "💊"
                        }].map((feature, i) => (
                            <div
                                key={i}
                                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-green-100"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                                        Learn more →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-100 to-green-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to take control of your health?</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Join thousands of satisfied patients who trust our platform for their healthcare needs.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow hover:shadow-md transition">
                            Book an Appointment
                        </button>
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium rounded-lg shadow hover:shadow-md hover:opacity-90 transition">
                            Try AI Symptom Checker
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}