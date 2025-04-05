export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-10 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-white font-bold text-lg mb-3">Project X</h3>
                    <ul className="space-y-1 text-sm">
                        <li>&gt; Appointments</li>
                        <li>&gt; AI Assistant</li>
                        <li>&gt; Live Consultations</li>
                        <li>&gt; Meds Tracker</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-3">About</h3>
                    <ul className="space-y-1 text-sm">
                        <li>Contact</li>
                        <li>About Us</li>
                    </ul>
                </div>
                <div className="text-sm mt-4 md:mt-0">
                    <p>© {new Date().getFullYear()} Project X. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}