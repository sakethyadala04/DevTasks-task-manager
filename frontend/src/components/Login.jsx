import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { INPUTWRAPPER, BUTTON_CLASSES } from "../assets/dummy";
import axios from "axios";
import { toast } from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

const INITIAL_FORM = { email: "", password: "" };
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

const Login = ({ onSubmit, onSwitchMode }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [rememberMe, setRememberMe] = useState(false);
    const [loginError, setLoginError] = useState("");

    const navigate = useNavigate();

    // ----- Auto-login if token exists -----
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        (async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/user/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (data?.success && data?.user) {
                    onSubmit?.({ user: data.user, token });
                    toast.success("Session restored, redirecting...");
                    navigate("/", { replace: true });
                } else {
                    localStorage.clear();
                }
            } catch {
                localStorage.clear();
            }
        })();
    }, [navigate, onSubmit]);

    // ----- Submit login -----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError(""); // Clear previous errors on new attempt

        if (!rememberMe) {
            toast.error("Please enable 'Remember Me' to login."); // ✅ Added toast for immediate feedback
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/user/login`, {
                email: form.email,
                password: form.password,
            });

            // If backend sends a failure status or missing data
            if (!data?.token || !data?.user) {
                throw new Error(data?.message || "Invalid credentials");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.user._id);

            setForm(INITIAL_FORM);
            onSubmit?.({ user: data.user, token: data.token });

            toast.success("Login successful! Redirecting...");
            setTimeout(() => navigate("/"), 1500);

        } catch (err) {
            // ✅ Correctly capture and display the error message
            const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
            setLoginError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        setLoading(true);
        setLoginError("");

        try {
            const { data } = await axios.post(
                `${API_URL}/api/user/google`,
                {
                    credential: credentialResponse.credential,
                }
            );

            if (!data?.token || !data?.user) {
                throw new Error(data?.message || "Google login failed");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.user.id);

            onSubmit?.({
                user: data.user,
                token: data.token,
            });

            toast.success("Google login successful!");

            navigate("/");

        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Google login failed.";

            setLoginError(errorMessage);
            toast.error(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { name: "email", type: "email", placeholder: "Email", icon: Mail },
        { name: "password", type: "password", placeholder: "Password", icon: Lock, isPassword: true },
    ];

    return (
        <div className="max-w-md bg-white w-full shadow-lg border border-purple-100 rounded-xl p-8">
            <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
                    <LogIn className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-600 mt-2">Login to your account</p>
            </div>

            {/* ✅ Added Visual Error Box */}
            {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center animate-pulse">
                    {loginError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map(({ name, type, placeholder, icon: Icon, isPassword }) => (
                    <div key={name} className={INPUTWRAPPER}>
                        <Icon className="w-5 h-5 text-purple-500 mr-2" />
                        <input
                            type={isPassword && showPassword ? "text" : type}
                            placeholder={placeholder}
                            value={form[name]}
                            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                            className="w-full focus:outline-none text-sm text-gray-700"
                            required
                        />
                        {isPassword && (
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="ml-2 text-gray-500 hover:text-purple-500 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                ))}

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        required
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded cursor-pointer"
                    />
                    <label
                        htmlFor="rememberMe"
                        className="ml-2 block text-sm text-gray-700 cursor-pointer"
                    >
                        Remember Me
                    </label>
                </div>

                <button type="submit" className={BUTTON_CLASSES} disabled={loading}>
                    {loading ? "Logging in..." : (
                        <div className="flex items-center justify-center gap-2">
                            <LogIn className="w-4 h-4" />
                            Login
                        </div>
                    )}
                </button>

                <div className="my-4 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-3 text-sm text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => {
                            toast.error("Google Login Failed");
                        }}
                    />
                </div>

            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitchMode}
                    className="text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors"
                >
                    Sign up
                </button>
            </p>
        </div>
    );
};

export default Login;