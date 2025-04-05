export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-slate-800 to-slate-900 text-slate-300 border-t border-slate-700">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-4 gap-10">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h3 className="text-white font-bold text-xl bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                            HealthConnect
                        </h3>
                        <p className="text-sm text-slate-400">
                            Your comprehensive healthcare solution powered by AI and medical expertise.
                        </p>
                        <div className="flex space-x-4">
                            {['Twitter', 'Facebook', 'LinkedIn', 'Instagram'].map((social) => (
                                <a 
                                    key={social} 
                                    href="#" 
                                    className="text-slate-400 hover:text-white transition-colors duration-200"
                                    aria-label={social}
                                >
                                    <span className="sr-only">{social}</span>
                                    <div className="h-6 w-6 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center">
                                        {/* Icon would go here */}
                                        {social.charAt(0)}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {['Appointments', 'AI Assistant', 'Live Consultations', 'Meds Tracker'].map((item) => (
                                <li key={item}>
                                    <a 
                                        href="#" 
                                        className="text-slate-400 hover:text-blue-300 transition-colors duration-200 flex items-center"
                                    >
                                        <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            {['About Us', 'Careers', 'Press', 'Contact'].map((item) => (
                                <li key={item}>
                                    <a 
                                        href="#" 
                                        className="text-slate-400 hover:text-green-300 transition-colors duration-200 flex items-center"
                                    >
                                        <span className="w-1 h-1 bg-green-400 rounded-full mr-2"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Newsletter
                        </h4>
                        <p className="text-sm text-slate-400 mb-4">
                            Subscribe to our newsletter for the latest updates.
                        </p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="px-4 py-2 w-full rounded-l-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-r-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="mt-12 pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} HealthConnect. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
                            Terms of Service
                        </a>
                        <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
                            Cookies
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}