import { useEffect, useMemo, useState } from "react";
import React from "react";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import ToastMessage from "../../components/ToastMessage";
import UserDrawer from "../../components/UserDrawer";
import UserTable from "../../components/UserTable";
import UserTabs from "../../components/UserTabs";
import { normalizeStatus } from "../../utils/moderation";

const ACTION_CONFIG = {
  activate: {
    label: "Activate",
    pastTense: "activated",
    targetStatus: "active",
    requiresReason: false,
  },
  suspend: {
    label: "Suspend",
    pastTense: "suspended",
    targetStatus: "suspended",
    requiresReason: true,
  },
  ban: {
    label: "Ban",
    pastTense: "banned",
    targetStatus: "banned",
    requiresReason: true,
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

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [drawerUserId, setDrawerUserId] = useState("");
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

  const activeDrawerUser = useMemo(() => {
    if (!drawerUserId) return null;
    return users.find((user) => user._id === drawerUserId) || null;
  }, [drawerUserId, users]);

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
      showToast(
        err.response?.data?.message ||
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
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-red-500"></div>
            <span>Loading users...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && users.length === 0) {
    return (
      <DashboardLayout>
        <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-red-500/25 bg-red-500/10 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-300">
            Unable to load users
          </h2>
          <p className="mb-5 text-sm text-red-200/90">{error}</p>
          <button
            onClick={() => fetchUsers()}
            type="button"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
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

      <div className="min-h-screen bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
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
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-sm text-slate-300">Total Users</p>
              <p className="mt-1 text-2xl font-bold">{summary.total}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-sm text-slate-300">Active</p>
              <p className="mt-1 text-2xl font-bold text-green-300">
                {summary.active}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-sm text-slate-300">Suspended</p>
              <p className="mt-1 text-2xl font-bold text-amber-300">
                {summary.suspended}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-sm text-slate-300">Banned</p>
              <p className="mt-1 text-2xl font-bold text-red-300">
                {summary.banned}
              </p>
            </div>
          </div>

          <UserTabs
            summary={summary}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email or user ID"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 py-2 pl-10 pr-3 text-sm text-white outline-none transition focus:border-red-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-red-500"
              >
                <option value="all">All Roles</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <UserTable
            users={filteredUsers}
            onRowClick={(user) => setDrawerUserId(user._id)}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            getUserRole={getUserRole}
            getUserStatus={getUserStatus}
            onModerate={openModerationFlow}
            actionLoading={actionLoading}
          />
        </div>
      </div>

      <UserDrawer
        isOpen={Boolean(activeDrawerUser)}
        onClose={() => setDrawerUserId("")}
        user={activeDrawerUser}
        getUserRole={getUserRole}
        getUserStatus={getUserStatus}
        onModerate={openModerationFlow}
        actionLoading={actionLoading}
      />

      {reasonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6">
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
              className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-sm text-white outline-none transition focus:border-red-500"
              placeholder="Enter moderation reason..."
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={proceedToConfirmation}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6">
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
              <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800 p-3">
                <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">
                  Reason
                </p>
                <p className="text-sm text-slate-200">{confirmModal.reason}</p>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(actionLoading.userId)}
                onClick={closeModals}
                className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModerationAction}
                disabled={Boolean(actionLoading.userId)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
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

export default UserPage;
