import { useEffect, useMemo, useState } from "react";

import API from "../../services/api";
import WorkoutAnalyticsChart from "./WorkoutAnalyticsChart";
import WorkoutCard from "./WorkoutCard";
import WorkoutDetailModal from "./WorkoutDetailModal";
import WorkoutFilters from "./WorkoutFilters";
import WorkoutProgressWidget from "./WorkoutProgressWidget";
import WorkoutStats from "./WorkoutStats";

const ClientWorkoutPage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [error, setError] = useState("");
  const [progressSummary, setProgressSummary] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/coach/my-workouts");
      setWorkouts(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch assigned workouts right now.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressSummary = async () => {
    try {
      const res = await API.get("/workouts/summary/progress");
      setProgressSummary(res.data?.data || null);
    } catch (err) {
      console.error("Failed to load progress summary:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/workouts/analytics");
      setAnalyticsData(res.data?.data || null);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    fetchProgressSummary();
    fetchAnalytics();
  }, []);

  const filteredWorkouts = useMemo(() => {
    if (activeFilter === "all") return workouts;
    return workouts.filter((w) => w.status === activeFilter);
  }, [activeFilter, workouts]);

  const handleCompleted = (updatedWorkout) => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout._id === updatedWorkout._id ? updatedWorkout : workout,
      ),
    );
    setSelectedWorkout((prev) =>
      prev && prev._id === updatedWorkout._id ? updatedWorkout : prev,
    );
    fetchProgressSummary();
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-white'>My Assigned Workouts</h1>
        <p className='text-sm text-slate-400'>
          Track the workouts your coach assigned, complete them, and keep the
          streak going.
        </p>
      </div>

      <WorkoutStats workouts={workouts} />

      <WorkoutProgressWidget summary={progressSummary} />

      <WorkoutFilters
        activeFilter={activeFilter}
        onChange={setActiveFilter}
      />

      {error && (
        <div className='rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200'>
          {error}
        </div>
      )}

      {loading ? (
        <p className='text-slate-400'>Loading assigned workouts…</p>
      ) : filteredWorkouts.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-center text-slate-400'>
          No assigned workouts yet. Ask your coach to assign one or refresh
          later.
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2'>
          {filteredWorkouts.map((workout) => (
            <WorkoutCard
              key={workout._id}
              workout={workout}
              onView={setSelectedWorkout}
            />
          ))}
        </div>
      )}

      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onCompleted={handleCompleted}
        />
      )}

      {analyticsData && (
        <div className='mt-6'>
          <WorkoutAnalyticsChart analytics={analyticsData} />
        </div>
      )}
    </div>
  );
};

export default ClientWorkoutPage;
