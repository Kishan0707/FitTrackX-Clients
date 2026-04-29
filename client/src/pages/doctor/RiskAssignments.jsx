import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import {
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCheckCircle,
  FaInfoCircle,
  FaSearch,
  FaUserMd,
  FaEdit,
  FaSave,
  FaTimes,
  FaClipboardList,
  FaPlug,
} from "react-icons/fa";
import {
  MdOutlineAssessment,
  MdWarning,
  MdError,
  MdCheckCircle,
} from "react-icons/md";

const RISK_STORAGE_KEY = "doctor_risk_assignments";

const RiskAssignments = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [riskAssignments, setRiskAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [tempRisk, setTempRisk] = useState("");
  const [tempNotes, setTempNotes] = useState("");
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Risk level configuration
  const riskLevels = {
    low: {
      label: "Low Risk",
      colorClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      bgColor: "bg-emerald-500/10",
      description: "No immediate concerns, routine monitoring",
      icon: MdCheckCircle,
    },
    medium: {
      label: "Medium Risk",
      colorClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      bgColor: "bg-yellow-500/10",
      description: "Some concerns, requires attention",
      icon: MdWarning,
    },
    high: {
      label: "High Risk",
      colorClass: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      bgColor: "bg-orange-500/10",
      description: "Significant concerns, prompt action needed",
      icon: FaExclamationTriangle,
    },
    critical: {
      label: "Critical",
      colorClass: "bg-red-500/20 text-red-400 border-red-500/30",
      bgColor: "bg-red-500/10",
      description: "Urgent medical attention required",
      icon: MdError,
    },
  };

  // Load from localStorage (demo/offline mode)
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(RISK_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRiskAssignments(parsed);
        return parsed;
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
    return {};
  };

  // Save to localStorage
  const saveToLocalStorage = (assignments) => {
    try {
      localStorage.setItem(RISK_STORAGE_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  };

  // Fetch patients and their risk assignments
  const fetchPatients = useCallback(async (searchTerm = "") => {
    try {
      const res = await API.get(
        `${API_ENDPOINTS.DOCTORS.PATIENTS}?search=${searchTerm}`,
      );
      const patientsList = res.data?.data || [];
      setPatients(patientsList);

      // Try fetching risk assignments from backend
      try {
        const assignmentsRes = await API.get(
          API_ENDPOINTS.DOCTORS.RISK_ASSIGNMENTS,
        );
        const assignments = assignmentsRes.data?.data || {};
        setRiskAssignments(assignments);
      } catch (backendErr) {
        // Backend endpoint not available - use localStorage fallback
        console.warn(
          "Risk assignment endpoint not available. Using localStorage fallback.",
          backendErr,
        );
        const localAssignments = loadFromLocalStorage();
        setRiskAssignments(localAssignments);
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
    // Check if localStorage has data
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

  const getPatientRisk = (patientId) => {
    return riskAssignments[patientId] || null;
  };

  const startEditing = (patientId) => {
    const assignment = riskAssignments[patientId];
    setEditingId(patientId);
    setTempRisk(assignment ? assignment.riskLevel : "low");
    setTempNotes(assignment ? assignment.notes || "" : "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempRisk("");
    setTempNotes("");
  };

  const saveRiskAssignment = async (patientId) => {
    try {
      setSaving(true);
      const patient = patients.find((p) => p._id === patientId);
      const newAssignment = {
        patientId,
        patientName: patient?.name,
        riskLevel: tempRisk,
        notes: tempNotes,
        assignedAt: new Date().toISOString(),
      };

      if (useLocalStorage) {
        // Save to localStorage
        const updated = {
          ...riskAssignments,
          [patientId]: newAssignment,
        };
        setRiskAssignments(updated);
        saveToLocalStorage(updated);
        setSuccess(`Risk level saved for ${patient?.name} (local)`);
      } else {
        // Try backend
        try {
          await API.post(API_ENDPOINTS.DOCTORS.RISK_ASSIGN, {
            patientId,
            patientName: patient?.name,
            riskLevel: tempRisk,
            notes: tempNotes,
          });

          // Update local state
          setRiskAssignments((prev) => ({
            ...prev,
            [patientId]: newAssignment,
          }));
          setSuccess(`Risk level updated for ${patient?.name}`);
        } catch (backendErr) {
          // Backend failed - fall back to localStorage
          console.warn(
            "Backend unavailable, switching to localStorage mode",
            backendErr,
          );
          const updated = {
            ...riskAssignments,
            [patientId]: newAssignment,
          };
          setRiskAssignments(updated);
          saveToLocalStorage(updated);
          setUseLocalStorage(true);
          setSuccess(
            `Risk level saved locally for ${patient?.name} (backend offline)`,
          );
        }
      }

      setEditingId(null);
      setTempRisk("");
      setTempNotes("");
    } catch (err) {
      console.error("Error saving risk assignment:", err);
      setError(err.response?.data?.message || "Failed to save risk assignment");
    } finally {
      setSaving(false);
    }
  };

  // Statistics
  const stats = {
    total: patients.length,
    low: Object.values(riskAssignments).filter((r) => r.riskLevel === "low")
      .length,
    medium: Object.values(riskAssignments).filter(
      (r) => r.riskLevel === "medium",
    ).length,
    high: Object.values(riskAssignments).filter((r) => r.riskLevel === "high")
      .length,
    critical: Object.values(riskAssignments).filter(
      (r) => r.riskLevel === "critical",
    ).length,
    unassigned: patients.filter((p) => !riskAssignments[p._id]).length,
  };

  // Handler to clear localStorage (for testing/reset)
  const handleClearLocalData = () => {
    if (
      window.confirm(
        "Clear all locally saved risk assignments? This cannot be undone.",
      )
    ) {
      localStorage.removeItem(RISK_STORAGE_KEY);
      setRiskAssignments({});
      setUseLocalStorage(false);
      setSuccess("Local data cleared");
    }
  };

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    const risk = getPatientRisk(patient._id);
    if (filterRisk === "all") return true;
    if (filterRisk === "unassigned") return !risk;
    return risk?.riskLevel === filterRisk;
  });

  // Helper to render risk badge
  const renderRiskBadge = (patient) => {
    const risk = getPatientRisk(patient._id);
    const isEditing = editingId === patient._id;

    if (isEditing) {
      return (
        <select
          value={tempRisk}
          onChange={(e) => setTempRisk(e.target.value)}
          className='bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500'>
          {Object.keys(riskLevels).map((key) => (
            <option key={key} value={key}>
              {riskLevels[key].label}
            </option>
          ))}
        </select>
      );
    }

    if (!risk || !risk.riskLevel) {
      return <span className='text-slate-500 italic'>Not assigned</span>;
    }

    const config = riskLevels[risk.riskLevel];
    const Icon = config.icon;
    return (
      <div className='flex items-center gap-2'>
        <span
          className={
            "rounded-full border px-3 py-1 text-xs font-medium flex items-center gap-1 " +
            config.colorClass
          }>
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
              <MdOutlineAssessment className='text-purple-400' />
              Risk Assessment
            </h1>
            <p className='text-slate-400 mt-1'>
              Evaluate and assign risk levels to your patients based on their
              health data
            </p>
          </div>
          <button
            onClick={() => navigate("/doctor/patients")}
            className='flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition'>
            <FaUserMd /> Manage Patients
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
          <div className='bg-slate-900 border border-emerald-500/30 rounded-xl p-4'>
            <p className='text-xs text-emerald-400 uppercase tracking-wider'>
              Low Risk
            </p>
            <p className='text-2xl font-bold text-emerald-400 mt-2'>
              {stats.low}
            </p>
          </div>
          <div className='bg-slate-900 border border-yellow-500/30 rounded-xl p-4'>
            <p className='text-xs text-yellow-400 uppercase tracking-wider'>
              Medium Risk
            </p>
            <p className='text-2xl font-bold text-yellow-400 mt-2'>
              {stats.medium}
            </p>
          </div>
          <div className='bg-slate-900 border border-orange-500/30 rounded-xl p-4'>
            <p className='text-xs text-orange-400 uppercase tracking-wider'>
              High Risk
            </p>
            <p className='text-2xl font-bold text-orange-400 mt-2'>
              {stats.high}
            </p>
          </div>
          <div className='bg-slate-900 border border-red-500/30 rounded-xl p-4'>
            <p className='text-xs text-red-400 uppercase tracking-wider'>
              Critical
            </p>
            <p className='text-2xl font-bold text-red-400 mt-2'>
              {stats.critical}
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
            <FaPlug className='text-yellow-400 mt-0.5' />
            <div className='flex-1'>
              <p className='font-semibold'>
                Backend Offline – Using Local Storage
              </p>
              <p className='text-sm'>
                Risk assignments are being saved locally in your browser.
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
        <div className='flex flex-col  gap-4'>
          <div className=' flex items-center gap-2 flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500'>
            <FaSearch className='text-slate-400' />
            <input
              type='text'
              placeholder='Search patients by name or email...'
              value={search}
              onChange={handleSearch}
              className='w-full bg-slate-800 shadow border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
          <div className='flex  text-xs gap-2 overflow-scroll w-full'>
            {["all", "unassigned", "low", "medium", "high", "critical"].map(
              (risk) => (
                <button
                  key={risk}
                  onClick={() => setFilterRisk(risk)}
                  className={
                    " px-4 py-2 md:py-3 rounded font-medium transition " +
                    (filterRisk === risk ?
                      "bg-purple-600 text-white"
                    : "bg-slate-900 border border-slate-700 text-slate-300 hover:border-purple-500")
                  }>
                  {risk === "all" ?
                    "All Patients"
                  : risk === "unassigned" ?
                    "Unassigned"
                  : riskLevels[risk]?.label}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Patients Table */}
        {filteredPatients.length === 0 ?
          <div className='text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl'>
            <FaClipboardList className='mx-auto text-5xl text-slate-600 mb-4' />
            <h3 className='text-xl font-semibold text-white mb-2'>
              No patients found
            </h3>
            <p className='text-slate-400'>
              {filterRisk === "unassigned" ?
                "All patients have been assigned a risk level"
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
                      Current Risk
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Last Updated
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Notes
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-slate-300'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-800'>
                  {filteredPatients.map((patient) => {
                    const risk = getPatientRisk(patient._id);
                    return (
                      <tr
                        key={patient._id}
                        className='hover:bg-slate-800/50 transition'>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold'>
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
                          {renderRiskBadge(patient)}
                        </td>

                        <td className='px-6 py-4 text-slate-300'>
                          {risk?.assignedAt ?
                            new Date(risk.assignedAt).toLocaleDateString(
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
                            <textarea
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              placeholder='Add risk justification...'
                              rows={2}
                              className='w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm'
                            />
                          : <p className='text-sm text-slate-400 truncate max-w-xs'>
                              {risk?.notes || "-"}
                            </p>
                          }
                        </td>

                        <td className='px-6 py-4'>
                          {editingId === patient._id ?
                            <div className='flex gap-2'>
                              <button
                                onClick={() => saveRiskAssignment(patient._id)}
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
                              className='flex items-center gap-2 bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition font-medium text-sm'>
                              <FaEdit size={12} />
                              {risk ? "Update" : "Assign Risk"}
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
              <div className='p-2 bg-blue-500/10 rounded-lg text-blue-400'>
                <FaInfoCircle size={20} />
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>
                  What is Risk Assessment?
                </h3>
                <p className='text-sm text-slate-400'>
                  Assign risk levels based on patient health indicators, medical
                  history, and progress data to prioritize care and
                  interventions.
                </p>
              </div>
            </div>
          </div>

          <div className='bg-slate-900 border border-slate-800 rounded-xl p-5'>
            <div className='flex items-start gap-3'>
              <div className='p-2 bg-purple-500/10 rounded-lg text-purple-400'>
                <FaClipboardList size={20} />
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>
                  Risk Levels Guide
                </h3>
                <div className='text-sm text-slate-400 space-y-1 mt-2'>
                  <p>
                    <span className='text-emerald-400 font-medium'>● Low:</span>{" "}
                    Stable, routine checkups
                  </p>
                  <p>
                    <span className='text-yellow-400 font-medium'>
                      ● Medium:
                    </span>{" "}
                    Monitor closely
                  </p>
                  <p>
                    <span className='text-orange-400 font-medium'>● High:</span>{" "}
                    Active management needed
                  </p>
                  <p>
                    <span className='text-red-400 font-medium'>
                      ● Critical:
                    </span>{" "}
                    Immediate attention
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-slate-900 border border-slate-800 rounded-xl p-5'>
            <div className='flex items-start gap-3'>
              <div className='p-2 bg-green-500/10 rounded-lg text-green-400'>
                <FaExclamationTriangle size={20} />
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>
                  Automatic Alerts
                </h3>
                <p className='text-sm text-slate-400'>
                  High and critical risk assignments automatically notify
                  patients and trigger alerts in your notifications panel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RiskAssignments;
