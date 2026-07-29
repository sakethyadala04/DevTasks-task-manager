import React, { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { FIELDS, Inputwrapper, BUTTONCLASSES, MESSAGE_SUCCESS, MESSAGE_ERROR } from "../assets/dummy";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";




const API_URL = (
    import.meta.env.VITE_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");

const INITIAL_FORM = { name: '', email: '', password: '' };

const SignUp = ({ onSwitchMode }) => {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            await axios.post(`${API_URL}/api/user/register`, formData);

            setMessage({ text: "Registration successful! Please check your email to verify your account.", type: "success" });
            setFormData(INITIAL_FORM);

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 3000);

        } catch (err) {

            setMessage({ text: err.response?.data?.message || "Something went wrong. Please try again.", type: "error" });

        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl border border-purple-100 shadow-2xl p-8">

            <div className="mb-8 text-center">

                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-300/50">
                    <UserPlus className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Create Account
                </h2>

                <p className="mt-2 text-gray-500">
                    Join <span className="font-semibold text-purple-600">DevTasks</span> and switch life to <span className="font-semibold">Easy Mode</span>.
                </p>

            </div>

            {message.text && (
                <div className={message.type === "success" ? MESSAGE_SUCCESS : MESSAGE_ERROR}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

                {FIELDS.map(({ name, type, placeholder, icon: Icon }) => {
                    const isPassword = name === "password";

                    return (
                        <div key={name} className={Inputwrapper}>
                            <Icon className="w-5 h-5 text-purple-500 mr-2" />

                            <input
                                type={isPassword && showPassword ? "text" : type}
                                autoComplete={
                                    name === "name"
                                        ? "name"
                                        : name === "email"
                                            ? "email"
                                            : "new-password"
                                }
                                placeholder={placeholder}
                                value={formData[name]}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
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
                    );
                })}

                <div className="flex justify-start">
                    <Link
                        to="/resend-verification"
                        className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline transition"
                    >
                        Didn't receive verification email?
                    </Link>
                </div>

                <button
                    type="submit"
                    className={BUTTONCLASSES}
                    disabled={loading}
                >
                    {loading ? (
                        "Creating Account..."
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Sign Up
                        </div>
                    )}
                </button>

            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitchMode}
                    className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition"
                >
                    Login
                </button>
            </p>

        </div>

    )
}

export default SignUp;  