import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff } from "lucide-react";
import { INPUTWRAPPER, BUTTON_CLASSES } from "../assets/dummy";

const API_URL = (
    import.meta.env.VITE_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const [form, setForm] = useState({
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("Invalid password reset link.");
            return;
        }

        if (!form.password.trim()) {
            toast.error("Please enter a new password.");
            return;
        }

        if (!form.confirmPassword.trim()) {
            toast.error("Please confirm your password.");
            return;
        }

        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const { data } = await axios.post(
                `${API_URL}/api/user/reset-password`,
                {
                    token,
                    password: form.password,
                }
            );

            toast.success("Password reset successfully! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Failed to reset password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8">

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                    Reset Password
                </h2>

                <p className="text-gray-600 mt-2">
                    Create a new password for your account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* New Password */}

                <div className={INPUTWRAPPER}>
                    <Lock className="w-5 h-5 text-purple-500 mr-2" />

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={form.password}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                password: e.target.value,
                            })
                        }
                        className="w-full focus:outline-none text-sm text-gray-700"
                        required
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 text-gray-500 hover:text-purple-500"
                    >
                        {showPassword
                            ? <EyeOff className="w-5 h-5" />
                            : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Confirm Password */}

                <div className={INPUTWRAPPER}>
                    <Lock className="w-5 h-5 text-purple-500 mr-2" />

                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                confirmPassword: e.target.value,
                            })
                        }
                        className="w-full focus:outline-none text-sm text-gray-700"
                        required
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="ml-2 text-gray-500 hover:text-purple-500"
                    >
                        {showConfirmPassword
                            ? <EyeOff className="w-5 h-5" />
                            : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                <button
                    type="submit"
                    className={BUTTON_CLASSES}
                    disabled={loading}
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>

            </form>
        </div>
    );
};

export default ResetPassword;