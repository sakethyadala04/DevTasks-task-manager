import React, { useCallback, useMemo, useState } from "react";
import {
    HomeIcon,
    Plus,
    Filter,
    CalendarIcon,
} from "lucide-react";
import {
    STATS,
    WRAPPER,
    HEADER,
    ADD_BUTTON,
    STATS_GRID,
    STAT_CARD,
    ICON_WRAPPER,
    VALUE_CLASS,
    LABEL_CLASS,
    FILTER_WRAPPER,
    FILTER_LABELS,
    SELECT_CLASSES,
    FILTER_OPTIONS,
    TABS_WRAPPER,
    TAB_BASE,
    TAB_ACTIVE,
    TAB_INACTIVE,
    EMPTY_STATE,
} from "../assets/dummy";
import { useOutletContext } from "react-router-dom";
import TaskItem from "../components/TaskItem.jsx";
import TaskModal from "../components/TaskModal.jsx";
import axios from "axios";

const API_BASE = "http://localhost:4000/api/tasks";

const Dashboard = () => {
    const { tasks = [], refreshTasks } = useOutletContext();
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filter, setFilter] = useState("all");

    /* ---------------- FILTER TASKS ---------------- */

    const filteredTasks = useMemo(() => {
        if (!tasks.length) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        return tasks.filter((task) => {
            const dueDate = task.duedate;
            if (!dueDate) return filter === "all";

            const taskDate = new Date(dueDate);
            taskDate.setHours(0, 0, 0, 0);

            switch (filter) {
                case "today":
                    return taskDate.getTime() === today.getTime();

                case "week":
                    return taskDate >= today && taskDate <= nextWeek;

                case "high":
                case "medium":
                case "low":
                    return task.priority?.toLowerCase() === filter;

                default:
                    return true;
            }
        });
    }, [tasks, filter]);

    /* ---------------- STATS ---------------- */

    const stats = useMemo(
        () => ({
            total: tasks.length,
            lowPriority: tasks.filter(
                (t) => t.priority?.toLowerCase() === "low"
            ).length,
            mediumPriority: tasks.filter(
                (t) => t.priority?.toLowerCase() === "medium"
            ).length,
            highPriority: tasks.filter(
                (t) => t.priority?.toLowerCase() === "high"
            ).length,
            completed: filteredTasks.filter(
                (t) =>
                    t.completed === true ||
                    t.completed === 1 ||
                    (typeof t.completed === "string" &&
                        t.completed.toLowerCase() === "yes")
            ).length,
        }),
        [tasks, filteredTasks]
    );

    /* ---------------- SAVE HANDLER ---------------- */

    const handleTaskSave = useCallback(
        async (taskData) => {
            try {
                if (taskData.id) {
                    await axios.put(
                        `${API_BASE}/${taskData.id}/op`,
                        taskData
                    );
                }
                refreshTasks();
                setShowModal(false);
                setSelectedTask(null);
            } catch (error) {
                console.error("Error saving task:", error);
            }
        },
        [refreshTasks]
    );

    return (
        <div className={WRAPPER}>
            {/* HEADER */}
            <div className={HEADER}>
                <div className="min-w-0">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <HomeIcon className="text-purple-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
                        <span className="truncate">Task Overview</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 ml-7 truncate">
                        Manage your tasks efficiently
                    </p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className={ADD_BUTTON}
                >
                    <Plus size={18} />
                    Add New Task
                </button>
            </div>

            {/* STATS */}
            <div className={STATS_GRID}>
                {STATS.map(
                    ({
                        key,
                        label,
                        icon: Icon,
                        iconColor,
                        borderColor = "border-purple-100",
                        valueKey,
                        textColor,
                        gradient,
                    }) => (
                        <div
                            key={key}
                            className={`${STAT_CARD} ${borderColor}`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`${ICON_WRAPPER} ${iconColor}`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p
                                        className={`${VALUE_CLASS} ${gradient
                                                ? "bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
                                                : textColor
                                            }`}
                                    >
                                        {stats[valueKey]}
                                    </p>
                                    <p className={LABEL_CLASS}>{label}</p>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* FILTER + TASKS */}
            <div className="space-y-6">
                <div className={FILTER_WRAPPER}>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-purple-500" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            {FILTER_LABELS[filter]} Tasks
                        </h2>
                    </div>

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={SELECT_CLASSES}
                    >
                        {FILTER_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </option>
                        ))}
                    </select>

                    <div className={TABS_WRAPPER}>
                        {FILTER_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setFilter(opt)}
                                className={`${TAB_BASE} ${filter === opt ? TAB_ACTIVE : TAB_INACTIVE
                                    }`}
                            >
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TASK LIST */}
                <div className="space-y-4">
                    {filteredTasks.length === 0 ? (
                        <div className={EMPTY_STATE.wrapper}>
                            <div className={EMPTY_STATE.iconWrapper}>
                                <CalendarIcon className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                No Tasks Found
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                {filter === "all"
                                    ? "Create your first task to get started"
                                    : "No tasks match this filter"}
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                className={EMPTY_STATE.btn}
                            >
                                Add New Task
                            </button>
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <TaskItem
                                key={task._id || task.id}
                                task={task}
                                onRefresh={refreshTasks}
                                showCompleteCheckbox
                                onEdit={() => {
                                    setSelectedTask(task);
                                    setShowModal(true);
                                }}
                            />
                        ))
                    )}
                </div>

                {/* DESKTOP ADD */}
                <div
                    onClick={() => setShowModal(true)}
                    className="hidden md:flex items-center justify-center p-4 border-2 border-dashed border-purple-200 rounded-xl hover:border-purple-400 bg-purple-50/50 cursor-pointer"
                >
                    <Plus className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="text-gray-600 font-medium">
                        Add new task to stay organized!
                    </span>
                </div>
            </div>

            {/* MODAL */}
            <TaskModal
                isOpen={showModal}
                taskToEdit={selectedTask}
                onClose={() => {
                    setShowModal(false);
                    setSelectedTask(null);
                }}
                onSave={handleTaskSave}
            />
        </div>
    );
};

export default Dashboard;