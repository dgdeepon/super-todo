"use client";

import React, { useState } from "react";
import { Check, Clock, Trash2, Edit3 } from "lucide-react";
import { Task, TaskPriority } from "@/types/tasks.types";

interface SwipeableTaskItemProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task, e: React.MouseEvent) => void;
  onDelete: (task: Task, e?: React.MouseEvent) => void;
  priorityColor: (priority: TaskPriority) => string;
}

export default function SwipeableTaskItem({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  priorityColor,
}: SwipeableTaskItemProps) {
  const isCompleted = task.status === "completed";

  // Touch tracking state (Mobile only swipe gesture)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only active on mobile viewport (< 768px)
    if (typeof window !== "undefined" && window.innerWidth >= 768) return;
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    if (typeof window !== "undefined" && window.innerWidth >= 768) return;

    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    // Ignore if vertical scrolling is dominant
    if (Math.abs(diffY) > Math.abs(diffX) && !isSwiping) {
      return;
    }

    // Only allow swipe left (diffX < 0)
    if (diffX < 0) {
      setIsSwiping(true);
      // Resistance damping past -80px
      const clampedOffset = Math.max(diffX, -100);
      setSwipeOffset(clampedOffset);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null) return;
    // Threshold to trigger delete on mobile swipe left (60px)
    if (swipeOffset <= -60) {
      onDelete(task);
    }
    // Reset back
    setSwipeOffset(0);
    setTouchStartX(null);
    setTouchStartY(null);
    setTimeout(() => {
      setIsSwiping(false);
    }, 200);
  };

  const handleClick = () => {
    // Suppress click toggle if a swipe gesture was just performed
    if (isSwiping || Math.abs(swipeOffset) > 10) return;
    onToggleStatus(task);
  };

  return (
    <div className="relative overflow-hidden -mx-2 px-2 rounded-xl group select-none">
      {/* Background red delete trigger indicator (Visible on mobile swipe left) */}
      <div
        className="md:hidden absolute inset-y-0 right-0 w-24 bg-red-600 flex items-center justify-end pr-5 transition-opacity rounded-r-xl"
        style={{
          opacity: Math.min(Math.abs(swipeOffset) / 50, 1),
        }}
      >
        <Trash2 className="w-5 h-5 text-white animate-pulse" />
      </div>

      {/* Main Task Item Row */}
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? "none" : "transform 0.25s ease-out",
        }}
        className="relative bg-white py-3.5 flex items-center justify-between gap-3 group-hover:bg-slate-50/70 rounded-xl transition-colors cursor-pointer"
      >
        {/* Left: Custom Checkbox + Task Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(task);
            }}
            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isCompleted
                ? "bg-[#4566EC] border-[#4566EC] text-white shadow-xs"
                : "border-slate-300 hover:border-[#4566EC] bg-white"
            }`}
          >
            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>

          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium leading-snug truncate ${
                isCompleted
                  ? "line-through text-slate-400 font-normal"
                  : "text-slate-800"
              }`}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {(task.startTime) && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>
                    {(task.startTime || "").slice(0, 5)}
                    {task.endTime ? ` - ${task.endTime.slice(0, 5)}` : ""}
                  </span>
                </span>
              )}
              {task.priority && (
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${priorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Icons (Trash & Edit) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => onDelete(task, e)}
            title="Delete task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => onEdit(task, e)}
            title="Edit task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#4566EC] hover:bg-[#4566EC]/10 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
