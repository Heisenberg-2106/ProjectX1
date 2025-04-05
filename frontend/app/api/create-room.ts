// pages/api/create-room.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const response = await fetch("https://api.daily.co/v1/room", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
        body: JSON.stringify({
            properties: {
                enable_chat: true,
                start_video_off: false,
                start_audio_off: false,
            },
        }),
    });

    const data = await response.json();
    res.status(200).json({ url: data.url });
}
