import React, { useEffect, useState } from 'react';
import { ChevronLeft, UserCircle, Save, Shield, Lock, LogOut, Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACK_BUTTON, DANGER_BTN, FULL_BUTTON, INPUTWRAPPER, personalFields, SECTION_WRAPPER, securityFields } from '../assets/dummy.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:4000';

const Profile = ({ setCurrentUser, onLogout }) => {
    // 1. Core State
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmpasssword: ''
    });

    // 2. Individual Visibility State (Using an object for independent toggles)
    const [showPasswords, setShowPasswords] = useState({});
    const navigate = useNavigate();

    // Fetch User Data on Load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        axios.get(`${API_URL}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(({ data }) => {
                if (data.success && data.user) {
                    setProfile({ name: data.user.name, email: data.user.email });
                } else {
                    toast.error(data.message);
                }
            })
            .catch(() => toast.error("Unable to load profile."));
    }, []);

    // Save Personal Information
    const saveProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            const { data } = await axios.put(
                `${API_URL}/api/user/profile`,
                { name: profile.name, email: profile.email },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success && data.user) {
                setCurrentUser((prev) => ({
                    ...prev,
                    name: profile.name,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=random`
                }));
                toast.success("Profile updated successfully.");
            } else {
                toast.error(data.message);
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Failed to update profile.");
        }
    };

    // Change Password Logic
    const changePassword = async (e) => {
        e.preventDefault();

        // 1. Debugging: Check exactly what is being sent
        console.log("Sending to backend:", {
            current: passwords.currentPassword,
            new: passwords.newPassword,
            confirm: passwords.confirmpasssword
        });

        // 2. Local Validation
        if (!passwords.newPassword || passwords.newPassword.length < 8) {
            return toast.error("New password must be at least 8 characters.");
        }

        if (passwords.newPassword !== passwords.confirmpasssword) {
            return toast.error("Passwords do not match.");
        }

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(`${API_URL}/api/user/password`,
                {
                    // Ensure these keys match exactly what your backend expects
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success("Password changed successfully.");
                setPasswords({ currentPassword: '', newPassword: '', confirmpasssword: '' });
                setShowPasswords({});
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            // If the backend returns an error, it will show here
            toast.error(err.response?.data?.message || "Failed to change Password.");
        }
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <ToastContainer position='top-center' autoClose={3000} />
            <div className='max-w-4xl mx-auto p-6'>
                {/* Back Button with History Fix */}
                <button onClick={() => navigate('/', { replace: true })} className={BACK_BUTTON}>
                    <ChevronLeft className='w-5 h-5 mr-1' />
                    Back to Dashboard
                </button>

                {/* Header Section */}
                <div className='flex items-center gap-4 mb-8'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-purple-600
                    flex items-center justify-center text-white text-2xl font-bold shadow-md'>
                        {profile.name ? profile.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-800'>Account Settings</h1>
                        <p className='text-gray-500 text-sm'>Manage your profile and security settings</p>
                    </div>
                </div>

                <div className='grid md:grid-cols-2 gap-8'>
                    {/* Personal Information Section */}
                    <section className={SECTION_WRAPPER}>
                        <div className='flex items-center gap-2 mb-6'>
                            <UserCircle className='text-purple-500 w-5 h-5' />
                            <h2 className='text-xl font-semibold text-gray-800'>Personal Information</h2>
                        </div>
                        <form onSubmit={saveProfile} className='space-y-4'>
                            {personalFields.map(({ name, type, placeholder, icon: Icon }) => (
                                <div key={name} className={INPUTWRAPPER}>
                                    <Icon className='w-5 h-5 text-purple-500 mr-2' />
                                    <input
                                        type={type}
                                        placeholder={placeholder}
                                        value={profile[name] || ''} // Safety fallback
                                        onChange={(e) => setProfile({ ...profile, [name]: e.target.value })}
                                        className='w-full focus:outline-none text-sm text-gray-700'
                                        required
                                    />
                                </div>
                            ))}
                            <button className={FULL_BUTTON} type="submit">
                                <Save className='w-4 h-4' /> Save Changes
                            </button>
                        </form>

                        <div className='mt-8 pt-6 border-t border-purple-100'></div>
                    </section>

                    {/* Security Settings Section */}
                    <section className={SECTION_WRAPPER}>
                        <div className='flex items-center gap-2 mb-6'>
                            <Shield className='text-purple-500 w-5 h-5' />
                            <h2 className='text-xl font-semibold text-gray-800'>Security Settings</h2>
                        </div>
                        <form onSubmit={changePassword} className='space-y-4'>
                            {securityFields.map(({ name, placeholder }) => (
                                <div key={name} className={`${INPUTWRAPPER} relative group`}>
                                    <Lock className='w-5 h-5 text-purple-500 mr-2' />
                                    <input
                                        // Independent visibility check
                                        type={showPasswords[name] ? "text" : "password"}
                                        placeholder={placeholder}
                                        value={passwords[name] || ''}
                                        onChange={(e) => setPasswords({ ...passwords, [name]: e.target.value })}
                                        className='w-full focus:outline-none text-sm text-gray-700 pr-10'
                                        required
                                    />
                                    <button
                                        type="button" // Prevents form submission
                                        onClick={() => setShowPasswords(prev => ({
                                            ...prev,
                                            [name]: !prev[name] // Toggle only this field
                                        }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                                    >
                                        {showPasswords[name] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            ))}
                            <button className={FULL_BUTTON} type="submit">
                                <Shield className='w-4 h-4' /> Change Password
                            </button>

                            {/* Danger Zone Section */}
                            <div className='mt-8 pt-6 border-t border-purple-100'>
                                <h3 className='text-red-600 font-semibold mb-4 flex items-center gap-2'>
                                    <LogOut className='w-4 h-4' /> Danger Zone
                                </h3>
                                <button type="button" className={DANGER_BTN} onClick={onLogout}>
                                    Logout Account
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Profile;