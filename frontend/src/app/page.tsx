"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Check,
  CheckSquare,
  XSquare,
  Clock,
  Calendar,
  LogOut,
  X,
  Filter,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useLogout } from "@/queries/auth.queries";
import {
  useTasksByDateQuery,
  useTasksCountSummaryQuery,
  useSearchTasksQuery,
  useWeeklyTasksQuery,
  useEditTaskMutation,
  useDeleteTaskMutation,
} from "@/queries/tasks.queries";
import { DateHelper, WeekDay } from "@/utils/date.helper";
import { Task, TaskPriority, TaskStatus } from "@/types/tasks.types";
import TaskDrawer from "@/components/TaskDrawer";
import ConfirmationModal from "@/components/ConfirmationModal";
import SwipeableTaskItem from "@/components/SwipeableTaskItem";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);
  const handleLogout = useLogout();

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated && !token) {
      router.push("/login");
    }
  }, [isAuthenticated, token, router]);

  // Client mount tracking to eliminate hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Week days (Monday to Sunday)
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [todayStr, setTodayStr] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const days = DateHelper.getCurrentWeekDays();
    const today = DateHelper.toDateString(new Date());
    setWeekDays(days);
    setTodayStr(today);
    setSelectedDate((prev) => prev || today);
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Drawer / Modal state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Custom confirmation modal states
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Queries
  const {
    data: dateTasksResponse,
    isLoading: isLoadingDateTasks,
  } = useTasksByDateQuery(selectedDate);

  const {
    data: countSummaryResponse,
    isLoading: isLoadingSummary,
  } = useTasksCountSummaryQuery();

  const isSearching = debouncedQuery.trim().length > 0;

  const {
    data: searchResponse,
    isLoading: isLoadingSearch,
  } = useSearchTasksQuery(debouncedQuery);

  // Weekly view state
  const [isWeeklyView, setIsWeeklyView] = useState(false);
  const [weeklyStatus, setWeeklyStatus] = useState<TaskStatus>("in_progress");

  const {
    data: weeklyTasksResponse,
    isLoading: isLoadingWeekly,
  } = useWeeklyTasksQuery(weeklyStatus);

  const weeklyGrouped = weeklyTasksResponse?.data?.groupedByDate || {};
  const weeklyDates = Object.keys(weeklyGrouped).sort();
  const totalWeeklyTasks = weeklyDates.reduce(
    (acc, date) => acc + (weeklyGrouped[date]?.length || 0),
    0
  );

  // Mutations
  const editTaskMutation = useEditTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const tasksList: Task[] = useMemo(() => {
    if (isSearching) {
      const data = searchResponse?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray((data as any)?.tasks)) return (data as any).tasks;
      return [];
    }
    const tasks = dateTasksResponse?.data?.tasks || [];
    // Sort tasks by time ascending
    return [...tasks].sort((a, b) => {
      const timeA = a.time || "";
      const timeB = b.time || "";
      return timeA.localeCompare(timeB);
    });
  }, [isSearching, searchResponse, dateTasksResponse]);

  // Summary counts
  const summary = countSummaryResponse?.data?.summary || {
    completed: 0,
    pending: 0,
    total: 0,
  };

  const progressPercentage =
    summary.total > 0
      ? Math.round((summary.completed / summary.total) * 100)
      : 0;

  // Selected day object
  const selectedDayObj = weekDays.find((d) => d.dateString === selectedDate);

  // Handlers
  const handleToggleTaskStatus = (task: Task) => {
    const newStatus =
      task.status === "completed" ? "in_progress" : "completed";
    editTaskMutation.mutate({
      id: task.id,
      status: newStatus,
    });
  };

  const handleDeleteTask = (task: Task, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTaskToDelete(task);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    deleteTaskMutation.mutate(
      { id: taskToDelete.id },
      {
        onSettled: () => {
          setTaskToDelete(null);
        },
      }
    );
  };

  const handleOpenEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToEdit(task);
    setIsDrawerOpen(true);
  };

  const handlePromptLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleOpenCreate = () => {
    setTaskToEdit(null);
    setIsDrawerOpen(true);
  };

  const priorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-600 border-red-200";
      case "medium":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "low":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const renderTaskItem = (task: Task) => (
    <SwipeableTaskItem
      key={task.id}
      task={task}
      onToggleStatus={handleToggleTaskStatus}
      onEdit={handleOpenEdit}
      onDelete={handleDeleteTask}
      priorityColor={priorityColor}
    />
  );

  if (!mounted || (!isAuthenticated && !token)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center space-x-2 text-slate-500">
          <div className="w-5 h-5 border-2 border-[#4566EC]/30 border-t-[#4566EC] rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: "#4566EC" }}
              className="w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center shadow-md shadow-[#4566EC]/25 text-base"
            >
              ✓
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-slate-900 leading-tight block">
                SuperTodo
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium block">
                Weekly Task Manager
              </span>
            </div>
          </div>

          {/* PC Search bar in Header */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or description"
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-9 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#4566EC] focus:ring-2 focus:ring-[#4566EC]/20 focus:outline-none transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Header: User + PC Add Task Button + Sign Out */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleOpenCreate}
              style={{ backgroundColor: "#4566EC" }}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>

            <div className="text-right hidden lg:block">
              <p className="text-xs font-semibold text-slate-800">
                {user?.name || "User"}
              </p>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {user?.email}
              </p>
            </div>

            <button
              onClick={handlePromptLogout}
              title="Sign Out"
              className="p-2 sm:px-3 sm:py-1.5 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col md:flex-row gap-6">
        {/* ========================================================= */}
        {/* PC: LEFT HANDSIDE 7 DAYS MENU BAR (Desktop only)          */}
        {/* ========================================================= */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border border-slate-200 p-4 shadow-xs h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                This Week
              </h3>
              <p className="text-xs text-slate-500 font-medium">Mon — Sun</p>
            </div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          <nav className="space-y-1.5">
            {weekDays.map((day) => {
              const isSelected = selectedDate === day.dateString;
              return (
                <button
                  key={day.dateString}
                  onClick={() => {
                    setSelectedDate(day.dateString);
                    setIsWeeklyView(false);
                    setSearchQuery("");
                  }}
                  style={isSelected ? { backgroundColor: "#4566EC" } : {}}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "text-white font-semibold shadow-md shadow-[#4566EC]/25 scale-[1.01]"
                      : "text-slate-400 hover:bg-slate-100/80 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm ${
                        isSelected ? "text-white font-bold" : "text-slate-400"
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    <div>
                      <span className="text-xs block leading-tight">
                        {day.fullDayName}
                      </span>
                      {day.isToday && (
                        <span
                          className={`text-[10px] font-medium block leading-tight ${
                            isSelected ? "text-white/80" : "text-[#4566EC]"
                          }`}
                        >
                          Today
                        </span>
                      )}
                    </div>
                  </div>
                  {day.isToday && isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ========================================================= */}
        {/* MAIN SCREEN AREA (Right on PC, Full Screen on Phone)      */}
        {/* ========================================================= */}
        <main className="flex-1 flex flex-col space-y-5 pb-24 md:pb-6">
          {/* Mobile Search Input (matches Phone design Image 1) */}
          <div className="md:hidden">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or description"
                className="w-full bg-white border border-slate-200 pl-4 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:border-[#4566EC] focus:ring-2 focus:ring-[#4566EC]/20 focus:outline-none transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-600">
                <Search className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Mobile 7-Day Horizontal Bar (matches Phone design Image 1) */}
          <div className="md:hidden">
            <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 px-0.5 no-scrollbar">
              {weekDays.map((day) => {
                const isSelected = selectedDate === day.dateString;
                return (
                  <button
                    key={day.dateString}
                    onClick={() => {
                      setSelectedDate(day.dateString);
                      setIsWeeklyView(false);
                      setSearchQuery("");
                    }}
                    style={isSelected ? { backgroundColor: "#4566EC" } : {}}
                    className={`flex flex-col items-center justify-center flex-1 py-2.5 px-1 transition-all cursor-pointer ${
                      isSelected
                        ? "text-white shadow-md shadow-[#4566EC]/30"
                        : "text-slate-400 hover:bg-white"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-medium leading-none mb-1.5 ${
                        isSelected ? "text-white/90" : "text-slate-400"
                      }`}
                    >
                      {day.dayName}
                    </span>
                    <span
                      className={`text-sm font-bold leading-none ${
                        isSelected ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2 Status Boxes (Complete & Pending) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Box 1: Task Complete (Light blue card) */}
            <div className="bg-[#EDF2FE] border border-[#D5E1FD] p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-xs">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4566EC]/15 flex items-center justify-center shrink-0">
                <CheckSquare className="w-8 h-8 sm:w-6 sm:h-6 text-[#4566EC]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-700 leading-tight">
                  Task Complete
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {isLoadingSummary ? "--" : String(summary.completed).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                    This Week
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Task Pending (Light pink/red card) */}
            <div className="bg-[#FEECEE] border border-[#FCD5D8] p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-xs">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/15 flex items-center justify-center shrink-0">
                <XSquare className="w-8 h-8 sm:w-6 sm:h-6 text-red-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-700 leading-tight">
                  Task Pending
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {isLoadingSummary ? "--" : String(summary.pending).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                    This Week
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Progress Bar Section */}
          <div className="bg-white border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Weekly Progress
              </h3>
              <span className="text-xs font-bold text-[#4566EC]">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full h-3 sm:h-3.5 bg-[#E6ECFC] overflow-hidden">
              <div
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: "#2946BF",
                }}
                className="h-full transition-all duration-500 ease-out"
              />
            </div>
          </div>

          {/* Task List Header */}
          <div className="bg-white border border-slate-200 p-4 sm:p-6 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {isWeeklyView
                    ? "Weekly Tasks"
                    : isSearching
                    ? `Search Results (${tasksList.length})`
                    : selectedDate === todayStr
                    ? "Tasks Today"
                    : `Tasks for ${selectedDayObj?.fullDayName || selectedDate}`}
                </h2>
                {!isSearching && !isWeeklyView && (
                  <p className="text-xs text-slate-500">
                    {DateHelper.formatDisplayDate(selectedDate)}
                  </p>
                )}
                {isWeeklyView && (
                  <p className="text-xs text-slate-500">
                    All tasks for this week ({weeklyStatus === "in_progress" ? "Pending" : "Completed"})
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isSearching ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs sm:text-sm font-semibold text-[#4566EC] hover:underline cursor-pointer"
                  >
                    Clear search
                  </button>
                ) : isWeeklyView ? (
                  <button
                    type="button"
                    onClick={() => setIsWeeklyView(false)}
                    className="text-xs sm:text-sm font-semibold text-[#4566EC] hover:underline cursor-pointer"
                  >
                    Back to Daily
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsWeeklyView(true);
                      setSearchQuery("");
                    }}
                    className="text-xs sm:text-sm font-semibold text-[#4566EC] hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                )}
              </div>
            </div>

            {/* Weekly Status Tabs (2 tabs: Pending and Completed) */}
            {isWeeklyView && (
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setWeeklyStatus("in_progress")}
                  className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
                    weeklyStatus === "in_progress"
                      ? "text-[#4566EC] border-b-2 border-[#4566EC]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Pending ({summary.pending})
                </button>
                <button
                  type="button"
                  onClick={() => setWeeklyStatus("completed")}
                  className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
                    weeklyStatus === "completed"
                      ? "text-[#4566EC] border-b-2 border-[#4566EC]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Completed ({summary.completed})
                </button>
              </div>
            )}

            {/* Task Items List */}
            {isWeeklyView ? (
              isLoadingWeekly ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <div className="w-6 h-6 border-2 border-[#4566EC]/30 border-t-[#4566EC] rounded-full animate-spin" />
                  <span className="text-xs font-medium">Loading weekly tasks...</span>
                </div>
              ) : totalWeeklyTasks === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700">
                    {weeklyStatus === "in_progress"
                      ? "No pending tasks for this week"
                      : "No completed tasks for this week yet"}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    {weeklyStatus === "in_progress"
                      ? "All tasks for this week are completed, or no tasks have been created."
                      : "Complete tasks during the week to see them listed here."}
                  </p>
                  {weeklyStatus === "in_progress" && (
                    <button
                      onClick={handleOpenCreate}
                      style={{ backgroundColor: "#4566EC" }}
                      className="mt-4 px-4 py-2 text-white text-xs font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Task</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  {weeklyDates.map((dateStr) => {
                    const tasksForDay = (weeklyGrouped[dateStr] || [])
                      .slice()
                      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
                    if (tasksForDay.length === 0) return null;

                    return (
                      <div key={dateStr} className="space-y-1">
                        <div className="flex items-center gap-2 pb-1.5 mb-1 border-b border-slate-100">
                          <Calendar className="w-3.5 h-3.5 text-[#4566EC]" />
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {DateHelper.formatDisplayDate(dateStr)}
                          </h3>
                          <span className="text-[11px] font-medium text-slate-400">
                            ({tasksForDay.length})
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {tasksForDay.map((task) => renderTaskItem(task))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : isLoadingDateTasks || (isSearching && isLoadingSearch) ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-6 h-6 border-2 border-[#4566EC]/30 border-t-[#4566EC] rounded-full animate-spin" />
                <span className="text-xs font-medium">Loading tasks...</span>
              </div>
            ) : tasksList.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">
                  {isSearching ? "No matching tasks found" : "No tasks for this day"}
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  {isSearching
                    ? "Try searching with a different keyword"
                    : "Stay organized and productive by adding your first task for this date."}
                </p>
                {!isSearching && (
                  <button
                    onClick={handleOpenCreate}
                    style={{ backgroundColor: "#4566EC" }}
                    className="mt-4 px-4 py-2 text-white text-xs font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 flex-1">
                {tasksList.map((task) => renderTaskItem(task))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* PHONE: FLOATING ACTION BUTTON (FAB) (Mobile only)         */}
      {/* ========================================================= */}
      <div className="md:hidden fixed bottom-6 inset-x-0 flex justify-center z-40 pointer-events-none">
        <button
          type="button"
          onClick={handleOpenCreate}
          style={{ backgroundColor: "#4566EC" }}
          className="pointer-events-auto w-14 h-14 rounded-full text-white shadow-xl shadow-[#4566EC]/40 flex items-center justify-center hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          aria-label="Add new task"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Task Drawer / Modal Component (Right Drawer for PC, Bottom Sheet for Mobile) */}
      <TaskDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setTaskToEdit(null);
        }}
        selectedDate={selectedDate}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!taskToDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteTaskMutation.isPending}
        onConfirm={confirmDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        title="Sign Out"
        message="Are you sure you want to sign out of your account? You will need to sign back in to view and manage your tasks."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="warning"
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          handleLogout();
        }}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
