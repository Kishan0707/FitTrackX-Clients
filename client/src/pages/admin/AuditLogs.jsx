import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import { FaSyncAlt } from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { toDisplayText, toDisplayDateTime } from "../../utils/display";

const defaultFilters = {
  action: "all",
  targetType: "all",
  adminId: "",
  from: "",
  to: "",
};

const extractAuditLogList = (responseData) => {
  const payload = responseData?.data ?? responseData;

  if (Array.isArray(payload)) {
    return {
      list: payload,
      total: payload.length,
      totalPages: 1,
    };
  }

  const list = payload?.logs || payload?.items || payload?.results || [];
  const total =
    payload?.total ||
    payload?.count ||
    payload?.totalCount ||
    payload?.pagination?.total ||
    list.length;
  const totalPages =
    payload?.totalPages ||
    payload?.pages ||
    payload?.pagination?.totalPages ||
    Math.max(1, Math.ceil(total / (payload?.limit || 10)));

  return { list, total, totalPages };
};

const normalizeLog = (log = {}) => {
  const adminName = toDisplayText(
    log?.admin || log?.adminName || log?.adminId,
    "Unknown Admin",
  );
  const action = toDisplayText(
    log?.action || log?.event,
    "unknown",
  ).toLowerCase();
  const targetType = toDisplayText(
    log?.targetType || log?.target?.type || log?.entityType,
    "unknown",
  ).toLowerCase();
  const targetValue = toDisplayText(
    log?.target || log?.targetId || log?.entityId,
    "N/A",
  );
  const description = toDisplayText(
    log?.description || log?.reason || log?.message || log?.details,
    "N/A",
  );
  const ip = toDisplayText(log?.ip || log?.ipAddress || log?.meta?.ip, "N/A");
  const time = log?.createdAt || log?.timestamp || log?.time || null;

  return {
    id: log?._id || log?.id || `${time || "log"}-${targetValue}`,
    adminName,
    adminId: log?.admin?._id || log?.adminId || "",
    action,
    targetType,
    targetValue,
    description,
    ip,
    time,
  };
};

