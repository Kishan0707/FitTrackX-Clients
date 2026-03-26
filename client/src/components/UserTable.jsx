import React from "react";
import StatusBadge from "./StatusBadge";

const UserTable = ({
  users,
  onRowClick,
  selectedUsers,
  setSelectedUsers,
  getUserRole,
  getUserStatus,
  onModerate,
  actionLoading,
}) => {
  const getUserId = (user) => user._id || user.id;

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id],
    );
  };
  const handleSelecteAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => getUserId(user)));
    }
  };
  return (
    <div className="overflow-hidden rounded-xl bg-slate-900 border border-slate-700">
      <table className="w-full">
        <thead className="text-left bg-slate-800">
          <tr>
            <th className="p-3 font-medium text-slate-300">
              <input
                type="checkbox"
                onChange={handleSelecteAll}
                checked={
                  selectedUsers.length === users.length && users.length !== 0
                }
              />
            </th>
            <th className="p-3 font-medium text-slate-300">Name</th>
            <th className="p-3 font-medium text-slate-300">Email</th>
            <th className="p-3 font-medium text-slate-300">Role</th>
            <th className="p-3 font-medium text-slate-300">Status</th>
            <th className="p-3 font-medium text-slate-300">Joined</th>
            <th className="p-3 font-medium text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={getUserId(user)}
              onClick={() => onRowClick(user)}
              className="border-t cursor-pointer border-slate-700 hover:bg-slate-800/50"
            >
              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(getUserId(user))}
                  onChange={() => toggleUser(getUserId(user))}
                />
              </td>
              <td className="p-3 font-medium">{user.name}</td>
              <td className="p-3 text-slate-300">{user.email}</td>
              <td className="p-3 text-slate-300">{getUserRole(user)}</td>
              <td className="p-3">
                <StatusBadge status={getUserStatus(user)} />
              </td>
              <td className="p-3 text-sm text-slate-300">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  {["activate", "suspend", "ban"].map((actionKey) => (
                    <button
                      key={`${getUserId(user)}-${actionKey}`}
                      type="button"
                      disabled={
                        actionLoading?.userId === getUserId(user) &&
                        actionLoading?.actionKey === actionKey
                      }
                      onClick={() => onModerate(user, actionKey)}
                      className={`rounded px-2.5 py-1 text-xs font-semibold text-white ${
                        actionKey === "activate"
                          ? "bg-green-600 hover:bg-green-500"
                          : actionKey === "suspend"
                            ? "bg-amber-600 hover:bg-amber-500"
                            : "bg-red-600 hover:bg-red-500"
                      }`}
                    >
                      {actionKey.charAt(0).toUpperCase() + actionKey.slice(1)}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-xl bg-slate-800 px-6 py-3 shadow-lg">
          <p className="text-sm text-white">{selectedUsers.length} selected</p>
          <span className="text-xs text-slate-300">
            Bulk actions can be connected here next.
          </span>
        </div>
      )}
    </div>
  );
};

export default UserTable;
