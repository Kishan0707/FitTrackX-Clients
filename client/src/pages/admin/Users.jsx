import { useEffect, useMemo, useState } from "react";
import React from "react";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import ToastMessage from "../../components/ToastMessage";
import { normalizeStatus } from "../../utils/moderation";

const ACTION_CONFIG = {
  activate: {
    label: "Activate",
    pastTense: "activated",
    targetStatus: "active",
    requiresReason: false,
    buttonClass:
      "bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-600/30",
  },
  suspend: {
    label: "Suspend",
    pastTense: "suspended",
    targetStatus: "suspended",
    requiresReason: true,
    buttonClass:
      "bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30",
  },
  ban: {
    label: "Ban",
    pastTense: "banned",
    targetStatus: "banned",
    requiresReason: true,
    buttonClass:
      "bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30",
  },
};

const initialReasonModal = {
  open: false,
  user: null,
  actionKey: "",
  reason: "",
};

const initialConfirmModal = {
  open: false,
  user: null,
  actionKey: "",
  reason: "",
};

const getUserStatus = (user) => {
  if (user?.status) return normalizeStatus(user.status);
  if (user?.moderationStatus) return normalizeStatus(user.moderationStatus);
  if (user?.isBanned) return "banned";
  if (user?.isSuspended) return "suspended";
  return "active";
};

const getUserRole = (user) => String(user?.role || "user").toLowerCase();

