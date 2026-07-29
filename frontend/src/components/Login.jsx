import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { INPUTWRAPPER, BUTTON_CLASSES } from "../assets/dummy";
import axios from "axios";
import { toast } from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";


const INITIAL_FORM = { email: "", password: "" };
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

const Login = ({ onSubmit, onSwitchMode }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);

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

        setLoading(true);
        try {
            const { data } = await await axios.post(
                `${API_URL}/api/user/login`,
                {
                    email: form.email,
                    password: form.password,
                },
                {
                    timeout: 10000,
                }
            );

            // If backend sends a failure status or missing data
            if (!data?.token || !data?.user) {
                throw new Error(data?.message || "Invalid credentials");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.user._id);

            setForm(INITIAL_FORM);
            onSubmit?.({ user: data.user, token: data.token });

            toast.success("Login successful!");
            navigate("/");

        } catch (err) {
            // ✅ Correctly capture and display the error message
            const errorMessage = err.response?.data?.message || err.message || "Unable to sign in. Please try again.";
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
                `${API_URL}/api/user/login`,
                {
                    email: form.email,
                    password: form.password,
                },
                {
                    timeout: 10000,
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

            toast.success("Welcome! Google login successful.");

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
        <div className="w-full max-w-md bg-white rounded-3xl border border-purple-100 shadow-2xl p-8">

            <div className="mb-8 text-center">

                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-300/50">
                    <LogIn className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Welcome Back
                </h2>

                <p className="mt-2 text-gray-500">
                    Sign in to continue to{" "}
                    <span className="font-semibold text-purple-600">
                        DevTasks
                    </span>
                </p>

            </div>

            {loginError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                    {loginError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

                {fields.map(({ name, type, placeholder, icon: Icon, isPassword }) => (
                    <div key={name} className={INPUTWRAPPER}>
                        <Icon className="w-5 h-5 text-purple-500 mr-2" />

                        <input
                            type={isPassword && showPassword ? "text" : type}
                            autoComplete={
                                name === "email"
                                    ? "email"
                                    : "current-password"
                            }
                            placeholder={placeholder}
                            value={form[name]}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    [name]: e.target.value,
                                })
                            }
                            className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                            required
                        />

                        {isPassword && (
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="ml-2 text-gray-500 hover:text-purple-500 transition"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        )}
                    </div>
                ))}

                <Link
                    to="/forgot-password"
                    className="block text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                    Forgot Password?
                </Link>

                <button
                    type="submit"
                    className={BUTTON_CLASSES}
                    disabled={loading}
                >
                    {loading ? (
                        "Logging in..."
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <LogIn className="w-4 h-4" />
                            Login
                        </div>
                    )}
                </button>

                <div className="flex items-center my-5">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="px-4 text-sm text-gray-400">OR</span>
                    <div className="flex-1 border-t border-gray-200" />
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        oonError={() =>
                            toast.error("Google sign-in was cancelled or failed.")
                        }
                    />
                </div>

            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitchMode}
                    className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition"
                >
                    Sign up
                </button>
            </p>

        </div>
    );
};

export default Login;