import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle2, Clock, MoreVertical } from 'lucide-react';
import { format, isToday } from 'date-fns';
import {
  getPriorityBadgeColor,
  getPriorityColor,
  MENU_OPTIONS,
  TI_CLASSES,
} from '../assets/dummy';
import TaskMoodal from './TaskModal';

const API_BASE = 'http://localhost:4000/api/tasks';

const TaskItem = ({
  task,
  onRefresh,
  onLogout,
  showCompleteCheckbox = true,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [subtasks, setSubTasks] = useState(task.subtasks || []);

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

  const handleComplete = async () => {
    const newStatus = !isCompleted;

    try {
      await axios.put(
        `${API_BASE}/${task._id}/op`,
        { completed: newStatus },
        { headers: getAuthHeaders() }
      );

      setIsCompleted(newStatus);

      onRefresh?.();
    } catch (err) {
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === 'edit') setShowEditModal(true);
    if (action === 'delete') handleDelete();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${task._id}/op`, {
        headers: getAuthHeaders(),
      });
      onRefresh?.();
    } catch (err) {
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleSave = async (updatedTask) => {
    try {
      const payload = (({ title, description, priority, duedate, completed }) =>
        ({ title, description, priority, duedate, completed }))(updatedTask)
      await axios.put(`${API_BASE}/${task._id}/op`, payload, {
        headers: getAuthHeaders(),
      })
      setShowEditModal(false);
      onRefresh?.();
    } catch (err) {
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const progress = subtasks.length ? (subtasks.filter(st => st.completed).length / subtasks.length) * 100 : 0;

  const dueDate = task.duedate ? new Date(task.duedate) : null;

  return (
    <>
      <div className={`${TI_CLASSES.wrapper} ${borderColor}`}>
        <div className={TI_CLASSES.leftContainer}>
          {showCompleteCheckbox && (
            <button
              onClick={handleComplete}
              className={`
    ${TI_CLASSES.completeBtn}
    transition-colors duration-200
    ${isCompleted
                  ? '!text-green-500 hover:!text-green-500'
                  : 'text-gray-300 hover:text-purple-500'
                }
  `}
            >
              <CheckCircle2
                size={18}
                className={TI_CLASSES.checkboxIconBase}
              />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <h3
                className={`${TI_CLASSES.titleBase} ${isCompleted
                  ? 'text-gray-400 line-through'
                  : 'text-gray-800'
                  }`}
              >
                {task.title}
              </h3>

              <span
                className={`${TI_CLASSES.priorityBadge} ${getPriorityBadgeColor(
                  task.priority
                )}`}
              >
                {task.priority || 'No Priority'}
              </span>
            </div>

            {task.description && (
              <p className={TI_CLASSES.description}>{task.description}</p>
            )}
          </div>
        </div>

        <div className={TI_CLASSES.rightContainer}>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={TI_CLASSES.menuButton}
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className={TI_CLASSES.menuDropdown}>
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => handleAction(opt.action)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2"
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div
              className={`${TI_CLASSES.dateRow} ${task.duedate && isToday(new Date(task.duedate))
                ? 'text-purple-500'
                : 'text-gray-500'
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {task.duedate
                ? isToday(new Date(task.duedate))
                  ? 'Today'
                  : format(new Date(task.duedate), 'MMM dd')
                : '-'}
            </div>

            <div className={TI_CLASSES.createdRow}>
              <Clock className="w-3.5 h-3.5" />
              {task.createdAt
                ? `Created ${format(new Date(task.createdAt), 'MMM dd')}`
                : 'No date'}
            </div>
          </div>
        </div>
      </div>
      <TaskMoodal isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        taskToEdit={task}
        onSave={handleSave} />
    </>
  );
};

export default TaskItem;