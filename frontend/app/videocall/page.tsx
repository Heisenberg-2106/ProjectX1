"use client";

import "@/globals.css";
import { useEffect, useState } from "react";
import VideoCall from "@/components/VideoCall";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VideoCallPage() {
    const [roomUrl, setRoomUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [callStatus, setCallStatus] = useState("connecting");
    const [participants, setParticipants] = useState(0);

    useEffect(() => {
        const createRoom = async () => {
            try {
                const res = await fetch("/api/create-room", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                
                if (!res.ok) throw new Error("Failed to create room");
                
                const data = await res.json();
                setRoomUrl(data.url);
                toast.success("Secure room created successfully!");
            } catch (error) {
                console.error("Room creation error:", error);
                toast.error("Failed to create consultation room");
                setCallStatus("error");
            } finally {
                setIsLoading(false);
            }
        };

        createRoom();
    }, []);

    const handleParticipantChange = (count: number) => {
        setParticipants(count);
        setCallStatus(count > 1 ? "active" : "waiting");
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
            <Navbar />
            
            <main className="flex-1 p-4 md:p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Secure Video Consultation
                        </h1>
                        <p className="text-sm text-gray-600 mt-2">
                            Private, encrypted connection with your healthcare provider
                        </p>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-blue-100">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-b border-blue-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className={`h-3 w-3 rounded-full ${
                                        callStatus === "active" ? "bg-green-500 animate-pulse" :
                                        callStatus === "error" ? "bg-red-500" : "bg-yellow-500"
                                    }`}></div>
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                        {callStatus === "active" ? "Consultation in progress" :
                                         callStatus === "error" ? "Connection error" :
                                         "Waiting for doctor"}
                                    </span>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {participants} {participants === 1 ? "participant" : "participants"}
                                </span>
                            </div>
                        </div>
                        
                        {/* Main Video Area */}
                        <div className="relative">
                            {isLoading ? (
                                <div className="h-96 flex flex-col items-center justify-center space-y-3">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-500">Creating secure room...</p>
                                </div>
                            ) : roomUrl ? (
                                <VideoCall 
                                    roomUrl={roomUrl} 
                                    onParticipantChange={handleParticipantChange}
                                />
                            ) : (
                                <div className="h-96 flex flex-col items-center justify-center space-y-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-gray-700">Failed to initialize video call</p>
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Consultation Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                            <h3 className="font-medium text-green-700 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Secure Connection
                            </h3>
                            <p className="text-sm text-gray-600 mt-2">
                                This consultation is end-to-end encrypted and HIPAA compliant.
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                            <h3 className="font-medium text-green-700 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Privacy Protected
                            </h3>
                            <p className="text-sm text-gray-600 mt-2">
                                Your medical information remains confidential and is never stored.
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                            <h3 className="font-medium text-green-700 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Session Duration
                            </h3>
                            <p className="text-sm text-gray-600 mt-2">
                                This room will automatically close after 60 minutes of inactivity.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <ToastContainer
                position="bottom-right"
                toastClassName="bg-blue-50 text-blue-900 border border-blue-200"
                progressClassName="bg-gradient-to-r from-blue-400 to-green-400"
            />
        </div>
    );
}