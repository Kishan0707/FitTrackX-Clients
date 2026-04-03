import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import {
  FaCalendarAlt,
  FaTrash,
  FaClock,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const isExpired = (s) =>
  new Date(s.date) < new Date() &&
  ["accepted", "scheduled", "pending"].includes(s.status);

const getStatus = (s) => (isExpired(s) ? "expired" : s.status);

const STATUS_STYLE = {
  pending: {
    bg: "bg-yellow-500/15 border-yellow-500/30",
    badge: "bg-yellow-500/20 text-yellow-400",
    label: "Pending",
  },
  accepted: {
    bg: "bg-green-500/10 border-green-500/30",
    badge: "bg-green-500/20 text-green-400",
    label: "Accepted",
  },
  scheduled: {
    bg: "bg-green-500/10 border-green-500/30",
    badge: "bg-green-500/20 text-green-400",
    label: "Scheduled",
  },
  rejected: {
    bg: "bg-red-500/10 border-red-500/30",
    badge: "bg-red-500/20 text-red-400",
    label: "Rejected",
  },
  cancelled: {
    bg: "bg-red-500/10 border-red-500/30",
    badge: "bg-red-500/20 text-red-400",
    label: "Cancelled",
  },
  completed: {
    bg: "bg-blue-500/10 border-blue-500/30",
    badge: "bg-blue-500/20 text-blue-400",
    label: "Completed",
  },
  expired: {
    bg: "bg-slate-700/50 border-slate-600/30",
    badge: "bg-slate-600/40 text-slate-400",
    label: "Expired",
  },
};

const getStyle = (status) =>
  STATUS_STYLE[status] || {
    bg: "bg-slate-800 border-slate-700",
    badge: "bg-slate-600 text-slate-300",
    label: status,
  };

const TABS = ["all", "pending", "accepted", "rejected", "expired"];

const Session = () => {
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [form, setForm] = useState({
    title: "",
    clientId: "",
    date: "",
    time: "",
  });
  const [error, setError] = useState("");

  const fetchAll = async () => {
    const [sRes, cRes] = await Promise.all([
      API.get("/sessions/my-sessions").catch(() => ({ data: { data: [] } })),
      API.get("/coach/clients").catch(() => ({ data: { data: [] } })),
    ]);
    setSessions(Array.isArray(sRes.data.data) ? sRes.data.data : []);
    setClients(Array.isArray(cRes.data.data) ? cRes.data.data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.clientId || !form.date || !form.time)
      return setError("All fields are required");
    setError("");
    const date = new Date(`${form.date}T${form.time}`).toISOString();
    await API.post("/sessions", {
      title: form.title,
      clientId: form.clientId,
      date,
    });
    setForm({ title: "", clientId: "", date: "", time: "" });
    fetchAll();
  };

  const deleteSession = async (id) => {
    await API.delete(`/sessions/${id}`);
    fetchAll();
  };

  const filtered = sessions.filter((s) =>
    tab === "all" ? true : getStatus(s) === tab,
  );

  const tabCount = (t) =>
    t === "all" ?
      sessions.length
    : sessions.filter((s) => getStatus(s) === t).length;

  if (loading)
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500' />
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <h1 className='text-2xl font-bold text-white'>Sessions</h1>

        {/* Create Form */}
        <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
          <h2 className='text-white font-semibold mb-4'>
            Schedule New Session
          </h2>
          {error && <p className='text-red-400 text-sm mb-3'>{error}</p>}
          <form
            onSubmit={handleSubmit}
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3'>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder='Session title'
              className='bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none border border-slate-600 focus:border-blue-500'
            />
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className='bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none border border-slate-600 focus:border-blue-500'>
              <option value=''>Select client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type='date'
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className='bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none border border-slate-600 focus:border-blue-500'
            />
            <input
              type='time'
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className='bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none border border-slate-600 focus:border-blue-500'
            />
            <button
              type='submit'
              className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium'>
              + Schedule
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className='flex gap-2 flex-wrap border-b border-slate-700 pb-0'>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${
                tab === t ?
                  "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
              }`}>
              {t}
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t ?
                    "bg-blue-500/20 text-blue-400"
                  : "bg-slate-700 text-slate-400"
                }`}>
                {tabCount(t)}
              </span>
            </button>
          ))}
        </div>

        {/* Sessions Grid */}
        {filtered.length === 0 ?
          <div className='flex flex-col items-center justify-center py-16 text-slate-500'>
            <FaCalendarAlt className='text-4xl mb-3 opacity-30' />
            <p className='text-sm'>
              No {tab === "all" ? "" : tab} sessions found
            </p>
          </div>
        : <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filtered.map((s) => {
              const status = getStatus(s);
              const style = getStyle(status);
              const expired = status === "expired";
              return (
                <div
                  key={s._id}
                  className={`border rounded-xl p-4 space-y-3 transition-all ${style.bg} ${expired ? "opacity-60" : ""}`}>
                  {/* Title + badge */}
                  <div className='flex items-start justify-between gap-2'>
                    <h3
                      className={`font-semibold text-white ${expired ? "line-through decoration-slate-400" : ""}`}>
                      {s.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>

                  {/* Client */}
                  <p
                    className={`text-sm ${expired ? "text-slate-500 line-through decoration-slate-500" : "text-slate-300"}`}>
                    👤 {s.clientId?.name || "—"}
                  </p>

                  {/* Date */}
                  <div
                    className={`flex items-center gap-2 text-sm ${expired ? "text-slate-500" : "text-slate-400"}`}>
                    <FaClock className='text-xs shrink-0' />
                    <span
                      className={
                        expired ? "line-through decoration-slate-500" : ""
                      }>
                      {fmt(s.date)}
                    </span>
                  </div>

                  {/* Expired label */}
                  {expired && (
                    <p className='text-xs text-slate-500 italic'>
                      This session has passed
                    </p>
                  )}

                  {/* Delete */}
                  <div className='flex justify-end pt-1'>
                    <button
                      onClick={() => deleteSession(s._id)}
                      className='flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors'>
                      <FaTrash className='text-[10px]' /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>
    </DashboardLayout>
  );
};

export default Session;
