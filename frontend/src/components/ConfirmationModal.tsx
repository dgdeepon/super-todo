"use client";

import React from "react";
import { AlertTriangle, Trash2, LogOut, Edit3, X } from "lucide-react";

export type ConfirmationVariant = "danger" | "warning" | "primary";

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="w-12 h-12 bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
        );
      case "warning":
        return (
          <div className="w-12 h-12 bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <LogOut className="w-6 h-6" />
          </div>
        );
      case "primary":
      default:
        return (
          <div className="w-12 h-12 bg-[#4566EC]/15 text-[#4566EC] flex items-center justify-center shrink-0">
            <Edit3 className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/20";
      case "warning":
        return "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/20";
      case "primary":
      default:
        return "bg-[#4566EC] hover:opacity-95 text-white shadow-md shadow-[#4566EC]/25";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={isLoading ? undefined : onCancel}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="relative transform overflow-hidden bg-white p-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            {renderIcon()}

            <div className="flex-1 pr-4">
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                {title}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${getConfirmButtonClasses()}`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
