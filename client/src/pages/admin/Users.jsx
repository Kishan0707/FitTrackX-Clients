import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import React from "react";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import ToastMessage from "../../components/ToastMessage";
import { normalizeStatus } from "../../utils/moderation";

/* -------------------- CONFIG -------------------- */

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

const getUserStatus = (user) => {
  if (user?.status) return normalizeStatus(user.status);
  if (user?.moderationStatus) return normalizeStatus(user.moderationStatus);
  if (user?.isBanned) return "banned";
  if (user?.isSuspended) return "suspended";
  return "active";
};

const getUserRole = (user) => String(user?.role || "user").toLowerCase();

/* -------------------- MEMO TABLE -------------------- */

// ✅ Prevent full table re-render
const UserTable = React.memo(({ users, onAction, actionLoading }) => {
  return users.map((user) => {
    const userStatus = getUserStatus(user);
    const isLoading = actionLoading.userId === user._id;

    return (
      <tr key={user._id} className="hover:bg-slate-700/30">
        <td className="px-4 py-4">
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-slate-400">{user.email}</p>
        </td>

        <td className="px-4 py-4">
          <span className="text-xs">{getUserRole(user)}</span>
        </td>

        <td className="px-4 py-4">
          <StatusBadge status={userStatus} />
        </td>

        <td className="px-4 py-4">
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "N/A"}
        </td>

        <td className="px-4 py-4">
          <div className="flex gap-2">
            {Object.entries(ACTION_CONFIG).map(([key, config]) => {
              const disabled = userStatus === config.targetStatus || isLoading;

              return (
                <button
                  key={key}
                  disabled={disabled}
                  onClick={() => onAction(user, key)}
                  className="px-2 py-1 text-xs rounded bg-slate-700"
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </td>
      </tr>
    );
  });
});

/* -------------------- MAIN COMPONENT -------------------- */

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [actionLoading, setActionLoading] = useState({
    userId: "",
    actionKey: "",
  });

  /* -------------------- DEBOUNCE -------------------- */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* -------------------- FETCH USERS -------------------- */

  const fetchUsers = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const res = await API.get("/admin/users");

      // ✅ prevent UI blocking
      startTransition(() => {
        setUsers(res.data?.data || []);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* -------------------- FILTER -------------------- */

  const filteredUsers = useMemo(() => {
    const query = debouncedSearch.toLowerCase();

    return users.filter((user) => {
      const status = getUserStatus(user);
      const role = getUserRole(user);

      const text = `${user.name} ${user.email}`.toLowerCase();

      return (
        text.includes(query) &&
        (roleFilter === "all" || role === roleFilter) &&
        (statusFilter === "all" || status === statusFilter)
      );
    });
  }, [users, debouncedSearch, roleFilter, statusFilter]);

  /* -------------------- HANDLERS -------------------- */

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      fetchUsers({ silent: true });
    });
  }, [fetchUsers]);

  const handleAction = useCallback((user, actionKey) => {
    console.log(user, actionKey);
  }, []);

  /* -------------------- UI -------------------- */

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <ToastMessage toast={toast} />

      <div className="p-6 text-white bg-slate-900">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>

          <button onClick={handleRefresh}>
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* SEARCH */}
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="p-2 mb-4 text-black"
        />

        {/* TABLE */}
        <table className="w-full">
          <tbody>
            <UserTable
              users={filteredUsers}
              onAction={handleAction}
              actionLoading={actionLoading}
            />
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Users;
