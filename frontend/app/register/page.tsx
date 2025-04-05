"use client";
import "@/globals.css";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Update this to match your backend URL
const API_BASE_URL = "http://localhost:5000"; // Your Express.js backend URL

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? `${API_BASE_URL}/login` : `${API_BASE_URL}/register`;
      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        toast.success(isLogin ? "Login successful!" : "Registration successful!");
        router.push("/my-meds");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsLogin(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isLogin
                    ? "text-white bg-gradient-to-r from-blue-500 to-green-500"
                    : "text-blue-600 bg-white/80 border border-blue-200 hover:bg-blue-50"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  !isLogin
                    ? "text-white bg-gradient-to-r from-blue-500 to-green-500"
                    : "text-blue-600 bg-white/80 border border-blue-200 hover:bg-blue-50"
                }`}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Form */}
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-green-700">
                {isLogin ? "Welcome Back" : "Create Your Account"}
              </h2>
              <p className="text-blue-600 mt-2">
                {isLogin
                  ? "Sign in to manage your medications"
                  : "Join us to start tracking your health"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-green-700 mb-1"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-blue-50 text-blue-900 placeholder-blue-400"
                    placeholder="Enter your username"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-green-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-blue-50 text-blue-900 placeholder-blue-400"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-green-700 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-blue-50 text-blue-900 placeholder-blue-400"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg px-4 py-3 hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {loading
                  ? "Processing..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </button>

              <div className="text-center text-sm text-blue-600">
                {isLogin ? (
                  <p>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-green-600 font-medium hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-green-600 font-medium hover:underline"
                    >
                      Login here
                    </button>
                  </p>
                )}
              </div>
            </form>
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
}