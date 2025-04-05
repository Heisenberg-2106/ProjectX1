import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import './globals.css'

export default function Home() {
    return (
        <>
            <Navbar />
            <Hero />

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto text-center px-4">
                    <h2 className="text-2xl font-bold mb-10">Why Choose Us ?</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[{
                            title: "AI Symptom Checker",
                            desc: "Receive instant preliminary diagnoses with risk factor analysis."
                        }, {
                            title: "Secure Patient Records",
                            desc: "Your health data is protected with HIPAA-compliant encryption."
                        }, {
                            title: "Virtual Consultations",
                            desc: "Connect with certified healthcare professionals in minutes."
                        }, {
                            title: "Medication Management",
                            desc: "Track prescriptions and set reminders for better adherence."
                        }].map((feature, i) => (
                            <div
                                key={i}
                                className="bg-red-400 text-white p-2 rounded-xl shadow hover:shadow-md transition py-20"
                            >
                                <h3 className="font-bold text-lg mb-4">{feature.title}</h3>
                                <p className="text-sm py-6 text-black font-semibold">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
