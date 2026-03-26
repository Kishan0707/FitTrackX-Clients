import React from "react";
import StatusBadge from "./StatusBadge";

const UserDrawer = ({
  isOpen,
  onClose,
  user,
  getUserRole,
  getUserStatus,
  onModerate,
  actionLoading,
}) => {
  if (!isOpen || !user) return null;

  const currentStatus = getUserStatus(user);
  const isBusy = actionLoading?.userId === user._id;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/50">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose}></div>

      {/* Drawer */}
      <div className="h-full w-[400px] overflow-y-auto bg-slate-900 p-5 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">User Details</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 rounded-lg bg-slate-800">
          <div className="flex items-center mb-3">
            <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-slate-700">
              <span className="font-bold text-white">
                {user.name?.charAt(0)}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-white">{user.name}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex justify-between mt-3">
            <span className="text-sm text-gray-400">
              Role: {getUserRole(user)}
            </span>
            <StatusBadge status={currentStatus} />
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p>User ID: {user._id}</p>
            <p>
              Joined:{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 gap-3 mt-6">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onModerate(user, "ban")}
              className="w-full px-4 py-2 text-white bg-red-500 rounded disabled:opacity-60"
            >
              Ban
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onModerate(user, "suspend")}
              className="w-full px-4 py-2 text-white bg-yellow-500 rounded disabled:opacity-60"
            >
              Suspend
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onModerate(user, "activate")}
              className="w-full px-4 py-2 text-white bg-green-500 rounded disabled:opacity-60"
            >
              Activate
            </button>
          </div>
        </div>

        {/* Future section */}
        <div className="mt-8">
          <h3 className="mb-2 font-bold text-white">More Info (Coming Soon)</h3>
          <p className="text-sm text-slate-400">
            Activity, moderation history, subscriptions...
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDrawer;
