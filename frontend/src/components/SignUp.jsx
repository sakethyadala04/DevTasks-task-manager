import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { FIELDS, Inputwrapper, BUTTONCLASSES, MESSAGE_SUCCESS, MESSAGE_ERROR } from "../assets/dummy";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const API_URL = "http://localhost:4000";
const INITIAL_FORM = { name: '', email: '', password: '' };

const SignUp = ({ onSwitchMode }) => {
    const [formData, setFormData] = React.useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const { data } = await axios.post(`${API_URL}/api/user/register`, formData);
            console.log("SignUp Successful", data)
            setMessage({ text: "Account created successfully! Redirecting to login...", type: "success" });
            setFormData(INITIAL_FORM);

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);

        } catch (err) {
            console.log("SignUp Error: ", err);
            setMessage({ text: err.response?.data?.message || "Something went wrong. Please try again.", type: "error" });

        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className=' max-w-md w-full bg-white p-8 border-purple-100 rounded-xl shadow-lg'>
            <div className=' mb-0 text-center '>
                <div className=' w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 mx-auto
            rounded-full flex items-center justify-center mb-4 shadow-lg '>
                    <UserPlus className=' w-8 h-8 text-white  ' />
                </div>
                <h2 className=' text-2xl font-bold text-center mb-2 text-gray-800'>Create Account</h2>
                <p className=' text-gray-500 text-sm mt-1 mb-4 '>Join DevTasks to switch life to EASY MODE</p>

                {message.text && (
                    <div className={message.type === 'success' ? MESSAGE_SUCCESS : MESSAGE_ERROR}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className=' space-y-4 '>
                    {FIELDS.map(({ name, type, placeholder, icon: Icon }) => (

                        <div key={name} className={Inputwrapper}>
                            <Icon className=' w-5 h-5 text-purple-500 mr-2 ' />

                            <input type={type} placeholder={placeholder} value={formData[name]}
                                onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                                className=' w-full focus:outline-none text-sm text-gray-700 ' required />
                        </div>

                    ))}

                    <button type="submit" className={BUTTONCLASSES} disabled={loading}>
                        {loading ? 'Creating Account...' : <><UserPlus className=' w-4 h-4  ' />Sign Up</>}
                    </button>
                </form>

                <p className=' text-center text-sm text-gray-500 mt-6 '>
                    Already have an account?{' '}
                    <button type='button' onClick={onSwitchMode} className=' text-purple-500 hover:text-purple-700 
                            hover:underline font-medium transition-colors duration-300 '>
                        Login
                    </button>
                </p>
            </div>
        </div>

    )
}

export default SignUp;  