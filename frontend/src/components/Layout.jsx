import React, { useState, useCallback, useEffect, useMemo } from "react";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx"
import { Outlet } from "react-router-dom";
import axios from "axios";
import { Zap, Circle, Clock, TrendingUp } from "lucide-react";

const Layout = ({ onLogout, user, children }) => {

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const { data } = await axios.get('http://localhost:4000/api/tasks/op', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            //    console.log("Backend Response:", data); // 👈 CHECK THIS IN YOUR BROWSER CONSOLE

            const array = Array.isArray(data) ? data :
                          Array.isArray(data?.tasks) ? data.tasks :
                          Array.isArray(data?.data) ? data.data : [];
            setTasks(array);
        } catch (error) {
            console.error(error);
            setError(error.message || "could not load task");
            if (error.response && error.response.status === 401) {
                onLogout();
            }
        } finally {
            setLoading(false);
        }
    }, [onLogout]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const stats = useMemo(() => {
        const completedTasks = tasks.filter(t =>
            t.completed === true ||
            t.completed === 1 ||
            (typeof t.completed === 'string' && t.completed.toLowerCase() === 'yes')
        ).length

        const totalCount = tasks.length
        const pendingCount = totalCount - completedTasks;
        const completedPercentage = totalCount ? Math.round((completedTasks / totalCount) * 100) : 0;

        return {
            totalCount,
            completedTasks,
            pendingCount,
            completedPercentage
        };
    }, [tasks]);

    const StatCard = ({ title, value, icon }) => (
        <div className=' p-2 sm:p-3 bg-white shadow-sm rounded-xl border-purple-100 hover:shadow-md 
        transition-all duration-300 hover:border-purple-100 group '>
            <div className=' flex items-center gap-2 '>
                <div className=' p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 group-hover:from-blue-500/20 
                group-hover:via-purple-500/20 group-hover:to-blue-500/20 '>
                    {icon}
                </div>
                <div>
                    <p className=' text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600
                    bg-clip-text text-transparent '>
                        {value}
                    </p>
                    <p className=' text-sm text-gray-500 font-medium  '>{title}</p>
                </div>
            </div>
        </div>
    )

    // Loading 
    if (loading)
        return (
            <div className=' min-h-screen bg-gray-50 flex items-center justify-center '>
                <div className=' animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500' />
            </div>
        )
    // Error
    if (error)
        return (
            <div className=' min-h-screen bg-gray-50 p-6 flex items-center justify-center '>
                <div className=' bg-red-50 text-red-600 p-4 rounded-xl border-red-100 max-w-md  '>
                    <p className=' font-medium mb-2 '> Error loading task</p>
                    <p className='text-sm'> {error} </p>
                    <button onClick={fetchTasks} className=' mt-4 py-2 px-4 bg-red text-red-700 rounded-lg
                  text-sm font-md hover:bg-red-200 transition-colors '>
                        Try Again
                    </button>
                </div>
            </div>
        )

    return (

        <div className=' min-h-screen bg-gray-50 '>
            <Navbar user={user} onLogout={onLogout} />
            <Sidebar user={user} task={tasks} />

            <div className=' ml-0 xl:ml-64 lg:ml-64 md:ml-16 pt-16 p-3 sm:p-4 md:p-4 transition-all duration-300' >
                <div className=' grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 '>
                    <div className=' xl:col-span-2 '>
                        <Outlet context={{ tasks, refreshTasks: fetchTasks }} />
                    </div>

                    <div className=' xl:col-span-1 space-y-3 '>
                        <div className=' bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-purple-100 '> {/* Reduced padding */}
                            <h3 className=' text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-gray-800 flex items-center gap-2 '>
                                <TrendingUp className=' w-5 h-4 text-purple-500 ' />
                                Task Statistics
                            </h3>
                            <div className=' grid grid-cols-2 gap-2 sm:gap-3 mb-3 '>
                                <StatCard title='Total Tasks' value={stats.totalCount}
                                    icon={<Circle className=' w-3.5 h-3.5 text-purple-500 ' />} />
                                <StatCard title='Completed' value={stats.completedTasks}
                                    icon={<Circle className=' w-3.5 h-3.5 text-green-500 ' />} />
                                <StatCard title='Pending' value={stats.pendingCount}
                                    icon={<Circle className=' w-3.5 h-3.5 text-blue-500 ' />} />
                                <StatCard title='Completion Rate' value={`${stats.completedPercentage}%`}
                                    icon={<Zap className=' w-3.5 h-3.5 text-purple-500 ' />} />
                            </div>

                            <hr className=' my-2 border-purple-100 ' />
                            <div className=' space-y-2 sm:space-y-3 '>
                                <div className=' flex items-center justify-between text-gray-700 '>
                                    <span className=' text-xs sm:text-sm font-semibold font-md flex items-center gap-1.5 '>
                                        <Circle className=' w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-500 fill-purple-500 ' />
                                        Task Progress
                                    </span>
                                    <span className=' text-xs bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 sm:px-2
                                rounded-full '>
                                        {stats.completedTasks}/ {stats.totalCount}

                                    </span>
                                </div>

                                <div className=' relative pt-1 '>
                                    <div className=' flex gap-1.5 h-3 items-center'>
                                        <div className=' flex-1 h-2 sm:h-3 bg-purple-100 rounded-full overflow-hidden '>
                                            <div className=' h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 '
                                                style={{ width: `${stats.completedPercentage}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className=' bg-white  rounded-xl p-4 sm:p-5 shadow-sm border border-purple-100 '>
                            <h3 className=' text-base sm:text-lg font-semibold mb-3 sm:mb-4 
                    text-gray-800 flex items-center gap-2 '>
                                <Clock className=' w-4 h-4 sm:w-5 sm:h-5 text-purple-500 ' />
                                Recent Activity
                            </h3>
                            <div className=' space-y-2 sm:y-3  '>
                                {tasks.slice(0, 3).map((task) => (
                                    <div key={task._id || task.id} className=' flex items-center justify-between 
                            p-2 sm:p-3 hover:bg-purple-50/50 rounded-lg transition-colors duration-200
                            border border-transparent hover:border-purple-100 '>
                                        <div className=' flex-1 min-w-0 '>
                                            <p className=' text-sm font-medium text-gray-700 break-words whitespace-normal '>
                                                {task.title}
                                            </p>
                                            <p className=' text-xm text-gray-500 mt-0.5'>
                                                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Unknown date'}
                                            </p>
                                        </div>
                                        <span className={` px-2 py-1 text-xs rounded-full shrink-0 ml-2 
                                    ${task.completed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {task.completed ? 'Done' : 'Pending'}
                                        </span>
                                    </div>
                                ))}

                                {tasks.length === 0 && (
                                    <div className=' text-center py-3 sm:py-4 px-2 '>
                                        <div className=' w-12 h-12 sm:w-16 sm:h-16 mx-auto sm:mb-4 rounded-full
                                bg-purple-100 flex items-center justify-center '>
                                            <Clock className=' w-6 h-6 sm:w-8 sm:h-8 text-purple-500 ' />
                                        </div>
                                        <p className=' text-sm text-gray-500 '>
                                            No recent activity
                                        </p>
                                        <p className=' text-xm text-gray-400 mt-4 '>
                                            task will apper here
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Layout;