import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import {
  FaUsers,
  FaCalendarAlt,
  FaFileMedical,
  FaPills,
  FaAppleAlt,
  FaPlus,
  FaEdit,
  FaSave,
  FaTimes,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTrash,
  FaChartLine,
  FaUserMd,
  FaArrowRight,
} from "react-icons/fa";
import {
  MdOutlineAssessment,
  MdWarning,
  MdError,
  MdCheckCircle,
} from "react-icons/md";

const DIET_TYPE_CONFIG = {
  weight_loss: {
    label: "Weight Loss",
    colorClass: "bg-green-500/20 text-green-400 border-green-500/30",
    bgColor: "bg-green-500/10",
    description: "Calorie deficit for fat reduction",
    icon: FaChartLine,
  },
  muscle_gain: {
    label: "Muscle Gain",
    colorClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    bgColor: "bg-blue-500/10",
    description: "High protein for muscle building",
    icon: MdCheckCircle,
  },
  maintenance: {
    label: "Maintenance",
    colorClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    bgColor: "bg-yellow-500/10",
    description: "Balanced intake for stable weight",
    icon: MdWarning,
  },
  medical_condition: {
    label: "Medical Condition",
    colorClass: "bg-red-500/20 text-red-400 border-red-500/30",
    bgColor: "bg-red-500/10",
    description: "Special dietary requirements",
    icon: MdError,
  },
  general_health: {
    label: "General Health",
    colorClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    bgColor: "bg-purple-500/10",
    description: "Overall wellness focus",
    icon: FaInfoCircle,
  },
};

