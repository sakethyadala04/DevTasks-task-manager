import React from "react";
import {
    X,
    Pin,
    FileText,
    CalendarDays,
    Clock3,
    CircleCheck,
    Circle,
    Flame,
} from "lucide-react";
import { format } from "date-fns";

const TaskPreviewModal = ({ isOpen, onClose, task, onEdit, onToggleComplete, }) => {
    if (!isOpen || !task) return null;

    const dueDate = task.duedate ? new Date(task.duedate) : null;

    const priorityColor = {
        High: "bg-red-100 text-red-700",
        Medium: "bg-orange-100 text-orange-700",
        Low: "bg-green-100 text-green-700",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-start justify-between p-7 border-b border-purple-100">
                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100">
                                <Pin className="w-6 h-6 text-purple-600" />
                            </div>

                            <div className="flex flex-col justify-center">
                                <h2 className="text-3xl font-bold tracking-tight leading-none text-gray-900">
                                    {task.title}
                                </h2>
                            </div>
                        </div>

                        {/* Status Chips */}
                        <div className="flex flex-wrap gap-3 mt-6">

                            <div
                                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm ${priorityColor[task.priority] || "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                🔥 {task.priority}
                            </div>

                            <div
                                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm ${task.completed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {task.completed ? (
                                    <>
                                        <CircleCheck size={16} />
                                        Completed
                                    </>
                                ) : (
                                    <>
                                        <Circle size={16} />
                                        Pending
                                    </>
                                )}
                            </div>

                            <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold shadow-sm flex items-center gap-2">
                                <CalendarDays size={16} />
                                {dueDate
                                    ? format(dueDate, "MMM dd, yyyy")
                                    : "No Due Date"}
                            </div>

                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Description */}
                <div className="p-6 border-b border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-gray-800">Description</h3>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-purple-50/30 border border-gray-200 p-5 max-h-56 overflow-y-auto">
                        <p className="text-gray-700 leading-7 whitespace-pre-wrap break-words">
                            {task.description || (
                                <span className="italic text-gray-400">
                                    No description added yet.
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Timeline */}
                <div className="grid md:grid-cols-3 gap-4 p-6 border-b border-purple-100">

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <CalendarDays className="w-4 h-4 text-purple-500" />
                            <p className="font-medium">Due Date</p>
                        </div>

                        <p className="text-gray-600">
                            {dueDate
                                ? format(dueDate, "MMM dd, yyyy")
                                : "No due date"}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Clock3 className="w-4 h-4 text-purple-500" />
                            <p className="font-medium">Created</p>
                        </div>

                        <p className="text-gray-600">
                            {task.createdAt
                                ? format(new Date(task.createdAt), "MMM dd, yyyy")
                                : "-"}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-purple-500" />
                            <p className="font-medium">Last Updated</p>
                        </div>

                        <p className="text-gray-600">
                            {task.updatedAt
                                ? format(new Date(task.updatedAt), "MMM dd, yyyy")
                                : "-"}
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6">

                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
                    >
                        Close
                    </button>

                    <button
                        onClick={() => {
                            onEdit();
                        }}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:shadow-lg transition"
                    >
                        Edit Task
                    </button>

                    <button
                        onClick={onToggleComplete}
                        disabled={task.completed}
                        className={`px-5 py-2 rounded-xl flex items-center gap-2 font-medium transition ${task.completed
                                ? "bg-green-100 text-green-700 border border-green-200 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
                            }`}
                    >
                        <CircleCheck className="w-4 h-4" />
                        {task.completed ? "Completed" : "Mark Complete"}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default TaskPreviewModal;