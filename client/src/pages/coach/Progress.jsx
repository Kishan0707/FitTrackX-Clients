import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { FaUser, FaWeight, FaFire, FaAppleAlt } from "react-icons/fa";
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
} from "recharts";

const fmt = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "none",
  color: "#fff",
};
const axisStyle = { fill: "#94a3b8", fontSize: 11 };

const CoachProgress = () => {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/coach/clients").then((res) => {
      const list = res.data.data || [];
      setClients(list);
      if (list.length > 0) setSelected(list[0]);
    });
  }, []);

  useEffect(() => {
    if (!selected) return setData(null);
    setLoading(true);
    setData(null);
    API.get(`/coach/client-detail/${selected._id}`)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [selected]);

  const weightData = (data?.measurements || []).map((m) => ({
    date: fmt(m.date),
    weight: m.weight,
    bodyFat: m.bodyFat,
  }));
  const calData = (data?.workouts || []).map((w) => ({
    date: fmt(w.date),
    calories: w.caloriesBurned,
  }));
  const proteinData = (data?.diets || []).map((d) => ({
    date: fmt(d.date),
    protein: d.totalProtein,
  }));

  const weightChange =
    weightData.length > 1 ?
      (weightData.at(-1).weight - weightData[0].weight).toFixed(1)
    : null;
  const avgProtein =
    proteinData.length ?
      (
        proteinData.reduce((s, d) => s + d.protein, 0) / proteinData.length
      ).toFixed(1)
    : null;
  const totalCal = calData.reduce((s, d) => s + d.calories, 0);

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-2xl font-bold text-white'>Client Progress</h1>
          <p className='text-slate-400 text-sm'>
            Select a client to view their progress
          </p>
        </div>

        {/* Client Selector */}
        <div className='flex gap-2 flex-wrap'>
          {clients.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelected(c)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all ${
                selected?._id === c._id ?
                  "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}>
              <FaUser className='text-xs' /> {c.name}
            </button>
          ))}
          {clients.length === 0 && (
            <p className='text-slate-400 text-sm'>No accepted clients yet.</p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className='flex items-center justify-center h-40'>
            <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500' />
          </div>
        )}

        {/* Client Data */}
        {!loading && data && (
          <>
            {/* Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {[
                {
                  label: "Goal",
                  value: data.client?.goal || "N/A",
                  color: "text-blue-400",
                  icon: <FaUser />,
                },
                {
                  label: "Current Weight",
                  value:
                    data.client?.weight ? `${data.client.weight} kg` : "N/A",
                  color: "text-green-400",
                  icon: <FaWeight />,
                },
                {
                  label: "Weight Change",
                  value: weightChange !== null ? `${weightChange} kg` : "N/A",
                  color: weightChange < 0 ? "text-green-400" : "text-red-400",
                  icon: <FaWeight />,
                },
                {
                  label: "Avg Protein",
                  value: avgProtein ? `${avgProtein}g` : "N/A",
                  color: "text-purple-400",
                  icon: <FaAppleAlt />,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className='bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3'>
                  <div className={`text-xl ${s.color}`}>{s.icon}</div>
                  <div>
                    <p className='text-slate-400 text-xs'>{s.label}</p>
                    <p className={`font-bold capitalize ${s.color}`}>
                      {s.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Weight Chart */}
            <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
              <h2 className='text-white font-semibold mb-4 flex items-center gap-2'>
                <FaWeight className='text-red-400' /> Weight History
              </h2>
              {weightData.length === 0 ?
                <p className='text-slate-400 text-sm'>No data yet.</p>
              : <ResponsiveContainer width='100%' height={220}>
                  <LineChart data={weightData}>
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
                    <Line
                      type='monotone'
                      dataKey='bodyFat'
                      stroke='#f59e0b'
                      strokeWidth={2}
                      dot={false}
                      name='Body Fat %'
                    />
                  </LineChart>
                </ResponsiveContainer>
              }
            </div>

            {/* Calories Chart */}
            <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
              <h2 className='text-white font-semibold mb-4 flex items-center gap-2'>
                <FaFire className='text-orange-400' /> Calories Burned
                <span className='ml-auto text-slate-400 text-sm font-normal'>
                  Total: {totalCal.toLocaleString()} kcal
                </span>
              </h2>
              {calData.length === 0 ?
                <p className='text-slate-400 text-sm'>No data yet.</p>
              : <ResponsiveContainer width='100%' height={220}>
                  <BarChart data={calData}>
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
                <span className='ml-auto text-slate-400 text-sm font-normal'>
                  Avg: {avgProtein ?? "—"}g
                </span>
              </h2>
              {proteinData.length === 0 ?
                <p className='text-slate-400 text-sm'>No data yet.</p>
              : <ResponsiveContainer width='100%' height={220}>
                  <BarChart data={proteinData}>
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
          </>
        )}

        {!loading && !data && selected && (
          <p className='text-slate-400 text-sm'>
            No progress data found for this client.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoachProgress;
