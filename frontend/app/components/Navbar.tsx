import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-gradient-to-r from-blue-100 to-green-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo on the left */}
                    <div className="flex-shrink-0">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            HealthConnect
                        </span>
                    </div>

                    {/* Navigation links centered */}
                    <div className="hidden md:flex items-center justify-center flex-1">
                        <div className="flex space-x-1">
                            {[
                                { name: "Appointments", href: "#" },
                                { name: "AI Assist", href: "ChatBot" },
                                { name: "Live Consult", href: "webrtc" },
                                { name: "My Meds", href: "mymeds" }
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-100/30 hover:text-blue-600 transition-all duration-200"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Auth buttons on the right */}
                    <div className="flex items-center space-x-2">
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-white/80 border border-blue-200 rounded-lg hover:bg-blue-50 hover:shadow-sm transition-all duration-200">
                            Login
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow-sm hover:from-blue-600 hover:to-green-600 hover:shadow-md transition-all duration-200">
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
