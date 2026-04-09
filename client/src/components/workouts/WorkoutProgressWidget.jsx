const WorkoutProgressWidget = ({ summary }) => {
  if (!summary) return null;

  const {
    totalAssigned,
    completedCount,
    pendingCount,
    inProgressCount,
    completionRate,
    nextWorkout,
    lastCompleted,
    weeklyTrend = [],
  } = summary;

  const maxTrend = Math.max(...weeklyTrend.map((trend) => trend.total), 1);

  return (
    <div className='rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/60 p-6 shadow-lg shadow-slate-950/50'>
      <div className='grid gap-4 md:grid-cols-4'>
        <div className='rounded-2xl border border-white/5 bg-black/40 p-4'>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            Assigned
          </p>
          <p className='text-3xl font-semibold text-white'>{totalAssigned}</p>
        </div>
        <div className='rounded-2xl border border-white/5 bg-black/40 p-4'>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            Completed
          </p>
          <p className='text-3xl font-semibold text-white'>{completedCount}</p>
        </div>
        <div className='rounded-2xl border border-white/5 bg-black/40 p-4'>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            Pending
          </p>
          <p className='text-3xl font-semibold text-white'>{pendingCount}</p>
        </div>
        <div className='rounded-2xl border border-white/5 bg-black/40 p-4'>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            In progress
          </p>
          <p className='text-3xl font-semibold text-white'>{inProgressCount}</p>
        </div>
      </div>

      <div className='mt-6 grid gap-3 md:grid-cols-2'>
        <div className='rounded-2xl border border-white/5 bg-slate-950/60 p-4'>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            Completion rate
          </p>
          <p className='text-3xl font-bold text-white'>{completionRate}%</p>
          <div className='mt-2 h-2 rounded-full bg-white/10'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400'
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        <div className='rounded-2xl border border-white/5 bg-slate-950/60 p-4'>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            Next workout
          </p>
          {nextWorkout ? (
            <>
              <p className='text-base font-semibold text-white'>
                {nextWorkout.title}
              </p>
              <p className='text-sm text-slate-400'>
                {new Date(nextWorkout.scheduledFor).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </>
          ) : (
            <p className='text-sm text-slate-500'>No workout scheduled</p>
          )}
          {lastCompleted && (
            <p className='mt-2 text-xs text-slate-500'>
              Last completed:{" "}
              {lastCompleted.title} on{" "}
              {new Date(lastCompleted.completedAt).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
              })}
            </p>
          )}
        </div>
      </div>

      <div className='mt-6 space-y-3'>
        <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
          Weekly trend
        </p>
        <div className='flex items-end gap-3'>
          {weeklyTrend.map((trend) => {
            const barHeight = Math.max(
              10,
              Math.round((trend.total / maxTrend) * 60) + 10,
            );
            return (
              <div key={trend.day} className='flex flex-col items-center gap-2'>
                <div
                  className='w-6 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500'
                  style={{ height: `${barHeight}px` }}
                />
                <p className='text-xs text-slate-400'>{trend.day}</p>
                <p className='text-xs font-semibold text-white'>
                  {trend.completed}/{trend.total}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutProgressWidget;
