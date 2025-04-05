"use client";
import { useEffect, useRef, useCallback } from "react";
import Daily, { DailyCall } from "@daily-co/daily-js";

// Define props interface for TypeScript
interface VideoCallProps {
  roomUrl: string;
  onParticipantChange: (count: number) => void;
}

export default function VideoCall({ roomUrl, onParticipantChange }: VideoCallProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<DailyCall | null>(null);

  // Memoize participant update handler
  const handleParticipantUpdate = useCallback(() => {
    if (!callObjectRef.current) return;
    const participants = callObjectRef.current.participants();
    const participantCount = Object.keys(participants).length;
    onParticipantChange(participantCount);
  }, [onParticipantChange]);

  useEffect(() => {
    if (!roomUrl || !videoRef.current) return;

    // Initialize Daily call object
    const callObject = Daily.createCallObject({
      videoSource: true, // Enable video
      audioSource: true, // Enable audio
    });
    callObjectRef.current = callObject;

    // Join the room
    callObject
      .join({ url: roomUrl })
      .then(() => {
        console.log("Joined room successfully:", roomUrl);
      })
      .catch((error) => {
        console.error("Failed to join room:", error);
      });

    // Handle participant events
    callObject.on("participant-joined", handleParticipantUpdate);
    callObject.on("participant-updated", handleParticipantUpdate);
    callObject.on("participant-left", handleParticipantUpdate);

    // Handle errors
    callObject.on("error", (error) => {
      console.error("Daily.co error:", error);
    });

    // Render local participant's video
    const localParticipant = callObject.participants().local;
    if (localParticipant && videoRef.current) {
      const videoElement = document.createElement("video");
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.srcObject = localParticipant.videoTrack
        ? new MediaStream([localParticipant.videoTrack])
        : null;
      videoRef.current.appendChild(videoElement);
    }

    // Cleanup on unmount
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.destroy();
        callObjectRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.innerHTML = ""; // Clear video elements
      }
    };
  }, [roomUrl, handleParticipantUpdate]);

  return (
    <div className="relative w-full h-96 bg-black">
      <div ref={videoRef} className="w-full h-full" />
    </div>
  );
}