import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";
import React from "react";
import { FaSyncAlt } from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { toDisplayText, toDisplayDateTime } from "../../utils/display";

/* -------------------- HELPERS -------------------- */

const normalizeLog = (log = {}) => {
  return {
    id: log?._id || log?.id,
    adminName: toDisplayText(log?.adminName || log?.admin, "Unknown"),
    action: toDisplayText(log?.action, "unknown"),
    targetType: toDisplayText(log?.targetType, "unknown"),
    targetValue: toDisplayText(log?.targetId, "N/A"),
    description: toDisplayText(log?.description, "N/A"),
    ip: toDisplayText(log?.ip, "N/A"),
    time: log?.createdAt || log?.timestamp,
  };
};

/* -------------------- MEMO TABLE -------------------- */

// ✅ Prevent full re-render
const AuditTable = React.memo(({ logs }) => {
  return logs.map((log) => (
    <tr key={log.id} className="hover:bg-slate-700/30">
      <td className="px-4 py-4">{toDisplayDateTime(log.time)}</td>
      <td className="px-4 py-4">{log.adminName}</td>
      <td className="px-4 py-4">{log.action}</td>
      <td className="px-4 py-4">{log.targetValue}</td>
      <td className="px-4 py-4">{log.description}</td>
      <td className="px-4 py-4">{log.ip}</td>
    </tr>
  ));
});

/* -------------------- MAIN COMPONENT -------------------- */

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* -------------------- FETCH -------------------- */

  const fetchLogs = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const res = await API.get("/admin/audit-logs");

      const rawLogs = res.data?.data || [];

      // ✅ heavy work inside transition (fix INP)
      startTransition(() => {
        const normalized = rawLogs.map(normalizeLog);
        setLogs(normalized);
      });
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /* -------------------- HANDLERS -------------------- */

  // ✅ avoid inline function
  const handleRefresh = useCallback(() => {
    startTransition(() => {
      fetchLogs({ silent: true });
    });
  }, [fetchLogs]);

  /* -------------------- MEMO -------------------- */

  const totalLogs = useMemo(() => logs.length, [logs]);

  /* -------------------- UI -------------------- */

  if (loading) return <div>Loading logs...</div>;

  return (
    <DashboardLayout>
      <div className="min-h-screen text-white bg-slate-900">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Audit Logs</h1>
              <p className="text-sm text-slate-400">Track admin activity</p>
            </div>

            {/* ✅ Optimized refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded bg-slate-800"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* SUMMARY */}
          <p className="mb-4 text-sm text-slate-400">
            Total Logs: <span className="text-white">{totalLogs}</span>
          </p>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full border border-slate-700">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Admin</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Target</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">IP</th>
                </tr>
              </thead>

              <tbody>
                {logs.length > 0 ? (
                  <AuditTable logs={logs} />
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center">
                      No logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
