const WorkoutStats = ({ workouts = [] }) => {
  const total = workouts.length;
  const completed = workouts.filter((w) => w.status === "completed").length;
  const pending = workouts.filter((w) => w.status === "pending").length;
  const inProgress = workouts.filter((w) => w.status === "in_progress").length;
  const compliance = total ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: "Assigned", value: total },
    { label: "Pending", value: pending },
    { label: "In Progress", value: inProgress },
    { label: "Completed", value: completed },
  ];

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className='rounded-2xl border border-white/5 bg-slate-900/50 p-4 shadow-sm shadow-black/40'>
          <p className='text-xs uppercase tracking-widest text-slate-400'>
            {stat.label}
          </p>
          <p className='text-2xl font-semibold text-white mt-2'>{stat.value}</p>
        </div>
      ))}
      <div className='rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 shadow-sm shadow-black/40'>
        <p className='text-xs uppercase tracking-widest text-slate-400'>
          Compliance
        </p>
        <p className='text-2xl font-semibold text-white mt-2'>{compliance}%</p>
      </div>
    </div>
  );
};

export default WorkoutStats;
