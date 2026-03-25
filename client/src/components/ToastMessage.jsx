import React from "react";

const TOAST_STYLES = {
  success: "border-green-500/30 bg-green-500/15 text-green-200",
  error: "border-red-500/30 bg-red-500/15 text-red-200",
  info: "border-blue-500/30 bg-blue-500/15 text-blue-200",
};

const ToastMessage = ({ toast, onClose }) => {
  if (!toast?.message) return null;

  const styleClass = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  return (
    <div className="fixed right-4 top-4 z-[70] w-full max-w-sm">
      <div
        className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur ${styleClass}`}
      >
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-slate-100 transition hover:text-white"
          aria-label="Close notification"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ToastMessage;
