"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/globals.css";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ChatSession = {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("chatSessions");
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSession(parsed[0].id);
        setMessages(parsed[0].messages);
      }
    }
  }, []);

  // Save sessions to localStorage when they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("chatSessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  const generateSessionName = async (messages: Message[]) => {
    try {
      const res = await axios.post("http://localhost:5000/chat", {
        message: "Generate a short, descriptive title (3-5 words) for this medical conversation based on the following messages:",
        history: messages.slice(0, 3).map(m => ({ role: m.role, content: m.content }))
      });
      return res.data.reply.replace(/"/g, '').trim();
    } catch (err) {
      console.error("Error generating session name:", err);
      return `Medical Chat - ${new Date().toLocaleDateString()}`;
    }
  };

  const createNewSession = async () => {
    const newSession = {
      id: Date.now().toString(),
      name: "New Conversation",
      messages: [],
      createdAt: new Date()
    };
    setSessions([newSession, ...sessions]);
    setActiveSession(newSession.id);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    const userMessage = {
      role: "user" as const,
      content: input,
      timestamp: new Date()
    };

    try {
      // Add user message immediately
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");

      // Get AI response
      const history = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await axios.post("http://localhost:5000/chat", {
        message: input,
        history,
      });

      const aiMessage = {
        role: "assistant" as const,
        content: res.data.reply,
        timestamp: new Date()
      };

      // Update messages and current session
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // Update or create session
      if (activeSession) {
        const updatedSessions = sessions.map(session => 
          session.id === activeSession 
            ? { ...session, messages: finalMessages } 
            : session
        );
        setSessions(updatedSessions);
      } else {
        const sessionName = await generateSessionName(finalMessages);
        const newSession = {
          id: Date.now().toString(),
          name: sessionName,
          messages: finalMessages,
          createdAt: new Date()
        };
        setSessions([newSession, ...sessions]);
        setActiveSession(newSession.id);
      }

    } catch (err) {
      toast.error("Failed to send message");
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const summarizeConversation = async () => {
    if (messages.length === 0) return;
    
    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await axios.post("http://localhost:5000/summary", {
        message: "Summarize this medical conversation for a doctor's review.",
        history,
      });

      setSummary(res.data.summary);
      
      // Update session name based on summary
      if (activeSession) {
        const updatedSessions = sessions.map(session => 
          session.id === activeSession 
            ? { ...session, name: `Summary: ${res.data.summary.substring(0, 30)}...` } 
            : session
        );
        setSessions(updatedSessions);
      }

      toast.success("Conversation summarized!");
    } catch (err) {
      toast.error("Failed to generate summary");
      console.error("Error summarizing:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-100 to-green-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HealthConnect
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Chat Sessions Sidebar */}
        <div className="bg-white rounded-xl shadow-md p-4 h-fit sticky top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-green-700">Conversations</h2>
            <button 
              onClick={createNewSession}
              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => {
                  setActiveSession(session.id);
                  setMessages(session.messages);
                }}
                className={`p-3 rounded-lg cursor-pointer transition ${activeSession === session.id 
                  ? "bg-gradient-to-r from-blue-100 to-green-100 border border-blue-200" 
                  : "hover:bg-gray-50"}`}
              >
                <h3 className="font-medium text-blue-800 truncate">{session.name}</h3>
                <p className="text-xs text-gray-500">
                  {session.messages.length} messages • {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No conversations yet. Start by sending a message.
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-green-700">
                {sessions.find(s => s.id === activeSession)?.name || "New Conversation"}
              </h2>
            </div>
            
            <div className="p-4 h-[500px] overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p>Describe your symptoms to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "bg-gradient-to-r from-green-100 to-green-50 border border-green-100 text-green-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block h-2 w-2 rounded-full ${
                          msg.role === "user" ? "bg-blue-200" : "bg-green-500"
                        }`}></span>
                        <strong className="text-xs font-medium capitalize">
                          {msg.role === "user" ? "You" : "Medical Assistant"}
                        </strong>
                        <span className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-blue-50 text-blue-900 placeholder-blue-400"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Describe your symptoms..."
                  disabled={isLoading}
                />
                <button 
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-1"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                      Send
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-3 flex justify-end">
                {/* <button 
                  onClick={summarizeConversation}
                  disabled={messages.length === 0}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-1 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Summarize Conversation
                </button> */}
              </div>
            </div>
          </div>

          {summary && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                <h2 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Conversation Summary
                </h2>
              </div>
              <div className="p-4 text-sm text-gray-700">
                {summary}
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        toastClassName="bg-blue-50 text-blue-900 border border-blue-200"
        progressClassName="bg-gradient-to-r from-blue-400 to-green-400"
      />
    </div>
  );
}