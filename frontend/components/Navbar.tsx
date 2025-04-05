import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-gradient-to-t from-blue-200 to-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-start">
                <div className="flex flex-col">
                    <div className="text-lg font-medium text-gray-800">Project X</div>
                    <div className="mt-1 ml-[-4px] flex gap-6 text-green-600 text-md font-semibold px-30">
                        <Link href="#" className="hover:underline">Appointments</Link>
                        <Link href="#" className="hover:underline">AI Assist</Link>
                        <Link href="#" className="hover:underline">Live Consult</Link>
                        <Link href="#" className="hover:underline">My Meds</Link>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded shadow hover:bg-blue-600 transition">
                        Login
                    </button>
                    <button className="border border-blue-400 text-sm text-blue-500 px-4 py-1.5 rounded hover:bg-blue-50 transition">
                        Sign Up
                    </button>
                </div>
            </div>
        </nav>
    );
}
