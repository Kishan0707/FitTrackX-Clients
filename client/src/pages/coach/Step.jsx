import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import StepChart from "../../components/StepChart";
import API from "../../services/api";
import { FaBullseye, FaSyncAlt, FaUserCheck, FaWalking } from "react-icons/fa";

const DEFAULT_GOAL = 10000;

const formatChartData = (records) =>
  [...records]
    .reverse()
    .map((record) => ({
      date: new Date(record.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      steps: record.steps || 0,
    }));

const Step = () => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [history, setHistory] = useState([]);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const selectedClient = clients.find((client) => client._id === selectedClientId);
  const latestRecord = history[0] || null;
  const progress =
    latestRecord?.goal ?
      Math.min(((latestRecord.steps || 0) / latestRecord.goal) * 100, 100).toFixed(1)
    : "0.0";

  const fetchClients = async () => {
    const response = await API.get("/coach/clients");
    return response.data?.data || [];
  };

  const fetchClientSteps = async (clientId, { silent = false } = {}) => {
    if (!clientId) {
      setHistory([]);
      setGoal(DEFAULT_GOAL);
      return;
    }

    try {
      if (silent) {
        setRefreshing(true);
      }

      const response = await API.get(`/steps/client/${clientId}`);
      const records = response.data?.data || [];
      setHistory(records);
      setGoal(records[0]?.goal || DEFAULT_GOAL);
      setError("");
    } catch (err) {
      console.error(err);
      setHistory([]);
      setGoal(DEFAULT_GOAL);
      showMessage(
        err.response?.data?.message || "Failed to load client steps.",
        "error",
      );
    } finally {
      setRefreshing(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const clientsData = await fetchClients();
      setClients(clientsData);

      if (clientsData.length === 0) {
        setSelectedClientId("");
        setHistory([]);
        setGoal(DEFAULT_GOAL);
        setError("");
        return;
      }

      const nextClientId =
        clientsData.find((client) => client._id === selectedClientId)?._id ||
        clientsData[0]._id;

      setSelectedClientId(nextClientId);
      await fetchClientSteps(nextClientId);
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Failed to load steps tracker.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const saveSteps = async () => {
    const parsedGoal = Number(goal);

    if (!selectedClientId) {
      showMessage("Please select a client first.", "error");
      return;
    }

    if (!Number.isFinite(parsedGoal) || parsedGoal < 1) {
      showMessage("Please enter a valid daily goal.", "error");
      return;
    }

    try {
      setSaving(true);
      await API.post("/steps/assign", {
        clientId: selectedClientId,
        goal: parsedGoal,
      });
      showMessage("Step target assigned successfully.");
      await fetchClientSteps(selectedClientId, { silent: true });
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Failed to assign step target.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedClientId) {
      return;
    }

    fetchClientSteps(selectedClientId, { silent: true });
  }, [selectedClientId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-screen'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500' />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='max-w-6xl mx-auto space-y-6'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-white mb-1 flex items-center gap-2'>
              <FaWalking className='text-green-400' />
              Coach Steps Tracker
            </h1>
            <p className='text-slate-400 text-sm'>
              Selected client ke liye daily step goal assign karo aur unka step
              history monitor karo.
            </p>
          </div>
          <button
            onClick={() => fetchClientSteps(selectedClientId, { silent: true })}
            disabled={!selectedClientId || refreshing}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              !selectedClientId || refreshing ?
                "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
            }`}>
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className='p-4 bg-red-500/20 border border-red-500 text-red-100 rounded-lg'>
            {error}
          </div>
        )}
        {success && (
          <div className='p-4 bg-green-500/20 border border-green-500 text-green-100 rounded-lg'>
            {success}
          </div>
        )}

        {clients.length === 0 ? (
          <div className='bg-slate-900 border border-slate-700 p-8 rounded-xl text-center'>
            <p className='text-white font-semibold'>No clients available</p>
            <p className='text-slate-400 text-sm mt-2'>
              Jab coach ke accepted clients honge tab aap unke liye step targets
              assign kar paoge.
            </p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='bg-slate-900 border border-slate-700 p-6 rounded-xl md:col-span-1'>
                <h2 className='text-slate-300 text-sm font-medium mb-4 flex items-center gap-2'>
                  <FaUserCheck className='text-blue-400' />
                  Select Client
                </h2>
                <select
                  value={selectedClientId}
                  onChange={(event) => setSelectedClientId(event.target.value)}
                  className='bg-slate-800 border border-slate-700 text-white p-3 w-full rounded-lg outline-none focus:border-blue-500 transition-colors'>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>

                {selectedClient && (
                  <div className='mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-4'>
                    <p className='text-white font-semibold'>{selectedClient.name}</p>
                    <p className='text-slate-400 text-sm mt-1'>
                      {selectedClient.email}
                    </p>
                  </div>
                )}
              </div>

              <div className='bg-slate-900 border border-slate-700 p-6 rounded-xl md:col-span-1'>
                <h2 className='text-slate-300 text-sm font-medium mb-4 flex items-center gap-2'>
                  <FaBullseye className='text-yellow-400' />
                  Assign Daily Goal
                </h2>
                <input
                  type='number'
                  min='1'
                  placeholder='Enter goal'
                  value={goal}
                  onChange={(event) =>
                    setGoal(Number(event.target.value) || DEFAULT_GOAL)
                  }
                  className='bg-slate-800 border border-slate-700 text-white p-3 w-full mb-4 rounded-lg outline-none focus:border-green-500 transition-colors'
                />
                <button
                  onClick={saveSteps}
                  disabled={!selectedClientId || saving}
                  className={`py-2.5 w-full rounded-lg font-medium transition-colors ${
                    !selectedClientId || saving ?
                      "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                  }`}>
                  {saving ? "Saving..." : "Assign Target"}
                </button>
              </div>

              <div className='bg-slate-900 border border-slate-700 p-6 rounded-xl md:col-span-1'>
                <h2 className='text-slate-300 text-sm font-medium mb-4'>
                  Latest Progress
                </h2>
                {latestRecord ? (
                  <>
                    <div className='flex items-end justify-between mb-3'>
                      <span className='text-3xl font-bold text-white'>
                        {(latestRecord.steps || 0).toLocaleString()}
                      </span>
                      <span className='text-slate-400 text-sm'>
                        / {(latestRecord.goal || DEFAULT_GOAL).toLocaleString()} steps
                      </span>
                    </div>
                    <div className='bg-slate-700 h-3 rounded-full overflow-hidden mb-2'>
                      <div
                        className='bg-green-500 h-3 rounded-full transition-all duration-500'
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className='text-green-400 text-sm font-medium'>
                      {progress}% of goal
                    </p>
                    <p className='text-slate-400 text-xs mt-3'>
                      Status:{" "}
                      <span className='text-white capitalize'>
                        {latestRecord.goalStatus || "pending"}
                      </span>
                    </p>
                  </>
                ) : (
                  <div className='flex items-center justify-center h-full min-h-[120px] text-slate-500 text-sm'>
                    No steps logged yet
                  </div>
                )}
              </div>
            </div>

            <div className='bg-slate-900 border border-slate-700 p-6 rounded-xl'>
              <h2 className='text-white font-semibold mb-4'>Steps History</h2>
              {history.length > 0 ? (
                <StepChart data={formatChartData(history)} />
              ) : (
                <div className='flex items-center justify-center h-48 text-slate-500 text-sm'>
                  No step history yet
                </div>
              )}
            </div>

            <div className='bg-slate-900 border border-slate-700 p-6 rounded-xl'>
              <h2 className='text-white font-semibold mb-4'>Recent Records</h2>
              <div className='space-y-3'>
                {history.length === 0 ? (
                  <p className='text-slate-500 text-sm'>No records yet.</p>
                ) : (
                  history.slice(0, 7).map((record) => (
                    <div
                      key={record._id}
                      className='flex items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3'>
                      <div>
                        <p className='text-white text-sm font-medium'>
                          {new Date(record.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className='text-slate-400 text-xs mt-1 capitalize'>
                          Goal status: {record.goalStatus || "pending"}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-white text-sm'>
                          {(record.steps || 0).toLocaleString()} /{" "}
                          {(record.goal || DEFAULT_GOAL).toLocaleString()}
                        </p>
                        <p className='text-slate-400 text-xs mt-1'>steps</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Step;
