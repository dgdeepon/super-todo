"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, Calendar, AlertCircle } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Task,
  TaskPriority,
  TaskStatus,
  CreateTaskPayload,
  EditTaskPayload,
} from "@/types/tasks.types";
import { useCreateTaskMutation, useEditTaskMutation } from "@/queries/tasks.queries";
import { DateHelper } from "@/utils/date.helper";

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  taskToEdit?: Task | null;
}

export default function TaskDrawer({
  isOpen,
  onClose,
  selectedDate,
  taskToEdit,
}: TaskDrawerProps) {
  const isEditing = !!taskToEdit;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState("09:00");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("in_progress");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);

  const createTaskMutation = useCreateTaskMutation();
  const editTaskMutation = useEditTaskMutation();

  const isPending =
    createTaskMutation.isPending || editTaskMutation.isPending;

  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");

  useEffect(() => {
    const { monday, sunday } = DateHelper.getCurrentWeekRange();
    setMinDate(DateHelper.toDateString(monday));
    setMaxDate(DateHelper.toDateString(sunday));
  }, []);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      // Format date string from task (handles ISO string or YYYY-MM-DD)
      const formattedDate = taskToEdit.date
        ? String(taskToEdit.date).split("T")[0]
        : selectedDate;
      setDate(formattedDate);
      setTime(taskToEdit.time ? taskToEdit.time.slice(0, 5) : "09:00");
      setPriority(taskToEdit.priority || "medium");
      setStatus(taskToEdit.status || "in_progress");
    } else {
      setTitle("");
      setDescription("");
      setDate(selectedDate);
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setPriority("medium");
      setStatus("in_progress");
    }
    setErrorMessage(null);
  }, [taskToEdit, selectedDate, isOpen]);

  if (!isOpen) return null;

  const executeEditTask = () => {
    if (!taskToEdit) return;

    const payload: EditTaskPayload = {
      id: taskToEdit.id,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time,
      priority,
      status,
    };

    editTaskMutation.mutate(payload, {
      onSuccess: () => {
        setShowEditConfirmModal(false);
        onClose();
      },
      onError: (err: any) => {
        setShowEditConfirmModal(false);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update task.";
        setErrorMessage(msg);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Please enter a task title.");
      return;
    }

    if (!date) {
      setErrorMessage("Please select a date.");
      return;
    }

    if (!time) {
      setErrorMessage("Please enter a time.");
      return;
    }

    if (isEditing && taskToEdit) {
      setShowEditConfirmModal(true);
      return;
    }

    const payload: CreateTaskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time,
      priority,
      status,
    };

    createTaskMutation.mutate(payload, {
      onSuccess: () => {
        onClose();
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create task.";
        setErrorMessage(msg);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex justify-end items-end sm:items-stretch pointer-events-none">
        {/* Modal Sheet for Phone (slides from bottom) / Drawer for PC (slides from right) */}
        <div
          className="pointer-events-auto w-full sm:max-w-md bg-white shadow-2xl flex flex-col max-h-[92vh] sm:max-h-full sm:h-full animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 border-l border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing ? "Edit Task" : "Add New Task"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          >
            {errorMessage && (
              <div className="bg-red-50 p-3.5 border border-red-200 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-red-700 font-medium">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Task Title */}
            <div>
              <label
                htmlFor="task-title"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Task title
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Doing Homework"
                required
                className="w-full border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[#4566EC] focus:ring-2 focus:ring-[#4566EC]/20 focus:outline-none text-sm transition-all"
              />
            </div>

            {/* Set Time */}
            <div>
              <label
                htmlFor="task-time"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Set Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  id="task-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full border border-slate-200 pl-10 pr-4 py-3 text-slate-900 focus:border-[#4566EC] focus:ring-2 focus:ring-[#4566EC]/20 focus:outline-none text-sm transition-all"
                />
              </div>
            </div>

            {/* Set Date */}
            <div>
              <label
                htmlFor="task-date"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Set Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="task-date"
                  type="date"
                  value={date}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full border border-slate-200 pl-10 pr-4 py-3 text-slate-900 focus:border-[#4566EC] focus:ring-2 focus:ring-[#4566EC]/20 focus:outline-none text-sm transition-all"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Tasks can only be created within current week ({minDate} to {maxDate}).
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as TaskPriority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-3 text-xs font-medium capitalize border transition-all cursor-pointer ${
                        isSelected
                          ? p === "high"
                            ? "bg-red-50 border-red-500 text-red-700 font-semibold shadow-xs"
                            : p === "medium"
                            ? "bg-amber-50 border-amber-500 text-amber-700 font-semibold shadow-xs"
                            : "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold shadow-xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status (if editing) */}
            {isEditing && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["in_progress", "completed"] as TaskStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`py-2 px-3 text-xs font-medium border transition-all cursor-pointer ${
                        status === s
                          ? "bg-[#4566EC]/10 border-[#4566EC] text-[#4566EC] font-semibold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {s === "completed" ? "Completed" : "In Progress"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label
                htmlFor="task-description"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Description
              </label>
              <textarea
                id="task-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add Description"
                className="w-full border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[#4566EC] focus:ring-2 focus:ring-[#4566EC]/20 focus:outline-none text-sm transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                style={{ backgroundColor: "#4566EC" }}
                className="w-full py-3.5 px-4  text-white font-medium text-sm shadow-md shadow-[#4566EC]/25 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditing ? "Update task" : "Create task"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Edit Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEditConfirmModal}
        title="Update Task"
        message={`Are you sure you want to save the changes made to "${title}"?`}
        confirmText="Save Changes"
        cancelText="Cancel"
        variant="primary"
        isLoading={editTaskMutation.isPending}
        onConfirm={executeEditTask}
        onCancel={() => setShowEditConfirmModal(false)}
      />
    </div>
  );
}