const formatFilterLabel = (value) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionOptions, setActionOptions] = useState([]);
  const [targetTypeOptions, setTargetTypeOptions] = useState([]);

  const fetchLogs = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = { page, limit };
        if (filters.action !== "all") params.action = filters.action;
        if (filters.targetType !== "all")
          params.targetType = filters.targetType;
        if (filters.adminId.trim()) params.adminId = filters.adminId.trim();
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;

        const res = await API.get("/admin/audit-logs", { params });

        const parsed = extractAuditLogList(res.data);
        const normalizedLogs = (parsed.list || []).map((log) =>
          normalizeLog(log),
        );

        setLogs(normalizedLogs);
        setTotal(parsed.total || normalizedLogs.length);
        setTotalPages(parsed.totalPages || 1);
        setError("");

        setActionOptions((prev) => {
          const merged = new Set([
            ...prev,
            ...normalizedLogs.map((log) => log.action).filter(Boolean),
          ]);
          return Array.from(merged).sort();
        });

        setTargetTypeOptions((prev) => {
          const merged = new Set([
            ...prev,
            ...normalizedLogs.map((log) => log.targetType).filter(Boolean),
          ]);
          return Array.from(merged).sort();
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch audit logs",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters, limit, page],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const showingCount = useMemo(() => logs.length, [logs]);

  const applyFilters = () => {
    setFilters({
      action: draftFilters.action || "all",
      targetType: draftFilters.targetType || "all",
      adminId: draftFilters.adminId || "",
      from: draftFilters.from || "",
      to: draftFilters.to || "",
    });
    setPage(1);
  };

  const resetFilters = () => {
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
    setPage(1);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-8 h-8 border-2 rounded-full animate-spin border-slate-700 border-t-red-500"></div>
            <span>Loading audit logs...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && logs.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl p-6 mx-auto mt-16 text-center border rounded-xl border-red-500/25 bg-red-500/10">
          <h2 className="mb-2 text-xl font-semibold text-red-300">
            Unable to load audit logs
          </h2>
          <p className="mb-5 text-sm text-red-200/90">{error}</p>
          <button
            onClick={() => fetchLogs()}
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
      <div className="min-h-screen text-white bg-slate-900">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-7">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Audit Logs</h1>
              <p className="text-sm text-slate-300">
                Track moderation and admin activity history.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchLogs({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition border rounded-lg border-slate-600 bg-slate-800 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="px-4 py-3 mb-5 text-sm text-red-200 border rounded-lg border-red-500/25 bg-red-500/10">
              {error}
            </div>
          )}

          <div className="p-4 mb-6 border rounded-xl border-slate-700 bg-slate-800">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <select
                value={draftFilters.action}
                onChange={(event) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    action: event.target.value,
                  }))
                }
                className="px-3 py-2 text-sm text-white transition border rounded-lg outline-none border-slate-600 bg-slate-900 focus:border-red-500"
              >
                <option value="all">All Actions</option>
                {actionOptions.map((actionValue) => (
                  <option key={actionValue} value={actionValue}>
                    {formatFilterLabel(actionValue)}
                  </option>
                ))}
              </select>

              <select
                value={draftFilters.targetType}
                onChange={(event) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    targetType: event.target.value,
                  }))
                }
                className="px-3 py-2 text-sm text-white transition border rounded-lg outline-none border-slate-600 bg-slate-900 focus:border-red-500"
              >
                <option value="all">All Target Types</option>
                {targetTypeOptions.map((targetTypeValue) => (
                  <option key={targetTypeValue} value={targetTypeValue}>
                    {formatFilterLabel(targetTypeValue)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={draftFilters.adminId}
                onChange={(event) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    adminId: event.target.value,
                  }))
                }
                placeholder="Admin ID"
                className="px-3 py-2 text-sm text-white transition border rounded-lg outline-none border-slate-600 bg-slate-900 focus:border-red-500"
              />

              <input
                type="date"
                value={draftFilters.from}
                onChange={(event) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    from: event.target.value,
                  }))
                }
                className="px-3 py-2 text-sm text-white transition border rounded-lg outline-none border-slate-600 bg-slate-900 focus:border-red-500"
              />

              <input
                type="date"
                value={draftFilters.to}
                onChange={(event) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    to: event.target.value,
                  }))
                }
                className="px-3 py-2 text-sm text-white transition border rounded-lg outline-none border-slate-600 bg-slate-900 focus:border-red-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                onClick={applyFilters}
                className="px-4 py-2 text-sm font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-500"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-semibold transition border rounded-lg border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-700"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm text-slate-300">
            <p>
              Showing{" "}
              <span className="font-semibold text-white">{showingCount}</span>{" "}
              of <span className="font-semibold text-white">{total}</span> logs
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="logs-limit">Rows per page:</label>
              <select
                id="logs-limit"
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 text-sm text-white transition border rounded-md outline-none border-slate-600 bg-slate-900 focus:border-red-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="w-full overflow-hidden border rounded-xl border-slate-700 bg-slate-800">
            <div className="overflow-x-scroll md:overflow-auto">
              <table className="min-w-full overflow-x-scroll divide-y divide-slate-700">
                <thead className=" bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-300">
                      Time
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-300">
                      Admin
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-300">
                      Action
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-300">
                      Target
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-300">
                      Description
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-300">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-700/35">
                        <td className="px-4 py-4 text-sm text-slate-200">
                          {toDisplayDateTime(log.time)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-200">
                          {log.adminName}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-200">
                          <span className="rounded-full border border-blue-500/30 bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-300">
                            {log.action || "unknown"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-200">
                          {log.targetValue}
                          <p className="mt-1 text-xs text-slate-400">
                            {log.targetType}
                          </p>
                        </td>
                        <td className="max-w-md px-4 py-4 text-sm text-slate-200">
                          <span className="line-clamp-2">
                            {log.description}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-200">
                          {log.ip}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-10 text-sm text-center text-slate-300"
                      >
                        No audit logs found for selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
            <p className="text-sm text-slate-300">
              Page <span className="font-semibold text-white">{page}</span> of{" "}
              <span className="font-semibold text-white">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-semibold transition border rounded-md border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((prev) => Math.min(totalPages || 1, prev + 1))
                }
                disabled={page >= totalPages}
                className="px-3 py-2 text-sm font-semibold transition border rounded-md border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