const extractUsersFromResponse = (responseData) => {
  const payload = responseData?.data ?? responseData;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;

  return [];
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [reasonModal, setReasonModal] = useState(initialReasonModal);
  const [confirmModal, setConfirmModal] = useState(initialConfirmModal);
  const [actionLoading, setActionLoading] = useState({
    userId: "",
    actionKey: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!toast.message) return;

    const timer = setTimeout(() => {
      setToast({ message: "", type: "info" });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const fetchUsers = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await API.get("/admin/users");
      const fetchedUsers = extractUsersFromResponse(res.data);
      setUsers(fetchedUsers);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch users",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const roleOptions = useMemo(() => {
    const uniqueRoles = new Set(users.map((user) => getUserRole(user)));
    return Array.from(uniqueRoles).sort();
  }, [users]);

  const summary = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        const status = getUserStatus(user);

        acc.total += 1;
        if (status === "active") acc.active += 1;
        if (status === "suspended") acc.suspended += 1;
        if (status === "banned") acc.banned += 1;

        return acc;
      },
      { total: 0, active: 0, suspended: 0, banned: 0 },
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const status = getUserStatus(user);
      const role = getUserRole(user);
      const searchableText =
        `${user?.name || ""} ${user?.email || ""} ${user?._id || ""}`.toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesRole = roleFilter === "all" || role === roleFilter;
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, roleFilter, searchTerm, statusFilter]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const openModerationFlow = (user, actionKey) => {
    const actionConfig = ACTION_CONFIG[actionKey];
    if (!actionConfig) return;

    if (actionConfig.requiresReason) {
      setReasonModal({
        open: true,
        user,
        actionKey,
        reason: "",
      });
      return;
    }

    setConfirmModal({
      open: true,
      user,
      actionKey,
      reason: "",
    });
  };

  const proceedToConfirmation = () => {
    const reason = reasonModal.reason.trim();

    if (!reason) {
      showToast("Reason is mandatory for suspend or ban action.", "error");
      return;
    }

    setConfirmModal({
      open: true,
      user: reasonModal.user,
      actionKey: reasonModal.actionKey,
      reason,
    });
    setReasonModal(initialReasonModal);
  };

  const closeModals = () => {
    setReasonModal(initialReasonModal);
    setConfirmModal(initialConfirmModal);
  };

  const handleModerationAction = async () => {
    const { user, actionKey, reason } = confirmModal;
    const actionConfig = ACTION_CONFIG[actionKey];

    if (!user?._id || !actionConfig) return;

    setActionLoading({ userId: user._id, actionKey });
    try {
      await API.patch(`/admin/users/${user._id}/moderation`, {
        action: actionKey,
        status: actionConfig.targetStatus,
        reason: reason || undefined,
      });

      setUsers((prevUsers) =>
        prevUsers.map((prevUser) =>
          prevUser._id === user._id
            ? {
                ...prevUser,
                status: actionConfig.targetStatus,
                moderationReason: reason || prevUser.moderationReason,
              }
            : prevUser,
        ),
      );

      showToast(
        `${user.name || "User"} ${actionConfig.pastTense} successfully.`,
        "success",
      );
      closeModals();
      fetchUsers({ silent: true });
    } catch (err) {
      const isNotFound = err.response?.status === 404;
      showToast(
        (isNotFound
          ? "Moderation endpoint returned 404. Verify the backend route and VITE_API_URL."
          : err.response?.data?.message) ||
          `Failed to ${actionConfig.label.toLowerCase()} user.`,
        "error",
      );
    } finally {
      setActionLoading({ userId: "", actionKey: "" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-8 h-8 border-2 rounded-full animate-spin border-slate-700 border-t-red-500"></div>
            <span>Loading users...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && users.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl p-6 mx-auto mt-16 text-center border rounded-xl border-red-500/25 bg-red-500/10">
          <h2 className="mb-2 text-xl font-semibold text-red-300">
            Unable to load users
          </h2>
          <p className="mb-5 text-sm text-red-200/90">{error}</p>
          <button
            onClick={() => fetchUsers()}
            type="button"
            className="px-4 py-2 text-sm font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-500"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ToastMessage
        toast={toast}
        onClose={() => setToast({ message: "", type: "info" })}
      />

      <div className="min-h-screen text-white bg-slate-900">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-7">
            <div>
              <h1 className="mb-2 text-3xl font-bold">User Management</h1>
              <p className="text-sm text-slate-300">
                Review users, update moderation status, and track account state.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchUsers({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition border rounded-lg border-slate-600 bg-slate-800 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="px-4 py-3 mb-6 text-sm text-red-200 border rounded-lg border-red-500/25 bg-red-500/10">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="p-4 border rounded-xl border-slate-700 bg-slate-800">
              <p className="text-sm text-slate-300">Total Users</p>
              <p className="mt-1 text-2xl font-bold">{summary.total}</p>
            </div>
            <div className="p-4 border rounded-xl border-slate-700 bg-slate-800">
              <p className="text-sm text-slate-300">Active</p>
              <p className="mt-1 text-2xl font-bold text-green-300">
                {summary.active}
              </p>
            </div>
            <div className="p-4 border rounded-xl border-slate-700 bg-slate-800">
              <p className="text-sm text-slate-300">Suspended</p>
              <p className="mt-1 text-2xl font-bold text-amber-300">
                {summary.suspended}
              </p>
            </div>
            <div className="p-4 border rounded-xl border-slate-700 bg-slate-800">
              <p className="text-sm text-slate-300">Banned</p>
              <p className="mt-1 text-2xl font-bold text-red-300">
                {summary.banned}
              </p>
            </div>
          </div>

          <div className="p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <FaSearch className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email or user ID"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full py-2 pl-10 pr-3 text-sm text-white transition border rounded-lg outline-none border-slate-600 bg-slate-900 focus:border-red-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="px-3 py-2 text-sm text-white transition border rounded-lg outline-none border-slate-600 bg-slate-900 focus:border-red-500"
              >
                <option value="all">All Roles</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="px-3 py-2 text-sm text-white transition border rounded-lg outline-none border-slate-600 bg-slate-900 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden border rounded-xl border-slate-700 bg-slate-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-300">
                      User
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-300">
                      Role
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-300">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const userStatus = getUserStatus(user);
                      const isActionRunning = actionLoading.userId === user._id;

                      return (
                        <tr key={user._id} className="hover:bg-slate-700/35">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-white">
                              {user.name || "Unnamed user"}
                            </p>
                            <p className="text-sm text-slate-300">
                              {user.email || "No email"}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-300">
                              {getUserRole(user)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={userStatus} />
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-300">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(ACTION_CONFIG).map(
                                ([actionKey, actionConfig]) => {
                                  const isCurrentStatus =
                                    userStatus === actionConfig.targetStatus;
                                  const disabled =
                                    isCurrentStatus || isActionRunning;

                                  return (
                                    <button
                                      key={`${user._id}-${actionKey}`}
                                      type="button"
                                      disabled={disabled}
                                      onClick={() =>
                                        openModerationFlow(user, actionKey)
                                      }
                                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${actionConfig.buttonClass} ${
                                        disabled
                                          ? "cursor-not-allowed opacity-45"
                                          : ""
                                      }`}
                                    >
                                      {actionConfig.label}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-10 text-sm text-center text-slate-300"
                      >
                        No users match your current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {reasonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65">
          <div className="w-full max-w-lg p-6 border rounded-xl border-slate-700 bg-slate-900">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Reason Required
            </h3>
            <p className="mb-4 text-sm text-slate-300">
              Please enter a reason to{" "}
              {ACTION_CONFIG[reasonModal.actionKey].label.toLowerCase()}{" "}
              <span className="font-semibold text-white">
                {reasonModal.user?.name || "this user"}
              </span>
              .
            </p>
            <textarea
              value={reasonModal.reason}
              onChange={(event) =>
                setReasonModal((prev) => ({
                  ...prev,
                  reason: event.target.value,
                }))
              }
              rows={4}
              className="w-full p-3 text-sm text-white transition border rounded-lg outline-none border-slate-600 bg-slate-800 focus:border-red-500"
              placeholder="Enter moderation reason..."
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={closeModals}
                className="px-4 py-2 text-sm font-semibold transition border rounded-lg border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={proceedToConfirmation}
                className="px-4 py-2 text-sm font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-500"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65">
          <div className="w-full max-w-lg p-6 border rounded-xl border-slate-700 bg-slate-900">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Are you sure?
            </h3>
            <p className="text-sm text-slate-300">
              You are about to{" "}
              <span className="font-semibold text-white">
                {ACTION_CONFIG[confirmModal.actionKey].label.toLowerCase()}
              </span>{" "}
              <span className="font-semibold text-white">
                {confirmModal.user?.name || "this user"}
              </span>
              .
            </p>
            {confirmModal.reason && (
              <div className="p-3 mt-4 border rounded-lg border-slate-700 bg-slate-800">
                <p className="mb-1 text-xs tracking-wide uppercase text-slate-400">
                  Reason
                </p>
                <p className="text-sm text-slate-200">{confirmModal.reason}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                disabled={Boolean(actionLoading.userId)}
                onClick={closeModals}
                className="px-4 py-2 text-sm font-semibold transition border rounded-lg border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModerationAction}
                disabled={Boolean(actionLoading.userId)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {actionLoading.userId ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent"></span>
                    Processing...
                  </>
                ) : (
                  "Confirm Action"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Users;
