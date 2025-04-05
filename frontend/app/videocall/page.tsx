"use client";

import "@/app/globals.css";
import { useEffect, useState } from "react";
import VideoCall from "@/app/components/VideoCall";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function VideoCallPage() {
    const [roomUrl, setRoomUrl] = useState("");

    useEffect(() => {
        fetch("/api/create-room", {
            method: "POST"
        })
            .then((res) => res.json())
            .then((data) => setRoomUrl(data.url));
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-950 text-white p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-indigo-400">Secure Consultation Room</h1>
                        <p className="text-sm text-gray-400">Powered by Daily.co video calling</p>
                    </div>

                    {roomUrl ? (
                        <VideoCall roomUrl={roomUrl} />
                    ) : (
                        <div className="text-center text-gray-400 animate-pulse mt-10">Creating secure room...</div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
