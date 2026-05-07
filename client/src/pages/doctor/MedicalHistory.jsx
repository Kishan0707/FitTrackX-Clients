import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaStethoscope,
  FaUserMd,
  FaFileMedical,
  FaPrescription,
  FaNotesMedical,
  FaHistory,
  FaChartLine,
  FaPlus,
  FaUpload,
  FaEye,
  FaCalendarAlt,
  FaWeight,
  FaRulerVertical,
  FaTint,
  FaFire,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  MdTimeline,
  MdBloodtype,
  MdOutlineMonitorHeart,
  MdHealthAndSafety,
  MdScience,
} from "react-icons/md";
import { GiBodyHeight, GiWeight as GiWeightIcon } from "react-icons/gi";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

const MedicalHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    weight: 0,
    bmi: 0,
    bodyFat: 0,
  });
  const statsRef = useRef(null);

  // Redirect if no patientId
  useEffect(() => {
    if (!patientId) {
      navigate("/doctor/patients");
    }
  }, [patientId, navigate]);

  useEffect(() => {
    if (!patientId) return;

    const fetchPatientData = async () => {
      try {
        const [patientRes, historyRes, prescriptionsRes, reportsRes] =
          await Promise.all([
            API.get(API_ENDPOINTS.DOCTORS.PATIENT_DETAILS(patientId)),
            API.get(API_ENDPOINTS.DOCTORS.PATIENT_HISTORY(patientId)),
            API.get(
              `${API_ENDPOINTS.DOCTORS.PRESCRIPTIONS}?userId=${patientId}`,
            ),
            API.get(`${API_ENDPOINTS.DOCTORS.REPORTS}?userId=${patientId}`),
          ]);

        setPatient(patientRes.data.data);
        setMedicalHistory(historyRes.data.data);
        setPrescriptions(prescriptionsRes.data.data || []);
        setReports(reportsRes.data.data || []);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch patient data:", error);
        setError(
          error.response?.data?.message || "Failed to load patient data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // Animate stats on load
  useEffect(() => {
    if (medicalHistory?.history?.bodyMeasurements) {
      const { weight, bmi, bodyFat } = medicalHistory.history.bodyMeasurements;
      const duration = 1000;
      const steps = 60;
      const stepDuration = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        setAnimatedStats({
          weight: ((weight || 0) * (step / steps)).toFixed(1),
          bmi: ((bmi || 0) * (step / steps)).toFixed(1),
          bodyFat: ((bodyFat || 0) * (step / steps)).toFixed(1),
        });

        if (step >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [medicalHistory]);

  const tabs = [
    { id: "overview", label: "Overview", icon: <MdTimeline /> },
    { id: "notes", label: "Medical Notes", icon: <FaNotesMedical /> },
    { id: "reports", label: "Lab Reports", icon: <FaFileMedical /> },
    { id: "prescriptions", label: "Prescriptions", icon: <FaPrescription /> },
    { id: "history", label: "History", icon: <FaHistory /> },
  ];

  if (!patientId) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex min-h-screen items-center justify-center bg-slate-950'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent'></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='flex min-h-screen items-center justify-center bg-slate-950'>
          <div className='rounded-xl border border-red-500/30 bg-slate-900 p-6 text-center text-red-400'>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-3 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600'>
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Extract data from medical history
  const { history } = medicalHistory || {};
  const { historyAppointments = [], bodyMeasurements } = history || {};

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-slate-950 p-4 md:p-8'>
        <div className='mx-auto max-w-7xl'>
          {/* Patient Header */}
          <div className='mb-8 rounded-2xl border border-slate-700 bg-slate-900 p-6'>
            <div className='flex flex-wrap items-start justify-between gap-6'>
              <div className='flex items-center gap-6'>
                <div className='h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white'>
                  {patient?.name?.charAt(0)}
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-white'>
                    {patient?.name}
                  </h1>
                  <p className='text-blue-400'>
                    Age: {patient?.age} • Gender: {patient?.gender}
                  </p>
                  <p className='mt-1 text-sm text-slate-400'>
                    Patient ID: {patientId?.slice(-8)}
                  </p>
                </div>
              </div>

              <button className='group relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:shadow-orange-500/25'>
                <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                <FaPrescription className='mr-2 inline' />
                New Prescription
              </button>
            </div>

            {/* Vital Signs */}
            {bodyMeasurements && (
              <div className='mt-8 grid gap-4 md:grid-cols-5' ref={statsRef}>
                <div className='group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10'>
                  <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-red-500/10'></div>
                  <GiWeightIcon className='relative mb-3 text-3xl text-red-400' />
                  <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Current Weight
                  </p>
                  <p className='mt-2 text-3xl font-bold text-white'>
                    {animatedStats.weight} kg
                  </p>
                  <p className='mt-1 text-sm text-slate-400'>
                    BMI: {animatedStats.bmi}
                  </p>
                </div>
                <div className='group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10'>
                  <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10'></div>
                  <GiBodyHeight className='relative mb-3 text-3xl text-blue-400' />
                  <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Height
                  </p>
                  <p className='mt-2 text-3xl font-bold text-white'>
                    {bodyMeasurements.height || "--"} cm
                  </p>
                </div>
                <div className='group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10'>
                  <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-500/10'></div>
                  <FaFire className='relative mb-3 text-3xl text-green-400' />
                  <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Body Fat
                  </p>
                  <p className='mt-2 text-3xl font-bold text-white'>
                    {animatedStats.bodyFat}%
                  </p>
                </div>
                <div className='group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10'>
                  <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10'></div>
                  <MdBloodtype className='relative mb-3 text-3xl text-purple-400' />
                  <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Blood Type
                  </p>
                  <p className='mt-2 text-3xl font-bold text-white'>
                    {bodyMeasurements.bloodType || "--"}
                  </p>
                </div>
                <div className='group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10'>
                  <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-yellow-500/10'></div>
                  <FaStethoscope className='relative mb-3 text-3xl text-yellow-400' />
                  <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Chronic Conditions
                  </p>
                  <p className='mt-2 text-lg font-bold text-white leading-tight'>
                    {bodyMeasurements.chronicConditions?.length > 0 ?
                      bodyMeasurements.chronicConditions.join(", ")
                    : "None"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className='mb-6 flex gap-2 overflow-x-auto border-b border-slate-700 pb-4'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-3 font-semibold transition ${
                  activeTab === tab.id ?
                    "bg-orange-500 text-white"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className='space-y-6'>
              {/* Appointments */}
              <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <h3 className='text-xl font-semibold text-white'>
                    Appointment History
                  </h3>
                  <button className='rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition'>
                    Book Appointment
                  </button>
                </div>
                {historyAppointments?.length > 0 ?
                  <div className='space-y-3'>
                    {historyAppointments.map((apt) => (
                      <div
                        key={apt._id}
                        className='flex items-center justify-between rounded-lg border border-slate-700 p-4'>
                        <div className='flex items-center gap-4'>
                          <div className='rounded-lg bg-blue-500/20 p-3 text-blue-400'>
                            <FaCalendarAlt />
                          </div>
                          <div>
                            <p className='font-semibold text-white'>
                              {apt.reason || "General Checkup"}
                            </p>
                            <p className='text-sm text-slate-400'>
                              {new Date(apt.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            apt.status === "completed" ?
                              "bg-green-500/20 text-green-400"
                            : apt.status === "scheduled" ?
                              "bg-blue-500/20 text-blue-400"
                            : "bg-red-500/20 text-red-400"
                          }`}>
                          {apt.status || "Completed"}
                        </span>
                      </div>
                    ))}
                  </div>
                : <p className='text-slate-400'>No appointments yet.</p>}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
              <h3 className='text-xl font-semibold text-white mb-4'>
                Medical Notes
              </h3>
              <p className='text-slate-400'>No medical notes recorded yet.</p>
            </div>
          )}

          {activeTab === "reports" && (
            <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
              <h3 className='text-xl font-semibold text-white mb-4'>
                Lab Reports
              </h3>
              {reports?.length > 0 ?
                <div className='space-y-3'>
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className='flex items-center justify-between rounded-lg border border-slate-700 p-4'>
                      <div className='flex items-center gap-4'>
                        <div className='rounded-lg bg-purple-500/20 p-3 text-purple-400'>
                          <FaFileMedical />
                        </div>
                        <div>
                          <p className='font-semibold text-white'>
                            {report.title || "Lab Report"}
                          </p>
                          <p className='text-sm text-slate-400'>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button className='rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 transition'>
                        View
                      </button>
                    </div>
                  ))}
                </div>
              : <p className='text-slate-400'>No lab reports uploaded.</p>}
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
              <h3 className='text-xl font-semibold text-white mb-4'>
                Prescriptions
              </h3>
              {prescriptions?.length > 0 ?
                <div className='space-y-3'>
                  {prescriptions.map((prescription) => (
                    <div
                      key={prescription._id}
                      className='flex items-center justify-between rounded-lg border border-slate-700 p-4'>
                      <div className='flex items-center gap-4'>
                        <div className='rounded-lg bg-green-500/20 p-3 text-green-400'>
                          <FaPrescription />
                        </div>
                        <div>
                          <p className='font-semibold text-white'>
                            {prescription.medication || "Medication"}
                          </p>
                          <p className='text-sm text-slate-400'>
                            {prescription.dosage || "Standard dosage"} •{" "}
                            {new Date(
                              prescription.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          prescription.status === "active" ?
                            "bg-green-500/20 text-green-400"
                          : "bg-slate-700 text-slate-300"
                        }`}>
                        {prescription.status || "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              : <p className='text-slate-400'>No prescriptions yet.</p>}
            </div>
          )}

          {activeTab === "history" && (
            <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
              <h3 className='text-xl font-semibold text-white mb-4'>
                Medical History
              </h3>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='rounded-lg border border-slate-700 p-4'>
                  <h4 className='font-semibold text-white mb-2'>Diagnoses</h4>
                  <p className='text-slate-400'>
                    {medicalHistory?.diagnoses?.length > 0 ?
                      medicalHistory.diagnoses.join(", ")
                    : "No diagnoses recorded"}
                  </p>
                </div>
                <div className='rounded-lg border border-slate-700 p-4'>
                  <h4 className='font-semibold text-white mb-2'>Surgeries</h4>
                  <p className='text-slate-400'>
                    {medicalHistory?.surgeries?.length > 0 ?
                      medicalHistory.surgeries.join(", ")
                    : "No surgeries recorded"}
                  </p>
                </div>
                <div className='rounded-lg border border-slate-700 p-4'>
                  <h4 className='font-semibold text-white mb-2'>Allergies</h4>
                  <p className='text-slate-400'>
                    {medicalHistory?.allergies?.length > 0 ?
                      medicalHistory.allergies.join(", ")
                    : "No allergies recorded"}
                  </p>
                </div>
                <div className='rounded-lg border border-slate-700 p-4'>
                  <h4 className='font-semibold text-white mb-2'>
                    Family History
                  </h4>
                  <p className='text-slate-400'>
                    {medicalHistory?.familyHistory ?
                      "Available"
                    : "Not recorded"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MedicalHistory;
