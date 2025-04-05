"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";

export default function VideoCall({ roomUrl }: { roomUrl: string }) {
    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const iframeContainerRef = useRef<HTMLDivElement>(null);
    const callRef = useRef<DailyCall | null>(null);
    const [hasJoined, setHasJoined] = useState(false);

    const getLocalVideoStream = (call: DailyCall): MediaStream | null => {
        const videoTrack = call.participants().local?.tracks?.video;
        if (videoTrack?.state === "playable" && videoTrack?.persistentTrack) {
            return new MediaStream([videoTrack.persistentTrack]);
        }
        return null;
    };

    useEffect(() => {
        const call = DailyIframe.createCallObject();
        callRef.current = call;

        call.startCamera().then(() => {
            const stream = getLocalVideoStream(call);
            if (stream && previewVideoRef.current) {
                previewVideoRef.current.srcObject = stream;
                previewVideoRef.current.play().catch(console.error);
            }
        });

        return () => {
            call.leave(); // leave any preview room/camera session
            call.destroy(); // clean up
        };
    }, []);

    const handleJoinCall = () => {
        // Cleanup preview
        callRef.current?.leave();
        callRef.current?.destroy();

        // Create iframe and join call
        const iframe = DailyIframe.createFrame(iframeContainerRef.current!, {
            showLeaveButton: true,
            iframeStyle: {
                width: "100%",
                height: "100%",
                border: "0",
                borderRadius: "1rem",
            },
            userName: "Guest",
            showFullscreenButton: true,
        });

        iframe.join({ url: roomUrl });
        setHasJoined(true);
    };

    return (
        <div className="w-full h-[75vh] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden p-4">
            {!hasJoined ? (
                <div className="flex flex-col justify-center items-center h-full gap-6">
                    <video
                        ref={previewVideoRef}
                        className="w-2/3 max-w-xl rounded-lg shadow-md"
                        muted
                        playsInline
                        autoPlay
                    />
                    <button
                        onClick={handleJoinCall}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl text-lg font-semibold transition"
                    >
                        Join the Call
                    </button>
                </div>
            ) : (
                <div ref={iframeContainerRef} className="w-full h-full" />
            )}
        </div>
    );
}
