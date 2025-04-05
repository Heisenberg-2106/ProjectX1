export default function Hero() {
    return (
        <section className="bg-gradient-to-r from-blue-100 to-green-50">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                    Revolutionizing Healthcare, One Click at a Time
                    </h1>
                    <p className="text-gray-600 mb-6 text-lg">
                    Get instant access to trusted doctors, smart AI-powered diagnostics, and seamless virtual consultations — anytime, anywhere. Because your health deserves the smartest care.
                    </p>
                    <button className="bg-green-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-green-600 transition ">
                        Check Up
                    </button>
                </div>
                <img
                    src="https://fjgxctoauhzstfgzhtdl.supabase.co/storage/v1/object/sign/home/output.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJob21lL291dHB1dC5qcGciLCJpYXQiOjE3NDM4NTA3NjQsImV4cCI6MTc3NTM4Njc2NH0.kZ2awxO382_Uf4Z9qdG5Dxw_G3kLHdsvQB1hOAQNtC8"
                    alt="Hospital"
                    className="rounded-lg shadow-xl"
                />
            </div>
        </section>
    );
}