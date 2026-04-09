const statusToColor = {
  pending: "bg-yellow-500/20 text-yellow-300",
  in_progress: "bg-blue-500/20 text-blue-300",
  completed: "bg-emerald-500/20 text-emerald-300",
  skipped: "bg-red-500/20 text-red-300",
  cancelled: "bg-slate-600/20 text-slate-300",
};

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const WorkoutCard = ({ workout, onView }) => {
  const scheduledFor = workout.scheduledFor || workout.assignedAt;
  const coachName =
    workout.coachId?.name || workout.coach?.name || "Your Coach";
  const status = workout.status || "pending";

  return (
    <div className='rounded-3xl border border-white/5 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/60 transition hover:border-white/30'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
            {workout.type || "Workout"}
          </p>
          <h3 className='text-lg font-semibold text-white'>{workout.title}</h3>
          <p className='text-sm text-slate-400'>
            {workout.duration || 0} min • {workout.caloriesBurned || 0} kcal
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusToColor[status] || statusToColor.pending}`}>
          {status.replace("_", " ")}
        </span>
      </div>

      <div className='mt-5 grid gap-3 text-sm text-slate-400 sm:grid-cols-2'>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
            Coach
          </p>
          <p className='text-base font-medium text-white'>{coachName}</p>
        </div>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
            Scheduled
          </p>
          <p className='text-base font-medium text-white'>
            {formatDateTime(scheduledFor)}
          </p>
        </div>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
            Exercises
          </p>
          <p className='text-base font-medium text-white'>
            {workout.exercises?.length || 0}
          </p>
        </div>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
            Type
          </p>
          <p className='text-base font-medium text-white'>
            {workout.type?.replace("_", " ") || "General"}
          </p>
        </div>
      </div>

      <button
        type='button'
        className='mt-6 w-full rounded-2xl border border-white/10 bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm font-semibold uppercase tracking-widest text-slate-900 transition hover:scale-[1.01]'
        onClick={() => onView?.(workout)}>
        View Workout
      </button>
    </div>
  );
};

export default WorkoutCard;