const MEAL_CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const DoctorDiet = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [dietAssignments, setDietAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filterDiet, setFilterDiet] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [tempDiet, setTempDiet] = useState("");
  const [tempDetails, setTempDetails] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    notes: "",
  });
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  const LOCAL_STORAGE_KEY = "doctor_diet_assignments";

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDietAssignments(parsed);
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
        const assignmentsRes = await API.get(
          API_ENDPOINTS.DOCTORS.PATIENT_PROGRESS,
        );
        const assignments = assignmentsRes.data?.data || {};
        setDietAssignments(assignments);
      } catch (backendErr) {
        console.warn(
          "Diet assignment endpoint not available. Using localStorage fallback.",
          backendErr,
        );
        const localAssignments = loadFromLocalStorage();
        setDietAssignments(localAssignments);
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

  const getPatientDiet = (patientId) => {
    return dietAssignments[patientId] || null;
  };

  const startEditing = (patientId) => {
    const assignment = dietAssignments[patientId];
    setEditingId(patientId);
    setTempDiet(assignment ? assignment.dietType : "general_health");
    setTempDetails({
      calories: assignment?.calories || "",
      protein: assignment?.protein || "",
      carbs: assignment?.carbs || "",
      fat: assignment?.fat || "",
      notes: assignment?.notes || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempDiet("");
    setTempDetails({
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      notes: "",
    });
  };

  const saveDietAssignment = async (patientId) => {
    try {
      setSaving(true);
      const patient = patients.find((p) => p._id === patientId);
      const newAssignment = {
        patientId,
        patientName: patient?.name,
        dietType: tempDiet,
        calories: parseInt(tempDetails.calories) || 0,
        protein: parseInt(tempDetails.protein) || 0,
        carbs: parseInt(tempDetails.carbs) || 0,
        fat: parseInt(tempDetails.fat) || 0,
        notes: tempDetails.notes,
        assignedAt: new Date().toISOString(),
      };

      if (useLocalStorage) {
        const updated = {
          ...dietAssignments,
          [patientId]: newAssignment,
        };
        setDietAssignments(updated);
        saveToLocalStorage(updated);
        setSuccess(`Diet plan saved for ${patient?.name} (local)`);
      } else {
        try {
          await API.post("/diet/assign", newAssignment);

          setDietAssignments((prev) => ({
            ...prev,
            [patientId]: newAssignment,
          }));
          setSuccess(`Diet plan updated for ${patient?.name}`);
        } catch (backendErr) {
          console.warn(
            "Backend unavailable, switching to localStorage mode",
            backendErr,
          );
          const updated = {
            ...dietAssignments,
            [patientId]: newAssignment,
          };
          setDietAssignments(updated);
          saveToLocalStorage(updated);
          setUseLocalStorage(true);
          setSuccess(
            `Diet plan saved locally for ${patient?.name} (backend offline)`,
          );
        }
      }

      setEditingId(null);
      setTempDiet("");
      setTempDetails({
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        notes: "",
      });
    } catch (err) {
      console.error("Error saving diet assignment:", err);
      setError(err.response?.data?.message || "Failed to save diet plan");
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: patients.length,
    weight_loss: Object.values(dietAssignments).filter(
      (d) => d.dietType === "weight_loss",
    ).length,
    muscle_gain: Object.values(dietAssignments).filter(
      (d) => d.dietType === "muscle_gain",
    ).length,
    maintenance: Object.values(dietAssignments).filter(
      (d) => d.dietType === "maintenance",
    ).length,
    medical_condition: Object.values(dietAssignments).filter(
      (d) => d.dietType === "medical_condition",
    ).length,
    general_health: Object.values(dietAssignments).filter(
      (d) => d.dietType === "general_health",
    ).length,
    unassigned: patients.filter((p) => !dietAssignments[p._id]).length,
  };

  const handleClearLocalData = () => {
    if (
      window.confirm(
        "Clear all locally saved diet assignments? This cannot be undone.",
      )
    ) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setDietAssignments({});
      setUseLocalStorage(false);
      setSuccess("Local data cleared");
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const diet = getPatientDiet(patient._id);
    if (filterDiet === "all") return true;
    if (filterDiet === "unassigned") return !diet;
    return diet?.dietType === filterDiet;
  });

  const renderDietBadge = (patient) => {
    const diet = getPatientDiet(patient._id);
    const isEditing = editingId === patient._id;

    if (isEditing) {
      return (
        <select
          value={tempDiet}
          onChange={(e) => setTempDiet(e.target.value)}
          className='bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500'>
          {Object.keys(DIET_TYPE_CONFIG).map((key) => (
            <option key={key} value={key}>
              {DIET_TYPE_CONFIG[key].label}
            </option>
          ))}
        </select>
      );
    }

    if (!diet || !diet.dietType) {
      return <span className='text-slate-500 italic'>Not assigned</span>;
    }

    const config = DIET_TYPE_CONFIG[diet.dietType];
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
              <FaAppleAlt className='text-green-400' />
              Patient Diet Plans
            </h1>
            <p className='text-slate-400 mt-1'>
              Assign and manage dietary plans for your patients based on their
              health conditions and goals
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
        <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
          <div className='bg-slate-900 border border-slate-800 rounded-xl p-4'>
            <p className='text-xs text-slate-400 uppercase tracking-wider'>
              Total Patients
            </p>
            <p className='text-2xl font-bold text-white mt-2'>{stats.total}</p>
          </div>
          <div className='bg-slate-900 border border-green-500/30 rounded-xl p-4'>
            <p className='text-xs text-green-400 uppercase tracking-wider'>
              Weight Loss
            </p>
            <p className='text-2xl font-bold text-green-400 mt-2'>
              {stats.weight_loss}
            </p>
          </div>
          <div className='bg-slate-900 border border-blue-500/30 rounded-xl p-4'>
            <p className='text-xs text-blue-400 uppercase tracking-wider'>
              Muscle Gain
            </p>
            <p className='text-2xl font-bold text-blue-400 mt-2'>
              {stats.muscle_gain}
            </p>
          </div>
          <div className='bg-slate-900 border border-yellow-500/30 rounded-xl p-4'>
            <p className='text-xs text-yellow-400 uppercase tracking-wider'>
              Maintenance
            </p>
            <p className='text-2xl font-bold text-yellow-400 mt-2'>
              {stats.maintenance}
            </p>
          </div>
          <div className='bg-slate-900 border border-red-500/30 rounded-xl p-4'>
            <p className='text-xs text-red-400 uppercase tracking-wider'>
              Medical
            </p>
            <p className='text-2xl font-bold text-red-400 mt-2'>
              {stats.medical_condition}
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
        </div>

        {/* localStorage mode indicator */}
        {useLocalStorage && (
          <div className='p-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 flex items-start gap-3'>
            <FaExclamationTriangle className='text-yellow-400 mt-0.5' />
            <div className='flex-1'>
              <p className='font-semibold'>
                Backend Offline – Using Local Storage
              </p>
              <p className='text-sm'>
                Diet assignments are being saved locally in your browser.
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
              "weight_loss",
              "muscle_gain",
              "maintenance",
              "medical_condition",
              "general_health",
            ].map((diet) => (
              <button
                key={diet}
                onClick={() => setFilterDiet(diet)}
                className={
                  " px-4 py-2 md:py-3 rounded font-medium transition " +
                  (filterDiet === diet ?
                    "bg-purple-600 text-white"
                  : "bg-slate-900 border border-slate-700 text-slate-300 hover:border-purple-500")
                }>
                {diet === "all" ?
                  "All Patients"
                : diet === "unassigned" ?
                  "Unassigned"
                : DIET_TYPE_CONFIG[diet]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patients Table */}
        {filteredPatients.length === 0 ?
          <div className='text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl'>
            <FaAppleAlt className='mx-auto text-5xl text-slate-600 mb-4' />
            <h3 className='text-xl font-semibold text-white mb-2'>
              No patients found
            </h3>
            <p className='text-slate-400'>
              {filterDiet === "unassigned" ?
                "All patients have been assigned a diet plan"
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
                      Diet Plan
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Daily Calories
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Macros (g)
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
                    const diet = getPatientDiet(patient._id);
                    return (
                      <tr
                        key={patient._id}
                        className='hover:bg-slate-800/50 transition'>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold'>
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
                          {renderDietBadge(patient)}
                        </td>

                        <td className='px-6 py-4'>
                          {editingId === patient._id ?
                            <input
                              type='number'
                              value={tempDetails.calories}
                              onChange={(e) =>
                                setTempDetails({
                                  ...tempDetails,
                                  calories: e.target.value,
                                })
                              }
                              placeholder='kcal'
                              className='w-24 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500'
                            />
                          : <span className='text-slate-300 font-medium'>
                              {diet?.calories ? `${diet.calories} kcal` : "-"}
                            </span>
                          }
                        </td>

                        <td className='px-6 py-4'>
                          {editingId === patient._id ?
                            <div className='grid grid-cols-3 gap-1'>
                              <input
                                type='number'
                                value={tempDetails.protein}
                                onChange={(e) =>
                                  setTempDetails({
                                    ...tempDetails,
                                    protein: e.target.value,
                                  })
                                }
                                placeholder='P'
                                className='w-full bg-slate-800 border border-slate-600 rounded px-1 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500'
                              />
                              <input
                                type='number'
                                value={tempDetails.carbs}
                                onChange={(e) =>
                                  setTempDetails({
                                    ...tempDetails,
                                    carbs: e.target.value,
                                  })
                                }
                                placeholder='C'
                                className='w-full bg-slate-800 border border-slate-600 rounded px-1 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500'
                              />
                              <input
                                type='number'
                                value={tempDetails.fat}
                                onChange={(e) =>
                                  setTempDetails({
                                    ...tempDetails,
                                    fat: e.target.value,
                                  })
                                }
                                placeholder='F'
                                className='w-full bg-slate-800 border border-slate-600 rounded px-1 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500'
                              />
                            </div>
                          : <span className='text-slate-300 text-sm'>
                              {diet?.protein || diet?.carbs || diet?.fat ?
                                `${diet.protein || 0}P / ${diet.carbs || 0}C / ${diet.fat || 0}F`
                              : "-"}
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
                              placeholder='Diet notes...'
                              rows={2}
                              className='w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none'
                            />
                          : <p className='text-sm text-slate-400 truncate max-w-xs'>
                              {diet?.notes || "-"}
                            </p>
                          }
                        </td>

                        <td className='px-6 py-4 text-slate-300 text-sm'>
                          {diet?.assignedAt ?
                            new Date(diet.assignedAt).toLocaleDateString(
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
                                onClick={() => saveDietAssignment(patient._id)}
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
                              className='flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition font-medium text-sm'>
                              <FaEdit size={12} />
                              {diet ? "Update" : "Assign"}
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
              <div className='p-2 bg-green-500/10 rounded-lg text-green-400'>
                <FaAppleAlt size={20} />
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>
                  What is Diet Planning?
                </h3>
                <p className='text-sm text-slate-400'>
                  Create personalized meal plans and nutritional guidelines for
                  patients based on their health conditions, goals, and dietary
                  preferences.
                </p>
              </div>
            </div>
          </div>

          <div className='bg-slate-900 border border-slate-800 rounded-xl p-5'>
            <div className='flex items-start gap-3'>
              <div className='p-2 bg-blue-500/10 rounded-lg text-blue-400'>
                <FaChartLine size={20} />
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>Diet Types</h3>
                <div className='text-sm text-slate-400 space-y-1 mt-2'>
                  <p>
                    <span className='text-green-400 font-medium'>●</span> Weight
                    Loss: Calorie deficit
                  </p>
                  <p>
                    <span className='text-blue-400 font-medium'>●</span> Muscle
                    Gain: High protein
                  </p>
                  <p>
                    <span className='text-yellow-400 font-medium'>●</span>{" "}
                    Maintenance: Balanced intake
                  </p>
                  <p>
                    <span className='text-red-400 font-medium'>●</span> Medical:
                    Special requirements
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-slate-900 border border-slate-800 rounded-xl p-5'>
            <div className='flex items-start gap-3'>
              <div className='p-2 bg-purple-500/10 rounded-lg text-purple-400'>
                <MdCheckCircle size={20} />
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>
                  Track Adherence
                </h3>
                <p className='text-sm text-slate-400'>
                  Use the Progress Tracking feature to monitor patient diet
                  adherence and adjust plans based on their progress and
                  feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDiet;
