"use client";
import { useEffect, useRef, useState } from "react";
import socket from "@/components/signaling";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "@/globals.css";

const WebRTCVideoCall = ({ roomId }: { roomId: string }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        setConnectionStatus("Connecting");
        await initLocalStream();
        socket.emit("join-room", roomId);
      } catch (error) {
        console.error("Initialization failed:", error);
        setConnectionStatus("Failed to connect");
        setIsLoading(false);
        toast.error("Failed to initialize video call");
      }
    };

    initialize();

    socket.on("user-joined", async (userId) => {
      const pc = createPeerConnection(userId);
      pcRef.current = pc;

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { offer, to: userId });
      } catch (error) {
        console.error("Offer creation failed:", error);
        toast.error("Failed to establish connection");
      }
    });

    socket.on("offer", async ({ offer, from }) => {
      const pc = createPeerConnection(from);
      pcRef.current = pc;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { answer, to: from });
      } catch (error) {
        console.error("Answer creation failed:", error);
        toast.error("Failed to establish connection");
      }
    });

    socket.on("answer", async ({ answer }) => {
      try {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
        setConnectionStatus("Connected");
        setIsLoading(false);
        toast.success("Call connected successfully");
      } catch (error) {
        console.error("Answer processing failed:", error);
        toast.error("Failed to complete connection");
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("ICE candidate failed:", error);
      }
    });

    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      socket.emit("leave-room", roomId);
      socket.disconnect();
    };
  }, [roomId]);

  const initLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      localStreamRef.current = stream;
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to get media stream:", error);
      toast.error("Camera or microphone access denied");
      throw error;
    }
  };

  const createPeerConnection = (userId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { candidate: e.candidate, to: userId });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case "connected":
          setConnectionStatus("Connected");
          break;
        case "disconnected":
        case "failed":
          setConnectionStatus("Disconnected");
          toast.warn("Call disconnected");
          break;
        default:
          break;
      }
    };

    return pc;
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toast.info(audioTrack.enabled ? "Microphone unmuted" : "Microphone muted");
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        toast.info(videoTrack.enabled ? "Video turned on" : "Video turned off");
      }
    }
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    socket.emit("leave-room", roomId);
    setConnectionStatus("Disconnected");
    toast.info("Call ended");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            {/* Information Panel */}
            <div className="md:w-2/5 bg-gradient-to-b from-blue-50 to-green-50 p-8">
              <div className="sticky top-8">
                <h2 className="text-2xl font-bold text-blue-800 mb-6">Live Video Consultation</h2>
                <div className="space-y-5">
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                    <h3 className="font-semibold text-green-700 mb-2">Connection Status</h3>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        connectionStatus === "Connected" 
                          ? "bg-green-500 animate-pulse" 
                          : connectionStatus === "Connecting" 
                            ? "bg-yellow-500 animate-pulse" 
                            : "bg-red-500"
                      }`}></div>
                      <span className="text-blue-600">{connectionStatus}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                    <h3 className="font-semibold text-green-700 mb-2">Call Controls</h3>
                    <ul className="text-blue-600 text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        Mute/unmute your microphone
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        Turn video on/off
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        Secure end-to-end encrypted
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Section */}
            <div className="md:w-3/5 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  Video Consultation
                </h2>
                <p className="text-blue-600">Secure connection with your healthcare provider</p>
              </div>

              {/* Video Containers */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="relative flex-1 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl overflow-hidden shadow-md">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-48 md:h-64 object-cover ${isVideoOff ? 'hidden' : ''}`}
                  />
                  {isVideoOff && (
                    <div className="w-full h-48 md:h-64 flex items-center justify-center bg-blue-200">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-blue-300 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                        <p className="text-blue-700 font-medium">Your camera is off</p>
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    You
                  </span>
                </div>
                <div className="relative flex-1 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl overflow-hidden shadow-md">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-48 md:h-64 object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    Doctor
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4 flex-wrap justify-center">
                <button
                  onClick={toggleMute}
                  className={`px-6 py-3 rounded-full font-medium text-white transition-all shadow-md ${
                    isMuted 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  }`}
                >
                  <div className="flex items-center">
                    {isMuted ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                        </svg>
                        Unmute
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        </svg>
                        Mute
                      </>
                    )}
                  </div>
                </button>
                <button
                  onClick={toggleVideo}
                  className={`px-6 py-3 rounded-full font-medium text-white transition-all shadow-md ${
                    isVideoOff 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  }`}
                >
                  <div className="flex items-center">
                    {isVideoOff ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Turn Video On
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Turn Video Off
                      </>
                    )}
                  </div>
                </button>
                <button
                  onClick={endCall}
                  className="px-6 py-3 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-all shadow-md"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"></path>
                    </svg>
                    End Call
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        toastClassName="bg-blue-50 text-blue-900 border border-blue-200"
        progressClassName="bg-gradient-to-r from-blue-400 to-green-400"
      />
    </div>
  );
};

export default WebRTCVideoCall;