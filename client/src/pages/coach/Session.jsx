import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import {
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaEdit,
  FaTimes,
  FaTrash,
  FaUsers,
} from "react-icons/fa";

const initialForm = {
  title: "",
  clientId: "",
  date: "",
  time: "",
  duration: "60",
  notes: "",
};

const fmt = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const isExpired = (session) =>
  new Date(session.date) < new Date() &&
  ["accepted", "pending"].includes(session.status);

const getStatus = (session) => (isExpired(session) ? "expired" : session.status);

const STATUS_STYLE = {
  pending: {
    card: "bg-yellow-500/15 border-yellow-500/30",
    badge: "bg-yellow-500/20 text-yellow-300",
    label: "Pending",
  },
  accepted: {
    card: "bg-emerald-500/10 border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-300",
    label: "Accepted",
  },
  rejected: {
    card: "bg-red-500/10 border-red-500/30",
    badge: "bg-red-500/20 text-red-300",
    label: "Rejected",
  },
  cancelled: {
    card: "bg-red-500/10 border-red-500/30",
    badge: "bg-red-500/20 text-red-300",
    label: "Cancelled",
  },
  completed: {
    card: "bg-blue-500/10 border-blue-500/30",
    badge: "bg-blue-500/20 text-blue-300",
    label: "Completed",
  },
  expired: {
    card: "bg-slate-700/40 border-slate-600/30",
    badge: "bg-slate-600/40 text-slate-300",
    label: "Expired",
  },
};

const TABS = [
  "all",
  "pending",
  "accepted",
  "completed",
  "cancelled",
  "rejected",
  "expired",
];

