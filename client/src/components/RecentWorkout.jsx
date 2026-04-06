import WorkoutCard from "./WorkoutCard";

const RecentWorkouts = ({ workouts }) => {
  if (!workouts || workouts.length === 0) {
    return (
      <div className='rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-center text-sm text-slate-400'>
        No workouts logged yet. Start your first workout to see activity here.
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3'>
        {workouts.map((workout) => (
          <WorkoutCard key={workout._id} workout={workout} />
        ))}
    </div>
  );
};

export default RecentWorkouts;
