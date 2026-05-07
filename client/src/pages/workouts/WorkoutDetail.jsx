import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaDumbbell,
  FaClock,
  FaFire,
  FaCopy,
  FaPlay,
  FaCheck,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (!id) return;

    const fetchWorkout = async () => {
      try {
        const res = await API.get(`/workouts/${id}`);
        setWorkout(res.data.data);
      } catch (error) {
        console.error("Failed to fetch workout:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  useEffect(() => {
    if (user?.role === "coach") {
      const fetchClients = async () => {
        try {
          const res = await API.get("/coach/clients");
          setClients(res.data.data || []);
        } catch (error) {
          console.error("Failed to fetch clients:", error);
        }
      };
      fetchClients();
    }
  }, [user]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await API.post("/workouts/assign", {
        workoutId: id,
        clientId: selectedClient,
        dueDate: new Date().toISOString().split("T")[0],
      });
      alert("Workout assigned successfully!");
      setShowAssignModal(false);
      setSelectedClient("");
    } catch (error) {
      console.error("Failed to assign:", error);
      alert(error.response?.data?.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this workout?")) return;
    try {
      await API.delete(`/workouts/${id}`);
      navigate("/workouts");
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex h-64 items-center justify-center'>
          <div className='h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500'></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!workout) {
    return (
      <DashboardLayout>
        <div className='flex h-64 flex-col items-center justify-center'>
          <p className='text-red-400'>Workout not found</p>
          <button
            onClick={() => navigate("/workouts")}
            className='mt-2 text-orange-500 hover:underline'>
            Back to Workouts
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6 p-4 md:p-8'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <button
              onClick={() => navigate("/workouts")}
              className='mb-2 text-sm text-blue-500 hover:underline'>
              ← Back to Workouts
            </button>
            <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
              {workout.title || "Workout Details"}
            </h1>
            {workout.description && (
              <p className='mt-1 text-slate-600 dark:text-slate-400'>
                {workout.description}
              </p>
            )}
          </div>
          <div className='flex gap-2'>
            {user?.role === "coach" && (
              <>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700'>
                  <FaCopy size={14} />
                  Assign
                </button>
                <button
                  onClick={handleDelete}
                  className='flex items-center gap-2 rounded-lg border border-red-500 bg-red-500/10 px-4 py-2 text-red-400 transition hover:bg-red-500/20'>
                  <FaTrash size={14} />
                  Delete
                </button>
              </>
            )}
            {user?.role === "user" && (
              <button className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700'>
                <FaPlay size={14} />
                Log Workout
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>Duration</p>
            <p className='mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white'>
              <FaClock className='text-blue-500' />
              {workout.duration || 0} min
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Calories Burned
            </p>
            <p className='mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white'>
              <FaFire className='text-orange-500' />
              {workout.caloriesBurned || 0}
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Difficulty
            </p>
            <p className='mt-1 text-2xl font-bold text-slate-900 dark:text-white'>
              {workout.difficulty || "Medium"}
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>Type</p>
            <p className='mt-1 text-2xl font-bold text-slate-900 dark:text-white'>
              {workout.type || "General"}
            </p>
          </div>
        </div>

        {/* Description */}
        {workout.instructions && (
          <div className='rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
            <h3 className='mb-3 text-lg font-semibold text-slate-900 dark:text-white'>
              Instructions
            </h3>
            <p className='whitespace-pre-wrap text-slate-700 dark:text-slate-300'>
              {workout.instructions}
            </p>
          </div>
        )}

        {/* Exercises */}
        {workout.exercises && workout.exercises.length > 0 && (
          <div className='rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
            <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-white'>
              Exercises
            </h3>
            <div className='space-y-3'>
              {workout.exercises.map((ex, idx) => (
                <div
                  key={ex._id || idx}
                  className='flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700'>
                  <div>
                    <p className='font-medium text-slate-900 dark:text-white'>
                      {ex.name}
                    </p>
                    <p className='text-sm text-slate-600 dark:text-slate-400'>
                      {ex.sets} sets × {ex.reps} reps
                      {ex.rest ? ` • Rest ${ex.rest}s` : ""}
                    </p>
                  </div>
                  <span className='text-slate-500'>#{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-xl font-bold text-slate-900 dark:text-white'>
                  Assign to Client
                </h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className='text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'>
                  ✕
                </button>
              </div>
              <form onSubmit={handleAssign} className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Select Client
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    required
                    className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'>
                    <option value=''>Choose a client...</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex justify-end gap-3'>
                  <button
                    type='button'
                    onClick={() => setShowAssignModal(false)}
                    className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'>
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={assigning || !selectedClient}
                    className='flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white transition hover:bg-green-700 disabled:opacity-50'>
                    <FaCheck size={14} />
                    {assigning ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkoutDetail;