const Session = () => {
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionSessionId, setActionSessionId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [editingSessionId, setEditingSessionId] = useState("");
  const [tab, setTab] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showMessage = (message, type = "success") => {
    if (type === "error") {
      setError(message);
      setTimeout(() => setError(""), 3000);
      return;
    }

    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const resetForm = (nextClients = clients) => {
    setEditingSessionId("");
    setForm({
      ...initialForm,
      clientId: nextClients[0]?._id || "",
    });
  };

  const fetchAll = async () => {
    setLoading(true);

    try {
      const [sessionsRes, clientsRes] = await Promise.all([
        API.get("/sessions/my-sessions").catch((err) =>
          err.response?.status === 404 ? { data: { data: [] } } : Promise.reject(err),
        ),
        API.get("/coach/clients").catch((err) =>
          err.response?.status === 404 ? { data: { data: [] } } : Promise.reject(err),
        ),
      ]);

      const sessionsData = Array.isArray(sessionsRes.data?.data) ?
          sessionsRes.data.data
        : [];
      const clientsData = Array.isArray(clientsRes.data?.data) ?
          clientsRes.data.data
        : [];

      setSessions(sessionsData);
      setClients(clientsData);
      setError("");

      if (!editingSessionId) {
        setForm((prev) => ({
          ...prev,
          clientId:
            prev.clientId ||
            (clientsData.length > 0 ? clientsData[0]._id : initialForm.clientId),
        }));
      }
    } catch (err) {
      console.error(err);
      showMessage("Failed to load sessions.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const startEditingSession = (session) => {
    const sessionDate = new Date(session.date);
    setEditingSessionId(session._id);
    setForm({
      title: session.title || "",
      clientId: session.clientId?._id || session.clientId || "",
      date: sessionDate.toISOString().slice(0, 10),
      time: sessionDate.toTimeString().slice(0, 5),
      duration: String(session.duration || 60),
      notes: session.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title || !form.clientId || !form.date || !form.time) {
      showMessage("Title, client, date and time are required.", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        clientId: form.clientId,
        date: new Date(`${form.date}T${form.time}`).toISOString(),
        duration: Number(form.duration) || 60,
        notes: form.notes.trim(),
      };

      if (editingSessionId) {
        await API.patch(`/sessions/${editingSessionId}`, payload);
        showMessage("Session updated successfully.");
      } else {
        await API.post("/sessions", payload);
        showMessage("Session scheduled successfully.");
      }

      resetForm();
      await fetchAll();
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Failed to save session.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateSessionStatus = async (sessionId, status, message) => {
    try {
      setActionSessionId(sessionId);
      await API.patch(`/sessions/${sessionId}`, { status });
      setSessions((prev) =>
        prev.map((session) =>
          session._id === sessionId ? { ...session, status } : session,
        ),
      );
      showMessage(message);
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Failed to update session status.",
        "error",
      );
    } finally {
      setActionSessionId("");
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      setDeletingId(sessionId);
      await API.delete(`/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((session) => session._id !== sessionId));
      if (editingSessionId === sessionId) {
        resetForm();
      }
      showMessage("Session deleted successfully.");
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Failed to delete session.",
        "error",
      );
    } finally {
      setDeletingId("");
    }
  };

  const filteredSessions = useMemo(
    () =>
      sessions
        .filter((session) => (tab === "all" ? true : getStatus(session) === tab))
        .sort((left, right) => new Date(left.date) - new Date(right.date)),
    [sessions, tab],
  );

  const totalUpcoming = sessions.filter(
    (session) =>
      new Date(session.date) >= new Date() &&
      ["pending", "accepted"].includes(session.status),
  ).length;
  const totalCompleted = sessions.filter(
    (session) => session.status === "completed",
  ).length;
  const totalPending = sessions.filter(
    (session) => session.status === "pending",
  ).length;
  const totalExpired = sessions.filter((session) => getStatus(session) === "expired")
    .length;

  const tabCount = (tabName) =>
    tabName === "all" ?
      sessions.length
    : sessions.filter((session) => getStatus(session) === tabName).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500' />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Sessions</h1>
          <p className='mt-1 text-sm text-slate-400'>
            Coach sessions schedule, update, complete, ya cancel yahin se manage
            karo.
          </p>
        </div>

        {error && (
          <div className='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200'>
            {error}
          </div>
        )}
        {success && (
          <div className='rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-green-200'>
            {success}
          </div>
        )}

        <div className='grid gap-4 md:grid-cols-4'>
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
            <p className='text-sm text-slate-400'>Total Sessions</p>
            <p className='mt-2 text-3xl font-bold text-white'>{sessions.length}</p>
          </div>
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
            <p className='text-sm text-slate-400'>Upcoming</p>
            <p className='mt-2 text-3xl font-bold text-blue-300'>
              {totalUpcoming}
            </p>
          </div>
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
            <p className='text-sm text-slate-400'>Pending Reply</p>
            <p className='mt-2 text-3xl font-bold text-amber-300'>
              {totalPending}
            </p>
          </div>
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
            <p className='text-sm text-slate-400'>Completed / Expired</p>
            <p className='mt-2 text-3xl font-bold text-emerald-300'>
              {totalCompleted} / {totalExpired}
            </p>
          </div>
        </div>

        <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
          <div className='mb-4 flex items-center gap-2'>
            {editingSessionId ?
              <FaEdit className='text-amber-400' />
            : <FaCalendarAlt className='text-blue-400' />}
            <h2 className='text-white font-semibold'>
              {editingSessionId ? "Edit Session" : "Schedule New Session"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5'>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder='Session title'
                className='rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-blue-500'
              />
              <select
                value={form.clientId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, clientId: event.target.value }))
                }
                className='rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-blue-500'>
                <option value=''>Select client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <input
                type='date'
                value={form.date}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, date: event.target.value }))
                }
                className='rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-blue-500'
              />
              <input
                type='time'
                value={form.time}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, time: event.target.value }))
                }
                className='rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-blue-500'
              />
              <input
                type='number'
                min='15'
                step='15'
                value={form.duration}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, duration: event.target.value }))
                }
                placeholder='Duration (minutes)'
                className='rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-blue-500'
              />
            </div>

            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              rows={3}
              placeholder='Session notes or agenda'
              className='w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-blue-500'
            />

            <div className='flex flex-wrap gap-3'>
              <button
                type='submit'
                disabled={saving}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  saving ?
                    "cursor-not-allowed bg-slate-700 text-slate-400"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                }`}>
                {saving ?
                  "Saving..."
                : editingSessionId ?
                  "Update Session"
                : "Schedule Session"}
              </button>
              {editingSessionId && (
                <button
                  type='button'
                  onClick={() => resetForm()}
                  className='rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800'>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className='flex flex-wrap gap-2 border-b border-slate-700 pb-0'>
          {TABS.map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`border-b-2 px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === tabName ?
                  "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
              }`}>
              {tabName}
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                  tab === tabName ?
                    "bg-blue-500/20 text-blue-300"
                  : "bg-slate-700 text-slate-400"
                }`}>
                {tabCount(tabName)}
              </span>
            </button>
          ))}
        </div>

        {filteredSessions.length === 0 ?
          <div className='flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900 py-16 text-slate-500'>
            <FaCalendarAlt className='mb-3 text-4xl opacity-30' />
            <p className='text-sm'>
              No {tab === "all" ? "" : tab} sessions found
            </p>
          </div>
        : <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {filteredSessions.map((session) => {
              const status = getStatus(session);
              const style = STATUS_STYLE[status] || STATUS_STYLE.pending;
              const canEdit = !["completed", "cancelled", "expired"].includes(status);
              const canComplete = status === "accepted";
              const canCancel = ["pending", "accepted"].includes(status);

              return (
                <div
                  key={session._id}
                  className={`rounded-xl border p-4 transition-all ${style.card}`}>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <h3 className='text-lg font-semibold text-white'>
                        {session.title}
                      </h3>
                      <p className='mt-1 text-sm text-slate-300'>
                        Client: {session.clientId?.name || "Assigned client"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>

                  <div className='mt-4 space-y-2 text-sm text-slate-300'>
                    <div className='flex items-center gap-2'>
                      <FaClock className='text-xs' />
                      <span>{fmt(session.date)}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <FaUsers className='text-xs' />
                      <span>{Number(session.duration || 60)} min session</span>
                    </div>
                    {session.notes && (
                      <p className='rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-300'>
                        {session.notes}
                      </p>
                    )}
                    {status === "expired" && (
                      <p className='text-xs text-slate-400'>
                        Session time pass ho chuka hai. Isko reschedule ya archive
                        kar sakte ho.
                      </p>
                    )}
                  </div>

                  <div className='mt-4 flex flex-wrap gap-2'>
                    {canEdit && (
                      <button
                        type='button'
                        onClick={() => startEditingSession(session)}
                        className='inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/20'>
                        <FaEdit /> Edit
                      </button>
                    )}
                    {canComplete && (
                      <button
                        type='button'
                        onClick={() =>
                          updateSessionStatus(
                            session._id,
                            "completed",
                            "Session marked as completed.",
                          )
                        }
                        disabled={actionSessionId === session._id}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                          actionSessionId === session._id ?
                            "cursor-not-allowed bg-slate-700 text-slate-400"
                          : "bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                        }`}>
                        <FaCheck /> Complete
                      </button>
                    )}
                    {canCancel && (
                      <button
                        type='button'
                        onClick={() =>
                          updateSessionStatus(
                            session._id,
                            "cancelled",
                            "Session cancelled successfully.",
                          )
                        }
                        disabled={actionSessionId === session._id}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                          actionSessionId === session._id ?
                            "cursor-not-allowed bg-slate-700 text-slate-400"
                          : "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        }`}>
                        <FaTimes /> Cancel
                      </button>
                    )}
                    <button
                      type='button'
                      onClick={() => deleteSession(session._id)}
                      disabled={deletingId === session._id}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                        deletingId === session._id ?
                          "cursor-not-allowed bg-slate-700 text-slate-400"
                        : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}>
                      <FaTrash />
                      {deletingId === session._id ? "Deleting..." : "Delete"}
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
