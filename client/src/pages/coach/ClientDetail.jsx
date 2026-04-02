import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { FaArrowLeft, FaFire, FaDumbbell, FaAppleAlt, FaWalking } from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const ClientDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("steps");
  const [stepTarget, setStepTarget] = useState("");
  const [stepsRecords, setStepsRecords] = useState([]);

  const fetchData = () =>
    API.get(`/coach/client-detail/${userId}`)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));

  const fetchSteps = () =>
    API.get(`/steps/client/${userId}`)
      .then((res) => setStepsRecords(res.data.data || []));

  useEffect(() => {
    fetchData();
    fetchSteps();
  }, [userId]);

  const assignTarget = async () => {
    if (!stepTarget) return;
    await API.post("/steps/assign", { clientId: userId, goal: Number(stepTarget) });
    setStepTarget("");
    fetchSteps();
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
        </div>
      </DashboardLayout>
    );

  if (!data)
    return (
      <DashboardLayout>
        <p className="text-slate-400 p-6">Client not found.</p>
      </DashboardLayout>
    );

  const { client, todaySteps, workouts, diets, measurements } = data;
  const stepGoal = todaySteps?.goal || 10000;
  const todayCount = todaySteps?.steps || 0;
  const goalPct = Math.min(Math.round((todayCount / stepGoal) * 100), 100);

  const stepsChartData = [...stepsRecords].reverse().map((s) => ({
    date: new Date(s.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    steps: s.steps,
    goal: s.goal,
  }));

  const weightChartData = [...(measurements || [])].reverse().map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    weight: m.weight,
    bodyFat: m.bodyFat,
  }));

  const tabs = [
    { key: "steps", label: "Steps", icon: <FaWalking /> },
    { key: "workouts", label: "Workouts", icon: <FaDumbbell /> },
    { key: "diet", label: "Diet", icon: <FaAppleAlt /> },
    { key: "body", label: "Body", icon: <FaFire /> },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/coach/clients")} className="text-slate-400 hover:text-white">
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">{client.name}</h1>
            <p className="text-slate-400 text-sm">{client.email}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Goal", value: client.goal || "N/A", color: "text-blue-400" },
            { label: "Weight", value: client.weight ? `${client.weight} kg` : "N/A", color: "text-green-400" },
            { label: "Today Steps", value: todayCount.toLocaleString(), color: "text-yellow-400" },
            { label: "Step Goal %", value: `${goalPct}%`, color: goalPct >= 100 ? "text-green-400" : "text-orange-400" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">{s.label}</p>
              <p className={`text-lg font-bold capitalize ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Goal progress bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Today's Step Progress</span>
            <span className="text-white">{todayCount.toLocaleString()} / {stepGoal.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${goalPct >= 100 ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.key ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Steps Tab */}
        {tab === "steps" && (
          <div className="space-y-4">
            {/* Assign Target */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">Assign Step Target</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={stepTarget}
                  onChange={(e) => setStepTarget(e.target.value)}
                  placeholder="e.g. 10000"
                  className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={assignTarget}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Assign
                </button>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">Steps History</h3>
              {stepsChartData.length === 0 ? (
                <p className="text-slate-400 text-sm">No steps data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stepsChartData}>
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

            {/* All Records */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">All Records</h3>
              <div className="space-y-2">
                {stepsRecords.length === 0 ? (
                  <p className="text-slate-400 text-sm">No records yet.</p>
                ) : stepsRecords.map((r) => {
                  const met = r.steps >= r.goal;
                  return (
                    <div key={r._id} className="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                      <span className="text-slate-300 text-sm">
                        {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-white text-sm">
                        {r.steps.toLocaleString()} / {r.goal.toLocaleString()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        r.goalStatus === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        r.goalStatus === "rejected" ? "bg-red-500/20 text-red-400" :
                        met ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                      }`}>
                        {r.goalStatus === "pending" ? "Pending" :
                         r.goalStatus === "rejected" ? "Rejected" :
                         met ? "✓ Met" : "Not Met"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Workouts Tab */}
        {tab === "workouts" && (
          <div className="space-y-3">
            {!workouts?.length ? (
              <p className="text-slate-400 text-sm">No workouts found.</p>
            ) : workouts.map((w) => (
              <div key={w._id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{w.title}</p>
                    <p className="text-slate-400 text-xs capitalize">{w.type} · {w.exercises?.length || 0} exercises</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      w.status === "completed" ? "bg-green-500/20 text-green-400" :
                      w.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>{w.status}</span>
                    <p className="text-slate-400 text-xs mt-1">{w.caloriesBurned} kcal</p>
                  </div>
                </div>
                <p className="text-slate-500 text-xs mt-2">{new Date(w.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Diet Tab */}
        {tab === "diet" && (
          <div className="space-y-3">
            {!diets?.length ? (
              <p className="text-slate-400 text-sm">No diet logs found.</p>
            ) : diets.map((d) => (
              <div key={d._id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-white font-medium">
                    {new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-orange-400 font-bold">{d.totalCalories} kcal</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-700 rounded p-2 text-center">
                    <p className="text-slate-400">Protein</p>
                    <p className="text-white font-medium">{d.totalProtein}g</p>
                  </div>
                  <div className="bg-slate-700 rounded p-2 text-center">
                    <p className="text-slate-400">Carbs</p>
                    <p className="text-white font-medium">{d.totalCarbs}g</p>
                  </div>
                  <div className="bg-slate-700 rounded p-2 text-center">
                    <p className="text-slate-400">Fat</p>
                    <p className="text-white font-medium">{d.totalFat}g</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Body Tab */}
        {tab === "body" && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">Weight History</h3>
            {weightChartData.length === 0 ? (
              <p className="text-slate-400 text-sm">No body measurements found.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff" }} />
                  <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={false} name="Weight (kg)" />
                  <Line type="monotone" dataKey="bodyFat" stroke="#f43f5e" strokeWidth={2} dot={false} name="Body Fat %" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ClientDetail;
