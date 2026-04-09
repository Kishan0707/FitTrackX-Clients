import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const chartColors = [
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#f43f5e",
  "#22c55e",
  "#0ea5e9",
  "#a855f7",
  "#facc15",
];

const WorkoutAnalyticsChart = ({ analytics }) => {
  if (!analytics || !analytics.workoutsByType) {
    return null;
  }

  const labels = Object.keys(analytics.workoutsByType);

  if (!labels.length) {
    return (
      <div className='rounded-2xl border border-white/5 bg-slate-950/50 p-6 text-center text-sm text-slate-400'>
        No analytics data available yet.
      </div>
    );
  }

  const dataset = labels.map(
    (label) => analytics.workoutsByType[label].count || 0,
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: dataset,
        backgroundColor: labels.map(
          (_, index) => chartColors[index % chartColors.length],
        ),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className='rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/60 p-6 shadow-lg shadow-slate-950/60'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            Workout Type Mix
          </p>
          <h3 className='text-lg font-semibold text-white'>
            {analytics.totalWorkouts} workouts tracked
          </h3>
        </div>
        <p className='text-sm font-semibold text-emerald-400'>
          Avg {analytics.avgCalories} kcal
        </p>
      </div>
      <div className='mt-5 flex justify-center'>
        <div className='w-48'>
          <Doughnut data={chartData} />
        </div>
      </div>
      <div className='mt-4 grid gap-2 sm:grid-cols-2'>
        {labels.map((label, index) => (
          <div
            key={label}
            className='flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-slate-300'>
            <span
              className='h-3 w-3 rounded-full'
              style={{
                backgroundColor: chartColors[index % chartColors.length],
              }}
            />
            <div className='flex-1'>
              <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
                {label.replace("_", " ")}
              </p>
              <p className='text-base font-semibold text-white'>
                {analytics.workoutsByType[label].count} workouts
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutAnalyticsChart;
