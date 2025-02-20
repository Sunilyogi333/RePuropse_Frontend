// LoginPage.js
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import OTPInput from "@/components/ui/otp";
import { apiRequest } from "../../middleware/errorInterceptor";
import { setAccessToken, setRefreshToken, setUserId } from "@/utils/tokens";
import { useSocket } from "../../contexts/SocketContext";
import { useUser } from "@/contexts/UserContext";

interface LoginPageProps {
  onClose: () => void;
}
import { useSelector, useDispatch } from "react-redux";


export default function LoginPage({ onClose }: LoginPageProps) {
  const { user, setUser } = useUser();
  const [serverError, setServerError] = useState("");
  const { socket, isConnected, setIsLoggedIn } = useSocket(); // Use setIsLoggedIn from context
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [role, setRole] = useState("");
  const [userID, setUserID] = useState("");
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (socket && isConnected && userID && role) {
      console.log("Socket connected:", socket.id);
      socket.emit("register", userID, role);
    }
  }, [socket, isConnected, userID, role]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      console.log("formData", formData);
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Login successful:", response);

      if (response.code === 403) {
        setUserID(response.data.id);
        setUserId(response.data.id);
        setShowOTPInput(true);
      }

      if (response.code === 200) {
        console.log("Token:", response.data.token);
        setUserID(response.data.id);
        setUserId(response.data.id);
        setRole(response.data.role);
        setAccessToken(response.data.token);
        setRefreshToken(response.data.refreshToken);
        console.log("User while login:", response.data);
        setUser(response.data);
        console.log("her vai user", user)

        // Set login status to true, which triggers socket connection
        setIsLoggedIn(true);
        router.push(`/${response.data.role}/dashboard/home`);
      }
    } catch (error: any) {
      setServerError(error.message)
      console.log("Error during login:", error);
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSignupRedirect = () => {
    router.push("/signup");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-2xl border border-gray-200 relative">
        <button onClick={onClose} className="absolute top-9 right-12 text-red-500 text-4xl hover:text-gray-700">
          &times;
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Login
        </h1>
        {serverError && <p className="text-sm text-center text-red-500">{serverError}</p>}
        {showOTPInput ? (
          <OTPInput userID={userID} />
        ) : (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={handleInput}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                onChange={handleInput}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
            <div className="flex justify-center items-center w-full">

              <Button className="px-6 py-4">Login</Button>
            </div>
          </form>
        )}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <button onClick={handleSignupRedirect} className="text-primary hover:underline">
              Signup
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
