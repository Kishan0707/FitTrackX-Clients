import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import {
  FaUsers,
  FaDumbbell,
  FaRunning,
  FaPlus,
  FaEdit,
  FaSave,
  FaTimes,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTrash,
  FaCalendarAlt,
  FaFire,
  FaHeartbeat,
  FaClock,
  FaUserMd,
} from "react-icons/fa";
import {
  MdOutlineAssessment,
  MdWarning,
  MdError,
  MdCheckCircle,
  MdFitnessCenter,
} from "react-icons/md";

const WORKOUT_TYPE_CONFIG = {
  cardio: {
    label: "Cardio",
    colorClass: "bg-red-500/20 text-red-400 border-red-500/30",
    bgColor: "bg-red-500/10",
    description: "Cardiovascular endurance training",
    icon: FaRunning,
  },
  strength: {
    label: "Strength",
    colorClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    bgColor: "bg-blue-500/10",
    description: "Resistance and weight training",
    icon: FaDumbbell,
  },
  flexibility: {
    label: "Flexibility",
    colorClass: "bg-green-500/20 text-green-400 border-green-500/30",
    bgColor: "bg-green-500/10",
    description: "Stretching and mobility work",
    icon: FaHeartbeat,
  },
  hiit: {
    label: "HIIT",
    colorClass: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    bgColor: "bg-orange-500/10",
    description: "High-intensity interval training",
    icon: FaFire,
  },
  recovery: {
    label: "Recovery",
    colorClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    bgColor: "bg-purple-500/10",
    description: "Active recovery and rest",
    icon: FaClock,
  },
  custom: {
    label: "Custom",
    colorClass: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    bgColor: "bg-slate-500/10",
    description: "Tailored workout plan",
    icon: MdFitnessCenter,
  },
};

