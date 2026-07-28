import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { Calendar, CheckCircle2, Clock, MoreVertical } from 'lucide-react';
import { format, isToday } from 'date-fns';
import {
  getPriorityBadgeColor,
  getPriorityColor,
  MENU_OPTIONS,
  TI_CLASSES,
} from '../assets/dummy';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/tasks`;

const TaskItem = ({
  task,
  onRefresh,
  onLogout,
  showCompleteCheckbox = true,
  onEdit,
  onDelete,
  onPreview,
  onToggleComplete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const [subtasks, setSubTasks] = useState(task.subtasks || []);

  const menuRef = useRef(null);

  // const [isCompleted, setIsCompleted] = useState(
  //   [true, 1, 'yes'].includes(
  //     typeof task.isCompleted === 'string'
  //       ? task.isCompleted.toLowerCase()
  //       : task.isCompleted
  //   )
  // );

  const [isCompleted, setIsCompleted] = useState(Boolean(task.completed));

  useEffect(() => {
    setIsCompleted(Boolean(task.completed));
  }, [task.completed]);

  // useEffect(() => {
  //   setIsCompleted(
  //     [true, 1, 'yes'].includes(
  //       typeof task.isCompleted === 'string'
  //         ? task.isCompleted.toLowerCase()
  //         : task.isCompleted
  //     )
  //   );
  // }, [task.isCompleted]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token found');
    return { Authorization: `Bearer ${token}` };
  };

  const borderColor = isCompleted
    ? 'border-green-500'
    : getPriorityColor(task.priority).split(' ')[0];

  // const handleComplete = async () => {
  //   const newStatus = !isCompleted;

  //   try {
  //     await axios.put(
  //       `${API_BASE}/${task._id}`,
  //       { completed: newStatus },
  //       { headers: getAuthHeaders() }
  //     );

  //     setIsCompleted(newStatus);

  //     onRefresh?.();
  //   } catch (err) {
  //     if (err.response?.status === 401) onLogout?.();
  //   }
  // };

  const handleAction = (action) => {
    setShowMenu(false);

    if (action === "edit") {
      onEdit?.();
    }

    if (action === "delete") {
      handleDelete();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {

      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${task._id}`, {
        headers: getAuthHeaders(),
      });
      onRefresh?.();
    } catch (err) {
      if (err.response?.status === 401) onLogout?.();
    }
  };

  return (
    <>
      <div
        onClick={() => {
          setShowMenu(false);
          onPreview?.();
        }}
        className={`${TI_CLASSES.wrapper} ${borderColor} cursor-pointer p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
      >
        {/* Row 1 */}
        <div className="flex items-start justify-between gap-4">

          <div className="flex flex-1 gap-4 min-w-0">

            {showCompleteCheckbox && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(task);
                }}
                className={`
            mt-1
            ${TI_CLASSES.completeBtn}
            transition-colors duration-200
            ${isCompleted
                    ? "!text-green-500 hover:!text-green-500"
                    : "text-gray-300 hover:text-purple-500"
                  }
          `}
              >
                <CheckCircle2
                  size={20}
                  className={TI_CLASSES.checkboxIconBase}
                />
              </button>
            )}

            <div className="flex-1 min-w-0">

              {/* Title + Priority */}
              <div className="flex items-center gap-3 flex-wrap">

                <h3
                  className={`text-xl font-bold ${isCompleted
                    ? "line-through text-gray-400"
                    : "text-gray-900"
                    }`}
                >
                  {task.title}
                </h3>

                <span
                  className={`${getPriorityBadgeColor(
                    task.priority
                  )} px-3 py-1 rounded-full text-xs font-semibold`}
                >
                  {task.priority}
                </span>

              </div>

              {/* Description */}
              {task.description && (
                <p className="mt-3 text-gray-600 text-sm leading-6 line-clamp-2">
                  {task.description}
                </p>
              )}

            </div>
          </div>

          {/* Menu */}
          <div className="relative" ref={menuRef}>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(prev => !prev);
              }}
              className="p-2 rounded-lg hover:bg-purple-50 transition"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <div
                className={`${TI_CLASSES.menuDropdown}
                           origin-top-right
                           animate-in
                           fade-in
                           zoom-in-95
                           duration-10000000`}
              >
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(opt.action);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2"
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Row 2 */}
        <div className="flex items-center justify-between mt-5 text-sm">

          <div className="flex items-center gap-6 flex-wrap">

            <div
              className={`flex items-center gap-2 ${task.duedate && isToday(new Date(task.duedate))
                ? "text-purple-600 font-medium"
                : "text-gray-500"
                }`}
            >
              <Calendar size={16} />

              {task.duedate
                ? isToday(new Date(task.duedate))
                  ? "Today"
                  : format(new Date(task.duedate), "MMM dd")
                : "No Due Date"}
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={16} />

              {task.createdAt
                ? format(new Date(task.createdAt), "MMM dd")
                : "-"}
            </div>

          </div>

          <div className="text-purple-600 font-medium text-sm">
            View →
          </div>

        </div>
      </div>

    </>
  );
};

export default TaskItem;