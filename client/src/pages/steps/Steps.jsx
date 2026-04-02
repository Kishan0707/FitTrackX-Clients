import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Steps = () => {
  const [records, setRecords] = useState([]);
  const [pending, setPending] = useState(null);
  const [stepsInput, setStepsInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [myRes, pendingRes] = await Promise.all([
      API.get("/steps/my"),
      API.get("/steps/pending-target"),
    ]);
    setRecords(myRes.data.data || []);
    setPending(pendingRes.data.data || null);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const respond = async (action) => {
    await API.post("/steps/respond", { action });
    fetchAll();
  };

  const logSteps = async () => {
    if (!stepsInput) return;
    await API.post("/steps/log", { steps: Number(stepsInput) });
    setStepsInput("");
    fetchAll();
  };

  const chartData = [...records].reverse().map((r) => ({
    date: new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    steps: r.steps,
    goal: r.goal,
  }));

  const today = records[0];
  const goalPct = today ? Math.min(Math.round((today.steps / today.goal) * 100), 100) : 0;

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-white text-xl font-bold">My Steps</h1>

        {/* Pending Target from Coach */}
        {pending && (
          <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-4 space-y-3">
            <p className="text-white font-medium">
              🎯 Coach <span className="text-yellow-400">{pending.coachId?.name}</span> assigned a step target
            </p>
            <p className="text-slate-300 text-sm">
              Target: <span className="text-white font-bold">{pending.goal?.toLocaleString()} steps</span>
            </p>
            <div className="flex gap-2">
              <button onClick={() => respond("accepted")} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm">✓ Accept</button>
              <button onClick={() => respond("rejected")} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm">✗ Reject</button>
            </div>
          </div>
        )}

        {/* Today progress */}
        {today && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Today's Progress</span>
              <span className="text-white">{today.steps.toLocaleString()} / {today.goal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all ${goalPct >= 100 ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${goalPct}%` }} />
            </div>
            <p className={`text-sm font-medium ${goalPct >= 100 ? "text-green-400" : "text-slate-400"}`}>
              {goalPct >= 100 ? "🎉 Goal reached!" : `${goalPct}% complete`}
            </p>
          </div>
        )}

        {/* Log Steps */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Log Today's Steps</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && logSteps()}
              placeholder="Enter steps count"
              className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none"
            />
            <button onClick={logSteps} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Log</button>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Steps History</h3>
          {chartData.length === 0 ? (
            <p className="text-slate-400 text-sm">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff" }} />
                <Line type="monotone" dataKey="steps" stroke="#3b82f6" strokeWidth={2} dot={false} name="Steps" />
                <Line type="monotone" dataKey="goal" stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Goal" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Records */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">All Records</h3>
          <div className="space-y-2">
            {records.length === 0 ? (
              <p className="text-slate-400 text-sm">No records yet.</p>
            ) : records.map((r) => {
              const met = r.steps >= r.goal;
              return (
                <div key={r._id} className="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                  <span className="text-slate-300 text-sm">{new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <span className="text-white text-sm">{r.steps.toLocaleString()} / {r.goal.toLocaleString()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.goalStatus === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                    r.goalStatus === "rejected" ? "bg-red-500/20 text-red-400" :
                    met ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {r.goalStatus === "pending" ? "Pending" : r.goalStatus === "rejected" ? "Rejected" : met ? "✓ Met" : "Not Met"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Steps;
