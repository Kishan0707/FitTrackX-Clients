import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { AuthContext } from "../../context/authContext";
import { getActiveToken } from "../../utils/sessionStorage";
import {
  FaUsers,
  FaUserMd,
  FaWeight,
  FaRulerCombined,
  FaChartLine,
  FaPills,
  FaNotesMedical,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCalendarAlt,
  FaFire,
  FaAppleAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEllipsisV,
  FaChevronDown,
  FaChevronUp,
  FaFileMedical,
  FaPercent,
  FaUser,
} from "react-icons/fa";
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
  Cell,
} from "recharts";

const ProgressTracking = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientProgress, setPatientProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Modal states
  const [showAddProgressModal, setShowAddProgressModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // Form states
  const [newProgress, setNewProgress] = useState({
    weight: "",
    bodyFat: "",
    measurements: {
      chest: "",
      waist: "",
      hips: "",
      arms: "",
      thighs: "",
      forearms: "",
      biceps: "",
    },
    notes: "",
    doctorNotes: "",
    symptoms: "",
    dietAdherence: "",
    exerciseAdherence: "",
    overallScore: "",
  });

  const [newGoal, setNewGoal] = useState({
    targetWeight: "",
    targetBodyFat: "",
    targetMeasurements: {
      chest: "",
      waist: "",
      hips: "",
      arms: "",
      thighs: "",
    },
    deadline: "",
    description: "",
    weeklyTarget: "",
    programType: "general_health",
  });

  const [newNote, setNewNote] = useState({
    note: "",
  });

  // Fetch patients
  const fetchPatients = useCallback(async () => {
    try {
      const res = await API.get(API_ENDPOINTS.DOCTORS.PATIENTS);
      if (res.data?.success) {
        const patientsData = res.data.data || [];
        console.log(
          "Fetched patients raw data:",
          JSON.stringify(patientsData, null, 2),
        );
        console.log("First patient structure:", patientsData[0]);
        setPatients(patientsData);
        if (patientsData.length > 0 && !selectedPatient) {
          setSelectedPatient(patientsData[0]);
        }
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(err.response?.data?.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [selectedPatient]);

  // Fetch patient progress
  const fetchPatientProgress = useCallback(
    async (patientId) => {
      if (!patientId) return;
      const cleanPatientId = String(patientId).trim();
      if (!cleanPatientId) return;
      setProgressLoading(true);
      setError(null);
      const endpoint = API_ENDPOINTS.DOCTORS.PATIENT_PROGRESS(cleanPatientId);
      console.log("Fetching progress from endpoint:", endpoint);
      const token = getActiveToken();
      console.log("Token present:", !!token);
      try {
        const res = await API.get(endpoint);
        if (res.data?.success) {
          setPatientProgress(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
        if (err.response) {
          console.error("Status:", err.response.status);
          console.error("Data:", err.response.data);
          console.error("Headers:", err.response.headers);
        }
        const msg =
          err.response?.data?.message ||
          `Request failed with status ${err.response?.status || "unknown"}`;
        setError(msg);
      } finally {
        setProgressLoading(false);
      }
    },
    [API_ENDPOINTS],
  );

  useEffect(() => {
    if (!authLoading && user && user.role !== "doctor") {
      navigate("/unauthorized");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    if (selectedPatient?._id) {
      console.log("Selected patient:", selectedPatient);
      console.log(
        "Using patient ID:",
        selectedPatient._id,
        "Type:",
        typeof selectedPatient._id,
      );
      fetchPatientProgress(selectedPatient._id);
    }
  }, [selectedPatient?._id, fetchPatientProgress]);

  // Add progress entry
  const handleAddProgress = async (e) => {
    e.preventDefault();
    if (!selectedPatient?._id) return;

    try {
      const data = {
        ...newProgress,
        weight: newProgress.weight ? parseFloat(newProgress.weight) : undefined,
        bodyFat:
          newProgress.bodyFat ? parseFloat(newProgress.bodyFat) : undefined,
        dietAdherence:
          newProgress.dietAdherence ?
            parseInt(newProgress.dietAdherence)
          : undefined,
        exerciseAdherence:
          newProgress.exerciseAdherence ?
            parseInt(newProgress.exerciseAdherence)
          : undefined,
        overallScore:
          newProgress.overallScore ?
            parseInt(newProgress.overallScore)
          : undefined,
      };

      const res = await API.post(
        API_ENDPOINTS.DOCTORS.PATIENT_PROGRESS_ENTRY(selectedPatient._id),
        data,
      );
      if (res.data?.success) {
        fetchPatientProgress(selectedPatient._id);
        setShowAddProgressModal(false);
        setNewProgress({
          weight: "",
          bodyFat: "",
          measurements: {
            chest: "",
            waist: "",
            hips: "",
            arms: "",
            thighs: "",
            forearms: "",
            biceps: "",
          },
          notes: "",
          doctorNotes: "",
          symptoms: "",
          dietAdherence: "",
          exerciseAdherence: "",
          overallScore: "",
        });
      }
    } catch (err) {
      console.error("Error adding progress:", err);
    }
  };

  // Update goals
  const handleUpdateGoals = async (e) => {
    e.preventDefault();
    if (!selectedPatient?._id || !patientProgress?._id) return;

    try {
      const res = await API.put(
        API_ENDPOINTS.DOCTORS.PATIENT_PROGRESS_GOALS(selectedPatient._id),
        {
          targetWeight:
            newGoal.targetWeight ? parseFloat(newGoal.targetWeight) : undefined,
          targetBodyFat:
            newGoal.targetBodyFat ?
              parseFloat(newGoal.targetBodyFat)
            : undefined,
          goalDeadline: newGoal.deadline,
          goalDescription: newGoal.description,
          programType: newGoal.programType,
        },
      );
      if (res.data?.success) {
        fetchPatientProgress(selectedPatient._id);
        setShowAddGoalModal(false);
        setNewGoal({
          targetWeight: "",
          targetBodyFat: "",
          targetMeasurements: {
            chest: "",
            waist: "",
            hips: "",
            arms: "",
            thighs: "",
          },
          deadline: "",
          description: "",
          weeklyTarget: "",
          programType: "general_health",
        });
      }
    } catch (err) {
      console.error("Error updating goals:", err);
    }
  };

  // Add doctor note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedPatient?._id || !patientProgress?._id) return;

    try {
      await API.post(
        API_ENDPOINTS.DOCTORS.PATIENT_PROGRESS_NOTE(selectedPatient._id),
        {
          note: newNote.note,
        },
      );
      fetchPatientProgress(selectedPatient._id);
      setShowAddNoteModal(false);
      setNewNote({ note: "" });
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  // Get progress analytics
  const fetchProgressAnalytics = async (patientId) => {
    navigate(`/doctor/patients/${patientId}/progress/analytics`);
  };

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

  if (loading)
    return (
      <DashboardLayout>
        <div className='flex min-h-screen items-center justify-center bg-slate-950'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent'></div>
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout>
        <div className='flex min-h-screen items-center justify-center bg-slate-950'>
          <div className='rounded-xl border border-red-500/30 bg-slate-900 p-6 text-center text-red-400 max-w-2xl'>
            <p className='mb-2 font-semibold'>Error loading progress data</p>
            <p className='text-sm mb-4'>{error}</p>
            {error.includes("403") && (
              <div className='text-left bg-slate-800 p-4 rounded-lg text-sm mt-4'>
                <p className='font-semibold mb-2'>Possible causes:</p>
                <ul className='list-disc pl-5 space-y-1'>
                  <li>
                    You don&apos;t have permission to view this patient&apos;s
                    progress
                  </li>
                  <li>The patient is not assigned to you</li>
                  <li>Your session may have expired</li>
                  <li>Your account role may have changed</li>
                </ul>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className='mt-6 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600'>
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-slate-950 md:p-8'>
        <div className='mx-auto max-w-7xl'>
          {/* Header */}
          <div className='mb-8 flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-white'>
                Patient Progress Tracking
              </h1>
              <p className='text-slate-400 text-sm mt-1'>
                Monitor and manage your patients&apos; health journey
              </p>
            </div>
          </div>

          {patients.length === 0 ?
            <div className='text-center py-12 bg-slate-900 rounded-2xl border border-slate-800'>
              <FaUsers className='mx-auto text-5xl text-slate-600 mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                No patients yet
              </h3>
              <p className='text-slate-400 mb-6'>
                Start by adding patients to track their progress
              </p>
              <button
                onClick={() => navigate("/doctor/patient/new")}
                className='bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition'>
                Add New Patient
              </button>
            </div>
          : <>
              {/* Patient Selector */}
              <div className='mb-8'>
                <label className='text-slate-400 text-sm mb-2 block'>
                  Select Patient
                </label>
                <div className='flex gap-2 flex-wrap'>
                  {patients.map((patient) => (
                    <button
                      key={patient._id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                        selectedPatient?._id === patient._id ?
                          "bg-orange-500 border-orange-500 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                      }`}>
                      <FaUser className='text-sm' />
                      <span className='font-medium'>{patient.name}</span>
                      {patientProgress?.status && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            patientProgress.status === "active" ?
                              "bg-green-500/20 text-green-400"
                            : patientProgress.status === "paused" ?
                              "bg-yellow-500/20 text-yellow-400"
                            : patientProgress.status === "completed" ?
                              "bg-blue-500/20 text-blue-400"
                            : "bg-slate-500/20 text-slate-400"
                          }`}>
                          {patientProgress.status}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {selectedPatient && patientProgress && (
                <>
                  {/* Overview Stats */}
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6'>
                      <div className='flex items-center justify-between mb-4'>
                        <span className='text-slate-400 text-sm'>
                          Program Type
                        </span>
                        <FaTrash className='text-orange-500' />
                      </div>
                      <p className='text-white text-xl font-bold capitalize'>
                        {patientProgress.programType?.replace(/_/g, " ") ||
                          "N/A"}
                      </p>
                    </div>

                    <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6'>
                      <div className='flex items-center justify-between mb-4'>
                        <span className='text-slate-400 text-sm'>
                          Current Weight
                        </span>
                        <FaWeight className='text-green-500' />
                      </div>
                      <p className='text-white text-xl font-bold'>
                        {patientProgress.currentStats?.weight ?
                          `${patientProgress.currentStats.weight} kg`
                        : "N/A"}
                      </p>
                    </div>

                    <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6'>
                      <div className='flex items-center justify-between mb-4'>
                        <span className='text-slate-400 text-sm'>
                          Progress %
                        </span>
                        <FaPercent className='text-blue-500' />
                      </div>
                      <p className='text-white text-xl font-bold'>
                        {patientProgress
                          .calculateWeightProgress()
                          ?.toFixed(1) || 0}
                        %
                      </p>
                    </div>

                    <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6'>
                      <div className='flex items-center justify-between mb-4'>
                        <span className='text-slate-400 text-sm'>
                          Progress Entries
                        </span>
                        <FaChartLine className='text-purple-500' />
                      </div>
                      <p className='text-white text-xl font-bold'>
                        {patientProgress.progressData?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Progress Chart */}
                  {patientProgress.progressData &&
                    patientProgress.progressData.length > 0 && (
                      <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8'>
                        <div className='flex items-center justify-between mb-6'>
                          <h2 className='text-xl font-bold text-white'>
                            Weight Progress
                          </h2>
                          <button
                            onClick={() =>
                              fetchProgressAnalytics(selectedPatient._id)
                            }
                            className='text-orange-500 hover:text-orange-400 text-sm font-medium'>
                            View Full Analytics →
                          </button>
                        </div>
                        <ResponsiveContainer width='100%' height={300}>
                          <LineChart data={patientProgress.progressData}>
                            <CartesianGrid
                              strokeDasharray='3 3'
                              stroke='#334155'
                            />
                            <XAxis
                              dataKey='date'
                              tick={axisStyle}
                              tickFormatter={fmt}
                            />
                            <YAxis tick={axisStyle} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line
                              type='monotone'
                              dataKey='weight'
                              stroke='#f97316'
                              strokeWidth={2}
                              dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                              name='Weight (kg)'
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                  {/* Actions */}
                  <div className='flex gap-4 mb-8'>
                    <button
                      onClick={() => setShowAddProgressModal(true)}
                      className='flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition'>
                      <FaPlus /> Add Progress Entry
                    </button>
                    <button
                      onClick={() => setShowAddGoalModal(true)}
                      className='flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition'>
                      <FaEdit /> Update Goals
                    </button>
                    <button
                      onClick={() => setShowAddNoteModal(true)}
                      className='flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition'>
                      <FaNotesMedical /> Add Note
                    </button>
                    <button
                      onClick={() =>
                        fetchProgressAnalytics(selectedPatient._id)
                      }
                      className='flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition'>
                      <FaChartLine /> View Analytics
                    </button>
                  </div>

                  {/* Recent Progress Entries */}
                  <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8'>
                    <h2 className='text-xl font-bold text-white mb-6'>
                      Recent Progress Entries
                    </h2>
                    {(
                      patientProgress.progressData &&
                      patientProgress.progressData.length > 0
                    ) ?
                      <div className='space-y-4'>
                        {patientProgress.progressData
                          .slice(-5)
                          .reverse()
                          .map((entry, idx) => (
                            <div
                              key={idx}
                              className='bg-slate-800 border border-slate-700 rounded-xl p-4'>
                              <div className='flex items-center justify-between mb-3'>
                                <span className='text-slate-400 text-sm'>
                                  {fmt(entry.date)}
                                </span>
                                {entry.weight && (
                                  <span className='text-orange-500 font-semibold'>
                                    {entry.weight} kg
                                  </span>
                                )}
                              </div>
                              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                                {entry.bodyFat && (
                                  <div>
                                    <span className='text-slate-400'>
                                      Body Fat:{" "}
                                    </span>
                                    <span className='text-white'>
                                      {entry.bodyFat}%
                                    </span>
                                  </div>
                                )}
                                {entry.dietAdherence && (
                                  <div>
                                    <span className='text-slate-400'>
                                      Diet Adherence:{" "}
                                    </span>
                                    <span className='text-white'>
                                      {entry.dietAdherence}/10
                                    </span>
                                  </div>
                                )}
                                {entry.exerciseAdherence && (
                                  <div>
                                    <span className='text-slate-400'>
                                      Exercise Adherence:{" "}
                                    </span>
                                    <span className='text-white'>
                                      {entry.exerciseAdherence}/10
                                    </span>
                                  </div>
                                )}
                                {entry.overallScore && (
                                  <div>
                                    <span className='text-slate-400'>
                                      Overall Score:{" "}
                                    </span>
                                    <span className='text-white'>
                                      {entry.overallScore}/100
                                    </span>
                                  </div>
                                )}
                              </div>
                              {entry.notes && (
                                <p className='text-slate-300 mt-3 text-sm'>
                                  Notes: {entry.notes}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    : <p className='text-slate-400 text-center py-8'>
                        No progress entries yet
                      </p>
                    }
                  </div>

                  {/* Recent Doctor Notes */}
                  {patientProgress.doctorNotes &&
                    patientProgress.doctorNotes.length > 0 && (
                      <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6'>
                        <h2 className='text-xl font-bold text-white mb-6'>
                          Recent Doctor Notes
                        </h2>
                        <div className='space-y-4'>
                          {patientProgress.doctorNotes
                            .slice(-5)
                            .reverse()
                            .map((note, idx) => (
                              <div
                                key={idx}
                                className='bg-slate-800 border border-slate-700 rounded-xl p-4'>
                                <div className='flex items-center gap-2 mb-2'>
                                  <FaNotesMedical className='text-green-500' />
                                  <span className='text-slate-400 text-sm'>
                                    {fmt(note.date)}
                                  </span>
                                </div>
                                <p className='text-slate-300'>{note.note}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Alerts */}
                  {patientProgress.alerts &&
                    patientProgress.alerts.length > 0 && (
                      <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6'>
                        <h2 className='text-xl font-bold text-red-400 mb-6 flex items-center gap-2'>
                          <FaExclamationTriangle /> Alerts(
                          {
                            patientProgress.alerts.filter(
                              (a) => !a.acknowledged,
                            ).length
                          }
                          )
                        </h2>
                        <div className='space-y-4'>
                          {patientProgress.alerts.map((alert, idx) => (
                            <div
                              key={idx}
                              className={`bg-slate-800 border rounded-xl p-4 ${
                                alert.acknowledged ? "border-slate-700" : (
                                  "border-red-500/30 bg-red-500/10"
                                )
                              }`}>
                              <div className='flex items-center justify-between mb-2'>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    alert.type === "warning" ?
                                      "bg-yellow-500/20 text-yellow-400"
                                    : alert.type === "critical" ?
                                      "bg-red-500/20 text-red-400"
                                    : "bg-blue-500/20 text-blue-400"
                                  }`}>
                                  {alert.type}
                                </span>
                                {!alert.acknowledged && (
                                  <span className='text-red-400 text-sm font-semibold'>
                                    UNREAD
                                  </span>
                                )}
                              </div>
                              <p className='text-slate-300'>{alert.message}</p>
                              <span className='text-slate-500 text-sm'>
                                {fmt(alert.date)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </>
              )}
            </>
          }
        </div>

        {/* Add Progress Modal */}
        {showAddProgressModal && (
          <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
            <div className='bg-slate-900 p-6 rounded-2xl w-full max-w-2xl border border-slate-800 max-h-[90vh] overflow-y-auto'>
              <h2 className='text-xl font-bold text-white mb-6'>
                Add Progress Entry
              </h2>
              <form
                onSubmit={handleAddProgress}
                className='grid grid-cols-2 gap-4'>
                {/* Left Column */}
                <div>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Weight (kg)
                  </label>
                  <input
                    type='number'
                    step='0.1'
                    value={newProgress.weight}
                    onChange={(e) =>
                      setNewProgress({
                        ...newProgress,
                        weight: e.target.value,
                      })
                    }
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500'
                  />
                </div>
                <div>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Body Fat (%)
                  </label>
                  <input
                    type='number'
                    step='0.1'
                    value={newProgress.bodyFat}
                    onChange={(e) =>
                      setNewProgress({
                        ...newProgress,
                        bodyFat: e.target.value,
                      })
                    }
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500'
                  />
                </div>
                <div>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Diet Adherence (1-10)
                  </label>
                  <input
                    type='number'
                    min='0'
                    max='10'
                    value={newProgress.dietAdherence}
                    onChange={(e) =>
                      setNewProgress({
                        ...newProgress,
                        dietAdherence: e.target.value,
                      })
                    }
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500'
                  />
                </div>
                <div>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Exercise Adherence (1-10)
                  </label>
                  <input
                    type='number'
                    min='0'
                    max='10'
                    value={newProgress.exerciseAdherence}
                    onChange={(e) =>
                      setNewProgress({
                        ...newProgress,
                        exerciseAdherence: e.target.value,
                      })
                    }
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500'
                  />
                </div>
                <div>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Overall Score (0-100)
                  </label>
                  <input
                    type='number'
                    min='0'
                    max='100'
                    value={newProgress.overallScore}
                    onChange={(e) =>
                      setNewProgress({
                        ...newProgress,
                        overallScore: e.target.value,
                      })
                    }
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500'
                  />
                </div>
                {/* Right Column - Measurements */}
                <div className='col-span-2'>
                  <h3 className='text-white font-semibold mb-3'>
                    Measurements (cm)
                  </h3>
                  <div className='grid grid-cols-3 gap-4'>
                    {Object.entries(newProgress.measurements).map(
                      ([key, value]) => (
                        <div key={key}>
                          <label className='text-slate-400 text-sm mb-2 block capitalize'>
                            {key}
                          </label>
                          <input
                            type='number'
                            step='0.1'
                            value={value}
                            onChange={(e) =>
                              setNewProgress({
                                ...newProgress,
                                measurements: {
                                  ...newProgress.measurements,
                                  [key]: e.target.value,
                                },
                              })
                            }
                            className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500'
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
                {/* Notes */}
                <div className='col-span-2'>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Patient Notes
                  </label>
                  <textarea
                    value={newProgress.notes}
                    onChange={(e) =>
                      setNewProgress({
                        ...newProgress,
                        notes: e.target.value,
                      })
                    }
                    placeholder='Any notes about this progress entry...'
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500 h-24'
                  />
                </div>
                <div className='col-span-2'>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Doctor Notes
                  </label>
                  <textarea
                    value={newProgress.doctorNotes}
                    onChange={(e) =>
                      setNewProgress({
                        ...newProgress,
                        doctorNotes: e.target.value,
                      })
                    }
                    placeholder='Clinical observations...'
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500 h-24'
                  />
                </div>
                {/* Symptoms */}
                <div className='col-span-2'>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Symptoms Reported
                  </label>
                  <input
                    type='text'
                    value={newProgress.symptoms}
                    onChange={(e) =>
                      setNewProgress({
                        ...newProgress,
                        symptoms: e.target.value,
                      })
                    }
                    placeholder='e.g., fatigue, headache, etc.'
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500'
                  />
                </div>
                {/* Modal Actions */}
                <div className='col-span-2 flex justify-end gap-3 mt-4'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowAddProgressModal(false);
                      setNewProgress({
                        weight: "",
                        bodyFat: "",
                        measurements: {
                          chest: "",
                          waist: "",
                          hips: "",
                          arms: "",
                          thighs: "",
                          forearms: "",
                          biceps: "",
                        },
                        notes: "",
                        doctorNotes: "",
                        symptoms: "",
                        dietAdherence: "",
                        exerciseAdherence: "",
                        overallScore: "",
                      });
                    }}
                    className='px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700'>
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold'>
                    Add Progress
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Goal Modal */}
        {showAddGoalModal && (
          <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
            <div className='bg-slate-900 p-6 rounded-2xl w-full max-w-lg border border-slate-800'>
              <h2 className='text-xl font-bold text-white mb-6'>
                Update Patient Goals
              </h2>
              <form onSubmit={handleUpdateGoals} className='space-y-4'>
                <div>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Program Type
                  </label>
                  <select
                    value={newGoal.programType}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        programType: e.target.value,
                      })
                    }
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500'>
                    <option value='weight_loss'>Weight Loss</option>
                    <option value='muscle_gain'>Muscle Gain</option>
                    <option value='maintenance'>Maintenance</option>
                    <option value='medical_condition'>Medical Condition</option>
                    <option value='general_health'>General Health</option>
                  </select>
                </div>
                <div>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Target Weight (kg)
                  </label>
                  <input
                    type='number'
                    step='0.1'
                    value={newGoal.targetWeight}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        targetWeight: e.target.value,
                      })
                    }
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500'
                  />
                </div>
                <div>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Target Body Fat (%)
                  </label>
                  <input
                    type='number'
                    step='0.1'
                    value={newGoal.targetBodyFat}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        targetBodyFat: e.target.value,
                      })
                    }
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500'
                  />
                </div>
                <div>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Target Deadline
                  </label>
                  <input
                    type='date'
                    value={newGoal.deadline}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        deadline: e.target.value,
                      })
                    }
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500'
                  />
                </div>
                <div>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Goal Description
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe the patient's goal..."
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500 h-24'
                  />
                </div>
                <div className='flex justify-end gap-3 mt-6'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowAddGoalModal(false);
                      setNewGoal({
                        targetWeight: "",
                        targetBodyFat: "",
                        targetMeasurements: {
                          chest: "",
                          waist: "",
                          hips: "",
                          arms: "",
                          thighs: "",
                        },
                        deadline: "",
                        description: "",
                        weeklyTarget: "",
                        programType: "general_health",
                      });
                    }}
                    className='px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700'>
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold'>
                    Update Goals
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Note Modal */}
        {showAddNoteModal && (
          <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
            <div className='bg-slate-900 p-6 rounded-2xl w-full max-w-lg border border-slate-800'>
              <h2 className='text-xl font-bold text-white mb-6'>
                Add Doctor Note
              </h2>
              <form onSubmit={handleAddNote} className='space-y-4'>
                <div>
                  <label className='text-slate-400 text-sm mb-2 block'>
                    Note
                  </label>
                  <textarea
                    value={newNote.note}
                    onChange={(e) =>
                      setNewNote({
                        note: e.target.value,
                      })
                    }
                    placeholder='Write a clinical note...'
                    className='w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-orange-500 h-32'
                    required
                  />
                </div>
                <div className='flex justify-end gap-3 mt-6'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowAddNoteModal(false);
                      setNewNote({ note: "" });
                    }}
                    className='px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700'>
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold'>
                    Add Note
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

export default ProgressTracking;
