import { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { FaWeight, FaFire, FaAppleAlt, FaDumbbell } from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const fmt = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

const StatBox = ({ icon, label, value, sub, color }) => (
  <div className='bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4'>
    <div className={`text-2xl ${color}`}>{icon}</div>
    <div>
      <p className='text-slate-400 text-xs'>{label}</p>
      <p className='text-white font-bold text-lg'>{value}</p>
      {sub && (
        <p
          className={`text-xs ${
            sub.startsWith("+") ? "text-green-400"
            : sub.startsWith("-") ? "text-red-400"
            : "text-slate-400"
          }`}>
          {sub}
        </p>
      )}
    </div>
  </div>
);

const Progress = () => {
  const [progress, setProgress] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/progress/graphs"),
      API.get("/progress/monthly-comparison"),
    ])
      .then(([pRes, mRes]) => {
        setProgress(pRes.data.data);
        setMonthly(mRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500' />
        </div>
      </DashboardLayout>
    );

  const weightHistory = progress?.weightHistory || [];
  const caloriesBurned = progress?.caloriesBurned || [];
  const proteinIntake = progress?.proteinIntake || [];

  const currentWeight = weightHistory.at(-1)?.weight;
  const firstWeight = weightHistory[0]?.weight;
  const weightChange =
    currentWeight && firstWeight ?
      (currentWeight - firstWeight).toFixed(1)
    : null;

  const totalCalories = caloriesBurned.reduce((s, i) => s + i.calories, 0);
  const avgProtein =
    proteinIntake.length ?
      (
        proteinIntake.reduce((s, i) => s + i.protein, 0) / proteinIntake.length
      ).toFixed(1)
    : null;

  const cm = monthly?.currentMonth;
  const pm = monthly?.previousMonth;
  const calPct =
    pm?.caloriesBurned > 0 ?
      (
        ((cm?.caloriesBurned - pm?.caloriesBurned) / pm?.caloriesBurned) *
        100
      ).toFixed(1)
    : null;
  const workoutDiff = cm && pm ? cm.workouts - pm.workouts : null;

  const weightChartData = weightHistory.map((w) => ({
    date: fmt(w.date || w.createdAt),
    weight: w.weight,
  }));
  const calChartData = caloriesBurned.map((c) => ({
    date: fmt(c.date),
    calories: c.calories,
  }));
  const proteinChartData = proteinIntake.map((p) => ({
    date: fmt(p.date),
    protein: p.protein,
  }));

  const tooltipStyle = {
    backgroundColor: "#1e293b",
    border: "none",
    color: "#fff",
  };
  const axisStyle = { fill: "#94a3b8", fontSize: 11 };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-2xl font-bold text-white'>Progress Overview</h1>
          <p className='text-slate-400 text-sm'>This month vs last month</p>
        </div>

        {/* Overview Stats */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatBox
            icon={<FaDumbbell />}
            label='Workouts This Month'
            value={cm?.workouts ?? "—"}
            sub={
              workoutDiff !== null ?
                `${workoutDiff >= 0 ? "+" : ""}${workoutDiff} vs last month`
              : null
            }
            color='text-blue-400'
          />
          <StatBox
            icon={<FaFire />}
            label='Calories Burned'
            value={cm?.caloriesBurned?.toLocaleString() ?? "—"}
            sub={
              calPct !== null ?
                `${calPct >= 0 ? "+" : ""}${calPct}% vs last month`
              : null
            }
            color='text-orange-400'
          />
          <StatBox
            icon={<FaWeight />}
            label='Weight Change'
            value={weightChange !== null ? `${weightChange} kg` : "—"}
            sub={
              weightChange !== null ?
                weightChange < 0 ?
                  "Lost"
                : "Gained"
              : null
            }
            color='text-green-400'
          />
          <StatBox
            icon={<FaAppleAlt />}
            label='Avg Protein'
            value={avgProtein ? `${avgProtein}g` : "—"}
            sub={
              cm?.avgProtein ? `This month: ${cm.avgProtein.toFixed(1)}g` : null
            }
            color='text-purple-400'
          />
        </div>

        {/* This Month vs Last Month */}
        {cm && pm && (
          <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
            <h2 className='text-white font-semibold mb-4'>
              This Month vs Last Month
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              {[
                {
                  label: "🏋️ Workouts",
                  cur: cm.workouts,
                  prev: pm.workouts,
                  unit: "",
                },
                {
                  label: "🔥 Calories",
                  cur: cm.caloriesBurned,
                  prev: pm.caloriesBurned,
                  unit: "",
                },
                {
                  label: "⚖️ Weight Change",
                  cur: cm.weightChange?.toFixed(1),
                  prev: null,
                  unit: "kg",
                },
                {
                  label: "🥩 Avg Protein",
                  cur: cm.avgProtein?.toFixed(1),
                  prev: pm.avgProtein?.toFixed(1),
                  unit: "g",
                },
              ].map((item) => {
                const diff =
                  item.prev !== null && item.cur !== null ?
                    Number(item.cur) - Number(item.prev)
                  : null;
                return (
                  <div key={item.label} className='bg-slate-700 rounded-lg p-3'>
                    <p className='text-slate-400 text-xs mb-2'>{item.label}</p>
                    <p className='text-white font-bold'>
                      {item.cur ?? "—"}
                      {item.unit}
                    </p>
                    {item.prev !== null && (
                      <p className='text-slate-400 text-xs'>
                        Last: {item.prev}
                        {item.unit}
                      </p>
                    )}
                    {diff !== null && (
                      <p
                        className={`text-xs font-medium mt-1 ${
                          diff > 0 ? "text-green-400"
                          : diff < 0 ? "text-red-400"
                          : "text-slate-400"
                        }`}>
                        {diff > 0 ? "+" : ""}
                        {diff}
                        {item.unit}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weight Chart */}
        <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
          <h2 className='text-white font-semibold mb-4 flex items-center gap-2'>
            <FaWeight className='text-red-400' /> Weight History
          </h2>
          {weightChartData.length === 0 ?
            <p className='text-slate-400 text-sm'>No data yet.</p>
          : <ResponsiveContainer width='100%' height={220}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                <XAxis dataKey='date' tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type='monotone'
                  dataKey='weight'
                  stroke='#ef4444'
                  strokeWidth={2}
                  dot={false}
                  name='Weight (kg)'
                />
              </LineChart>
            </ResponsiveContainer>
          }
        </div>

        {/* Calories Chart */}
        <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
          <h2 className='text-white font-semibold mb-4 flex items-center gap-2'>
            <FaFire className='text-orange-400' /> Calories Burned
          </h2>
          {calChartData.length === 0 ?
            <p className='text-slate-400 text-sm'>No data yet.</p>
          : <ResponsiveContainer width='100%' height={220}>
              <BarChart data={calChartData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                <XAxis dataKey='date' tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey='calories'
                  fill='#f97316'
                  radius={[4, 4, 0, 0]}
                  name='Calories'
                />
              </BarChart>
            </ResponsiveContainer>
          }
        </div>

        {/* Protein Chart */}
        <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
          <h2 className='text-white font-semibold mb-4 flex items-center gap-2'>
            <FaAppleAlt className='text-purple-400' /> Protein Intake
          </h2>
          {proteinChartData.length === 0 ?
            <p className='text-slate-400 text-sm'>No data yet.</p>
          : <ResponsiveContainer width='100%' height={220}>
              <BarChart data={proteinChartData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                <XAxis dataKey='date' tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey='protein'
                  fill='#a855f7'
                  radius={[4, 4, 0, 0]}
                  name='Protein (g)'
                />
              </BarChart>
            </ResponsiveContainer>
          }
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Progress;
