"use client";

import { useState } from "react";
import axios from "axios";
import "@/globals.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");

  const send = async () => {
    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await axios.post("http://localhost:5000/chat", {
        message: input,
        history,
      });

      console.log("✅ Response:", res.data);

      setMessages([
        ...messages,
        { role: "user", content: input },
        { role: "assistant", content: res.data.reply },
      ]);

      setInput("");
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  const summarize = async () => {
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await axios.post("http://localhost:4000/summary", {
        message: "",
        history,
      });

      console.log("📝 Summary API response:", res.data);
      setSummary(res.data.summary);
      alert("Summary:\n\n" + res.data.summary);
    } catch (err) {
      console.error("❌ Error summarizing:", err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Medical Chatbot</h1>

      <div className="space-y-2 mb-4 flex flex-col">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[75%] p-3 rounded-xl shadow-sm text-sm ${
              msg.role === "user"
                ? "bg-blue-100 text-blue-900 self-end ml-auto"
                : "bg-green-100 text-green-900 self-start mr-auto"
            }`}
          >
            <strong className="capitalize block mb-1">{msg.role}</strong>
            {msg.content}
          </div>
        ))}
      </div>

      <input
        className="border p-2 w-full mb-2 rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe your symptoms..."
      />
      <div className="flex space-x-2">
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={send}>
          Send
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={summarize}>
          Summarize
        </button>
      </div>

      {summary && (
        <div className="mt-4 p-3 rounded-lg bg-yellow-100 text-yellow-800 text-sm">
          <h2 className="font-bold mb-1">Summary:</h2>
          {summary}
        </div>
      )}
    </div>
  );
}