const WorkoutOverrides = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [workoutAssignments, setWorkoutAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filterWorkout, setFilterWorkout] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [tempWorkout, setTempWorkout] = useState("");
  const [tempDetails, setTempDetails] = useState({
    duration: "",
    intensity: "",
    sets: "",
    reps: "",
    weight: "",
    distance: "",
    notes: "",
    frequency: "",
    restDays: [],
  });
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  const LOCAL_STORAGE_KEY = "doctor_workout_overrides";
  const REST_DAYS_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setWorkoutAssignments(parsed);
        return parsed;
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
    return {};
  };

  const saveToLocalStorage = (assignments) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  };

  const fetchPatients = useCallback(async (searchTerm = "") => {
    try {
      const res = await API.get(
        `${API_ENDPOINTS.DOCTORS.PATIENTS}?search=${searchTerm}`,
      );
      const patientsList = res.data?.data || [];
      setPatients(patientsList);

      try {
        const assignmentsRes = await API.get(API_ENDPOINTS.PROGRESS.SUMMARY);
        const assignments = assignmentsRes.data?.data || {};
        setWorkoutAssignments(assignments);
      } catch (backendErr) {
        console.warn(
          "Workout assignment endpoint not available. Using localStorage fallback.",
          backendErr,
        );
        const localAssignments = loadFromLocalStorage();
        setWorkoutAssignments(localAssignments);
        setUseLocalStorage(true);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
    const localData = loadFromLocalStorage();
    if (Object.keys(localData).length > 0) {
      setUseLocalStorage(true);
    }
  }, [fetchPatients]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchPatients(e.target.value);
  };

  const getPatientWorkout = (patientId) => {
    return workoutAssignments[patientId] || null;
  };

  const startEditing = (patientId) => {
    const assignment = workoutAssignments[patientId];
    setEditingId(patientId);
    setTempWorkout(assignment ? assignment.workoutType : "cardio");
    setTempDetails({
      duration: assignment?.duration || "",
      intensity: assignment?.intensity || "",
      sets: assignment?.sets || "",
      reps: assignment?.reps || "",
      weight: assignment?.weight || "",
      distance: assignment?.distance || "",
      notes: assignment?.notes || "",
      frequency: assignment?.frequency || "3",
      restDays: assignment?.restDays || [],
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempWorkout("");
    setTempDetails({
      duration: "",
      intensity: "",
      sets: "",
      reps: "",
      weight: "",
      distance: "",
      notes: "",
      frequency: "",
      restDays: [],
    });
  };

  const toggleRestDay = (day) => {
    setTempDetails((prev) => ({
      ...prev,
      restDays:
        prev.restDays.includes(day) ?
          prev.restDays.filter((d) => d !== day)
        : [...prev.restDays, day],
    }));
  };

  const saveWorkoutOverride = async (patientId) => {
    try {
      setSaving(true);
      const patient = patients.find((p) => p._id === patientId);
      const newAssignment = {
        patientId,
        patientName: patient?.name,
        workoutType: tempWorkout,
        duration: parseInt(tempDetails.duration) || 0,
        intensity: tempDetails.intensity,
        sets: parseInt(tempDetails.sets) || 0,
        reps: parseInt(tempDetails.reps) || 0,
        weight: parseFloat(tempDetails.weight) || 0,
        distance: parseFloat(tempDetails.distance) || 0,
        notes: tempDetails.notes,
        frequency: parseInt(tempDetails.frequency) || 3,
        restDays: tempDetails.restDays,
        assignedAt: new Date().toISOString(),
      };

      if (useLocalStorage) {
        const updated = {
          ...workoutAssignments,
          [patientId]: newAssignment,
        };
        setWorkoutAssignments(updated);
        saveToLocalStorage(updated);
        setSuccess(`Workout plan saved for ${patient?.name} (local)`);
      } else {
        try {
          await API.post(API_ENDPOINTS.WORKOUTS.ASSIGN, newAssignment);

          setWorkoutAssignments((prev) => ({
            ...prev,
            [patientId]: newAssignment,
          }));
          setSuccess(`Workout plan updated for ${patient?.name}`);
        } catch (backendErr) {
          console.warn(
            "Backend unavailable, switching to localStorage mode",
            backendErr,
          );
          const updated = {
            ...workoutAssignments,
            [patientId]: newAssignment,
          };
          setWorkoutAssignments(updated);
          saveToLocalStorage(updated);
          setUseLocalStorage(true);
          setSuccess(
            `Workout plan saved locally for ${patient?.name} (backend offline)`,
          );
        }
      }

      setEditingId(null);
      setTempWorkout("");
      setTempDetails({
        duration: "",
        intensity: "",
        sets: "",
        reps: "",
        weight: "",
        distance: "",
        notes: "",
        frequency: "",
        restDays: [],
      });
    } catch (err) {
      console.error("Error saving workout assignment:", err);
      setError(err.response?.data?.message || "Failed to save workout plan");
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: patients.length,
    cardio: Object.values(workoutAssignments).filter(
      (w) => w.workoutType === "cardio",
    ).length,
    strength: Object.values(workoutAssignments).filter(
      (w) => w.workoutType === "strength",
    ).length,
    flexibility: Object.values(workoutAssignments).filter(
      (w) => w.workoutType === "flexibility",
    ).length,
    hiit: Object.values(workoutAssignments).filter(
      (w) => w.workoutType === "hiit",
    ).length,
    recovery: Object.values(workoutAssignments).filter(
      (w) => w.workoutType === "recovery",
    ).length,
    custom: Object.values(workoutAssignments).filter(
      (w) => w.workoutType === "custom",
    ).length,
    unassigned: patients.filter((p) => !workoutAssignments[p._id]).length,
  };

  const handleClearLocalData = () => {
    if (
      window.confirm(
        "Clear all locally saved workout assignments? This cannot be undone.",
      )
    ) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setWorkoutAssignments({});
      setUseLocalStorage(false);
      setSuccess("Local data cleared");
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const workout = getPatientWorkout(patient._id);
    if (filterWorkout === "all") return true;
    if (filterWorkout === "unassigned") return !workout;
    return workout?.workoutType === filterWorkout;
  });

  const renderWorkoutBadge = (patient) => {
    const workout = getPatientWorkout(patient._id);
    const isEditing = editingId === patient._id;

    if (isEditing) {
      return (
        <select
          value={tempWorkout}
          onChange={(e) => setTempWorkout(e.target.value)}
          className='bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500'>
          {Object.keys(WORKOUT_TYPE_CONFIG).map((key) => (
            <option key={key} value={key}>
              {WORKOUT_TYPE_CONFIG[key].label}
            </option>
          ))}
        </select>
      );
    }

    if (!workout || !workout.workoutType) {
      return <span className='text-slate-500 italic'>Not assigned</span>;
    }

    const config = WORKOUT_TYPE_CONFIG[workout.workoutType];
    const Icon = config.icon;
    return (
      <div className='flex items-center gap-2'>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium flex items-center gap-1 ${config.colorClass}`}>
          <Icon size={12} />
          {config.label}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex justify-center items-center h-screen bg-slate-950'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500' />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='p-4 md:p-8 space-y-6 bg-slate-950 min-h-screen'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold text-white flex items-center gap-3'>
              <FaDumbbell className='text-orange-400' />
              Workout Overrides
            </h1>
            <p className='text-slate-400 mt-1'>
              Override and customize workout plans for your patients based on
              their health conditions and progress
            </p>
          </div>
          <button
            onClick={() => navigate("/doctor/patients")}
            className='flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition'>
            <FaUsers /> Manage Patients
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className='p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 flex items-start gap-3'>
            <FaExclamationTriangle className='text-red-400 mt-0.5' />
            <div>
              <p className='font-semibold'>Error</p>
              <p className='text-sm'>{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className='ml-auto text-red-400 hover:text-red-300'>
              <FaTimes />
            </button>
          </div>
        )}
        {success && (
          <div className='p-4 rounded-lg border border-green-500/40 bg-green-500/10 text-green-200 flex items-start gap-3'>
            <FaCheckCircle className='text-green-400 mt-0.5' />
            <div>
              <p className='font-semibold'>Success</p>
              <p className='text-sm'>{success}</p>
            </div>
            <button
              onClick={() => setSuccess("")}
              className='ml-auto text-green-400 hover:text-green-300'>
              <FaTimes />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='bg-slate-900 border border-slate-800 rounded-xl p-4'>
            <p className='text-xs text-slate-400 uppercase tracking-wider'>
              Total Patients
            </p>
            <p className='text-2xl font-bold text-white mt-2'>{stats.total}</p>
          </div>
          <div className='bg-slate-900 border border-red-500/30 rounded-xl p-4'>
            <p className='text-xs text-red-400 uppercase tracking-wider'>
              Cardio
            </p>
            <p className='text-2xl font-bold text-red-400 mt-2'>
              {stats.cardio}
            </p>
          </div>
          <div className='bg-slate-900 border border-blue-500/30 rounded-xl p-4'>
            <p className='text-xs text-blue-400 uppercase tracking-wider'>
              Strength
            </p>
            <p className='text-2xl font-bold text-blue-400 mt-2'>
              {stats.strength}
            </p>
          </div>
          <div className='bg-slate-900 border border-slate-700 rounded-xl p-4'>
            <p className='text-xs text-slate-400 uppercase tracking-wider'>
              Unassigned
            </p>
            <p className='text-2xl font-bold text-slate-400 mt-2'>
              {stats.unassigned}
            </p>
          </div>
          <div className='bg-slate-900 border border-green-500/30 rounded-xl p-4'>
            <p className='text-xs text-green-400 uppercase tracking-wider'>
              Flexibility
            </p>
            <p className='text-2xl font-bold text-green-400 mt-2'>
              {stats.flexibility}
            </p>
          </div>
          <div className='bg-slate-900 border border-orange-500/30 rounded-xl p-4'>
            <p className='text-xs text-orange-400 uppercase tracking-wider'>
              HIIT
            </p>
            <p className='text-2xl font-bold text-orange-400 mt-2'>
              {stats.hiit}
            </p>
          </div>
          <div className='bg-slate-900 border border-purple-500/30 rounded-xl p-4'>
            <p className='text-xs text-purple-400 uppercase tracking-wider'>
              Recovery
            </p>
            <p className='text-2xl font-bold text-purple-400 mt-2'>
              {stats.recovery}
            </p>
          </div>
          <div className='bg-slate-900 border border-slate-500/30 rounded-xl p-4'>
            <p className='text-xs text-slate-400 uppercase tracking-wider'>
              Custom
            </p>
            <p className='text-2xl font-bold text-slate-400 mt-2'>
              {stats.custom}
            </p>
          </div>
        </div>

        {/* localStorage mode indicator */}
        {useLocalStorage && (
          <div className='p-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 flex items-start gap-3'>
            <FaExclamationTriangle className='text-yellow-400 mt-0.5' />
            <div className='flex-1'>
              <p className='font-semibold'>
                Backend Offline - Using Local Storage
              </p>
              <p className='text-sm'>
                Workout assignments are being saved locally in your browser.
                Connect the backend server to sync data permanently.
              </p>
            </div>
            <button
              onClick={handleClearLocalData}
              className='px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded text-xs font-medium transition'>
              Clear Local Data
            </button>
          </div>
        )}

        {/* Filters */}
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-2 flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500'>
            <FaSearch className='text-slate-400' />
            <input
              type='text'
              placeholder='Search patients by name or email...'
              value={search}
              onChange={handleSearch}
              className='w-full bg-slate-800 shadow border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
          <div className='flex text-xs gap-2 overflow-scroll w-full'>
            {[
              "all",
              "unassigned",
              "cardio",
              "strength",
              "flexibility",
              "hiit",
              "recovery",
              "custom",
            ].map((type) => (
              <button
                key={type}
                onClick={() => setFilterWorkout(type)}
                className={
                  " px-4 py-2 md:py-3 rounded font-medium transition " +
                  (filterWorkout === type ?
                    "bg-purple-600 text-white"
                  : "bg-slate-900 border border-slate-700 text-slate-300 hover:border-purple-500")
                }>
                {type === "all" ?
                  "All Patients"
                : type === "unassigned" ?
                  "Unassigned"
                : WORKOUT_TYPE_CONFIG[type]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patients Table */}
        {filteredPatients.length === 0 ?
          <div className='text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl'>
            <FaDumbbell className='mx-auto text-5xl text-slate-600 mb-4' />
            <h3 className='text-xl font-semibold text-white mb-2'>
              No patients found
            </h3>
            <p className='text-slate-400'>
              {filterWorkout === "unassigned" ?
                "All patients have been assigned a workout plan"
              : "Try adjusting your search or filter"}
            </p>
          </div>
        : <div className='bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-slate-800/50'>
                  <tr>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Patient
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Workout Type
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Duration / Details
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Frequency
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Intensity
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Notes
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Assigned At
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-800'>
                  {filteredPatients.map((patient) => {
                    const workout = getPatientWorkout(patient._id);
                    return (
                      <tr
                        key={patient._id}
                        className='hover:bg-slate-800/50 transition'>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-semibold'>
                              {patient.name?.charAt(0) || "P"}
                            </div>
                            <div>
                              <p className='font-medium text-white'>
                                {patient.name}
                              </p>
                              <p className='text-sm text-slate-400'>
                                {patient.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className='px-6 py-4'>
                          {renderWorkoutBadge(patient)}
                        </td>

                        <td className='px-6 py-4'>
                          {editingId === patient._id ?
                            <div className='space-y-2'>
                              <input
                                type='number'
                                placeholder='Duration (min)'
                                value={tempDetails.duration}
                                onChange={(e) =>
                                  setTempDetails({
                                    ...tempDetails,
                                    duration: e.target.value,
                                  })
                                }
                                className='w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500'
                              />
                              <input
                                type='number'
                                placeholder='Sets'
                                value={tempDetails.sets}
                                onChange={(e) =>
                                  setTempDetails({
                                    ...tempDetails,
                                    sets: e.target.value,
                                  })
                                }
                                className='w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500'
                              />
                              <input
                                type='number'
                                placeholder='Reps'
                                value={tempDetails.reps}
                                onChange={(e) =>
                                  setTempDetails({
                                    ...tempDetails,
                                    reps: e.target.value,
                                  })
                                }
                                className='w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500'
                              />
                            </div>
                          : <span className='text-slate-300 text-sm'>
                              {workout?.duration ?
                                `${workout.duration} min`
                              : "-"}
                              {workout?.sets && workout?.reps ?
                                ` | ${workout.sets}×${workout.reps}`
                              : ""}
                            </span>
                          }
                        </td>

                        <td className='px-6 py-4'>
                          {editingId === patient._id ?
                            <select
                              value={tempDetails.frequency}
                              onChange={(e) =>
                                setTempDetails({
                                  ...tempDetails,
                                  frequency: e.target.value,
                                })
                              }
                              className='w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500'>
                              <option value='1'>1x per week</option>
                              <option value='2'>2x per week</option>
                              <option value='3'>3x per week</option>
                              <option value='4'>4x per week</option>
                              <option value='5'>5x per week</option>
                              <option value='6'>6x per week</option>
                              <option value='7'>Daily</option>
                            </select>
                          : <span className='text-slate-300 text-sm'>
                              {workout?.frequency ?
                                `${workout.frequency}x/week`
                              : "-"}
                            </span>
                          }
                        </td>

                        <td className='px-6 py-4'>
                          {editingId === patient._id ?
                            <select
                              value={tempDetails.intensity}
                              onChange={(e) =>
                                setTempDetails({
                                  ...tempDetails,
                                  intensity: e.target.value,
                                })
                              }
                              className='w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500'>
                              <option value=''>Select...</option>
                              <option value='low'>Low</option>
                              <option value='moderate'>Moderate</option>
                              <option value='high'>High</option>
                            </select>
                          : <span className='text-slate-300 text-sm capitalize'>
                              {workout?.intensity || "-"}
                            </span>
                          }
                        </td>

                        <td className='px-6 py-4'>
                          {editingId === patient._id ?
                            <textarea
                              value={tempDetails.notes}
                              onChange={(e) =>
                                setTempDetails({
                                  ...tempDetails,
                                  notes: e.target.value,
                                })
                              }
                              placeholder='Override notes...'
                              rows={2}
                              className='w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none'
                            />
                          : <p className='text-sm text-slate-400 truncate max-w-xs'>
                              {workout?.notes || "-"}
                            </p>
                          }
                        </td>

                        <td className='px-6 py-4 text-slate-300 text-sm'>
                          {workout?.assignedAt ?
                            new Date(workout.assignedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                        </td>

                        <td className='px-6 py-4'>
                          {editingId === patient._id ?
                            <div className='flex gap-2'>
                              <button
                                onClick={() => saveWorkoutOverride(patient._id)}
                                disabled={saving}
                                className='p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition'
                                title='Save'>
                                <FaSave />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className='p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition'
                                title='Cancel'>
                                <FaTimes />
                              </button>
                            </div>
                          : <button
                              onClick={() => startEditing(patient._id)}
                              className='flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/30 transition font-medium text-sm'>
                              <FaEdit size={12} />
                              {workout ? "Update" : "Assign"}
                            </button>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        }

        {/* Info Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-slate-900 border border-slate-800 rounded-xl p-5'>
            <div className='flex items-start gap-3'>
              <div className='p-2 bg-orange-500/10 rounded-lg text-orange-400'>
                <FaDumbbell size={20} />
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>
                  What are Workout Overrides?
                </h3>
                <p className='text-sm text-slate-400'>
                  Customize and override workout plans for patients based on
                  their medical conditions, injuries, and rehabilitation needs.
                  Ensure safe and effective exercise prescriptions.
                </p>
              </div>
            </div>
          </div>

          <div className='bg-slate-900 border border-slate-800 rounded-xl p-5'>
            <div className='flex items-start gap-3'>
              <div className='p-2 bg-blue-500/10 rounded-lg text-blue-400'>
                <MdFitnessCenter size={20} />
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>
                  Workout Types Available
                </h3>
                <div className='text-sm text-slate-400 space-y-1 mt-2'>
                  <p>
                    <span className='text-red-400 font-medium'>●</span> Cardio:
                    Endurance training
                  </p>
                  <p>
                    <span className='text-blue-400 font-medium'>●</span>{" "}
                    Strength: Resistance work
                  </p>
                  <p>
                    <span className='text-green-400 font-medium'>●</span>{" "}
                    Flexibility: Mobility
                  </p>
                  <p>
                    <span className='text-orange-400 font-medium'>●</span> HIIT:
                    Interval training
                  </p>
                  <p>
                    <span className='text-purple-400 font-medium'>●</span>{" "}
                    Recovery: Active rest
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-slate-900 border border-slate-800 rounded-xl p-5'>
            <div className='flex items-start gap-3'>
              <div className='p-2 bg-green-500/10 rounded-lg text-green-400'>
                <FaCheckCircle size={20} />
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>
                  Medical Considerations
                </h3>
                <p className='text-sm text-slate-400'>
                  Always consider patient limitations, injuries, and medications
                  when prescribing workouts. Monitor progress and adjust
                  intensity based on patient feedback and recovery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkoutOverrides;
