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
import { GiBodyHeight, GiWeight } from "react-icons/gi";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

const MedicalHistory = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    weight: 0,
    bmi: 0,
    bodyFat: 0,
  });
  const statsRef = useRef(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const [patientRes, historyRes, prescriptionsRes, reportsRes] =
          await Promise.all([
            API.get(API_ENDPOINTS.DOCTORS.PATIENT_DETAILS(userId)),
            API.get(API_ENDPOINTS.DOCTORS.PATIENT_HISTORY(userId)),
            API.get(`${API_ENDPOINTS.DOCTORS.PRESCRIPTIONS}?userId=${userId}`),
            API.get(`${API_ENDPOINTS.DOCTORS.REPORTS}?userId=${userId}`),
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
    if (userId) {
      fetchPatientData();
    }
  }, [userId]);

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
        if (step >= steps) clearInterval(timer);
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

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
        <div className='text-center'>
          <div className='relative mb-4'>
            <div className='h-20 w-20 animate-spin rounded-full border-4 border-orange-500 border-t-transparent'></div>
            <MdOutlineMonitorHeart className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-orange-500' />
          </div>
          <p className='text-slate-400 animate-pulse'>
            Loading medical records...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='flex min-h-screen items-center justify-center bg-slate-950'>
          <div className='rounded-2xl border border-red-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center shadow-2xl'>
            <FaExclamationTriangle className='mx-auto mb-4 text-6xl text-red-500' />
            <p className='mb-4 text-xl text-red-400'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/25'>
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { history, patient: patientDetails } = medicalHistory || {};
  const {
    historyAppointments = [],
    prescriptions: historyPrescriptions = [],
    reports: historyReports = [],
    bodyMeasurements,
    progressRecords,
  } = history || {};

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5)
      return {
        label: "Underweight",
        color: "text-blue-400",
        bg: "bg-blue-500/20",
      };
    if (bmi < 25)
      return {
        label: "Normal",
        color: "text-green-400",
        bg: "bg-green-500/20",
      };
    if (bmi < 30)
      return {
        label: "Overweight",
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
      };
    return { label: "Obese", color: "text-red-400", bg: "bg-red-500/20" };
  };

  const bmiStatus = getBMIStatus(bodyMeasurements?.bmi);

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8'>
        <div className='mx-auto max-w-7xl'>
          {/* Patient Header with Glass Effect */}
          <div className='mb-8 overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 shadow-2xl backdrop-blur-xl'>
            <div className='flex flex-wrap items-start justify-between gap-6'>
              <div className='flex items-center gap-6'>
                <div className='relative'>
                  <div className='h-28 w-28 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold text-white shadow-2xl'>
                    {patient?.name?.charAt(0)}
                  </div>
                  <div className='absolute -bottom-2 -right-2 rounded-lg bg-green-500 p-2 shadow-lg'>
                    <FaCheckCircle className='text-white' />
                  </div>
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-white mb-2'>
                    {patient?.name}
                  </h1>
                  <div className='flex flex-wrap gap-4 text-sm'>
                    <span className='rounded-full bg-blue-500/20 px-4 py-1 text-blue-400'>
                      <FaUserMd className='mr-2 inline' />
                      Age: {patient?.age}
                    </span>
                    <span className='rounded-full bg-purple-500/20 px-4 py-1 text-purple-400'>
                      <MdHealthAndSafety className='mr-2 inline' />
                      {patient?.gender}
                    </span>
                    <span className='rounded-full bg-orange-500/20 px-4 py-1 text-orange-400'>
                      ID: {userId?.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>

              <button className='group relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:shadow-orange-500/25'>
                <div className='absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                <FaPrescription className='mr-2 inline' />
                New Prescription
              </button>
            </div>

            {/* Animated Vital Signs */}
            {bodyMeasurements && (
              <div className='mt-8 grid gap-4 md:grid-cols-5' ref={statsRef}>
                <div className='group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10'>
                  <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-red-500/10'></div>
                  <GiWeight className='relative mb-3 text-3xl text-red-400' />
                  <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Weight
                  </p>
                  <p className='mt-1 text-3xl font-bold text-white'>
                    {animatedStats.weight}
                    <span className='ml-1 text-sm text-slate-400'>kg</span>
                  </p>
                  <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700'>
                    <div
                      className='h-full rounded-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-1000'
                      style={{
                        width: `${Math.min((animatedStats.weight / 150) * 100, 100)}%`,
                      }}></div>
                  </div>
                </div>

                <div className='group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10'>
                  <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10'></div>
                  <GiBodyHeight className='relative mb-3 text-3xl text-blue-400' />
                  <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Height
                  </p>
                  <p className='mt-1 text-3xl font-bold text-white'>
                    {bodyMeasurements.height || "N/A"}
                    <span className='ml-1 text-sm text-slate-400'>cm</span>
                  </p>
                </div>

                <div className='group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10'>
                  <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-500/10'></div>
                  <MdOutlineMonitorHeart className='relative mb-3 text-3xl text-green-400' />
                  <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    BMI
                  </p>
                  <p className='mt-1 text-3xl font-bold text-white'>
                    {animatedStats.bmi}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${bmiStatus.bg} ${bmiStatus.color}`}>
                    {bmiStatus.label}
                  </span>
                </div>

                <div className='group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10'>
                  <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-yellow-500/10'></div>
                  <FaFire className='relative mb-3 text-3xl text-yellow-400' />
                  <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Body Fat
                  </p>
                  <p className='mt-1 text-3xl font-bold text-white'>
                    {animatedStats.bodyFat}
                    <span className='ml-1 text-sm text-slate-400'>%</span>
                  </p>
                  <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700'>
                    <div
                      className='h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000'
                      style={{
                        width: `${Math.min(animatedStats.bodyFat, 100)}%`,
                      }}></div>
                  </div>
                </div>

                <div className='group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10'>
                  <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10'></div>
                  <FaCalendarAlt className='relative mb-3 text-3xl text-purple-400' />
                  <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Last Visit
                  </p>
                  <p className='mt-1 text-lg font-bold text-white'>
                    {historyAppointments.length > 0 ?
                      new Date(historyAppointments[0].date).toLocaleDateString()
                    : "No visits"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modern Tab Navigation */}
          <div className='mb-8 flex gap-2 overflow-x-auto pb-4'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-3 whitespace-nowrap rounded-2xl px-8 py-4 font-semibold transition-all duration-300 ${
                  activeTab === tab.id ?
                    "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl shadow-orange-500/25"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50"
                }`}>
                <span
                  className={
                    activeTab === tab.id ? "text-white" : "text-orange-400"
                  }>
                  {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && (
                  <div className='absolute bottom-0 left-0 right-0 h-1 rounded-full bg-white/50'></div>
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className='rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 shadow-2xl backdrop-blur-xl'>
            {activeTab === "overview" && (
              <div className='space-y-8'>
                <div className='grid gap-8 md:grid-cols-2'>
                  {/* Current Prescriptions */}
                  <div className='rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6'>
                    <div className='mb-6 flex items-center justify-between'>
                      <h3 className='flex items-center gap-3 text-xl font-bold text-white'>
                        <div className='rounded-xl bg-orange-500/20 p-3 text-orange-400'>
                          <FaPrescription className='text-2xl' />
                        </div>
                        Current Prescriptions
                      </h3>
                      <span className='rounded-full bg-orange-500/20 px-4 py-2 text-sm font-semibold text-orange-400'>
                        {prescriptions.length} Active
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {prescriptions.length > 0 ?
                        prescriptions.slice(0, 3).map((prescription, idx) => (
                          <div
                            key={idx}
                            className='group rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10'>
                            <div className='mb-3 flex items-start justify-between'>
                              <p className='font-bold text-white'>
                                {prescription.medicines
                                  ?.map((m) => m.name)
                                  .join(", ") || "No medications"}
                              </p>
                              {prescription.isEmergency && (
                                <span className='rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400'>
                                  <FaExclamationTriangle className='mr-1 inline' />
                                  Emergency
                                </span>
                              )}
                            </div>
                            <p className='text-sm text-slate-300'>
                              {prescription.notes || "No notes"}
                            </p>
                            <div className='mt-3 flex items-center gap-2 text-xs text-slate-400'>
                              <FaClock className='text-orange-400' />
                              {new Date(
                                prescription.createdAt,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      : <div className='rounded-xl border-2 border-dashed border-slate-700 p-8 text-center'>
                          <FaPrescription className='mx-auto mb-3 text-4xl text-slate-600' />
                          <p className='text-slate-400'>
                            No active prescriptions
                          </p>
                        </div>
                      }
                    </div>
                  </div>

                  {/* Recent Lab Reports */}
                  <div className='rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6'>
                    <div className='mb-6 flex items-center justify-between'>
                      <h3 className='flex items-center gap-3 text-xl font-bold text-white'>
                        <div className='rounded-xl bg-blue-500/20 p-3 text-blue-400'>
                          <FaFileMedical className='text-2xl' />
                        </div>
                        Recent Reports
                      </h3>
                      <span className='rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-400'>
                        {reports.length} Total
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {reports.length > 0 ?
                        reports.slice(0, 4).map((report, idx) => (
                          <div
                            key={idx}
                            className='group flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 transition-all duration-300 hover:border-blue-500/50'>
                            <div className='flex items-center gap-4'>
                              <MdScience className='text-3xl text-blue-400' />
                              <div>
                                <p className='font-semibold text-white'>
                                  {report.type}
                                </p>
                                <p className='text-sm text-slate-400'>
                                  {new Date(
                                    report.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                                report.status === "reviewed" ?
                                  "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                              }`}>
                              {report.status === "reviewed" ?
                                <>
                                  <FaCheckCircle className='mr-1 inline' />
                                  Reviewed
                                </>
                              : <>
                                  <FaClock className='mr-1 inline' />
                                  Pending
                                </>
                              }
                            </span>
                          </div>
                        ))
                      : <div className='rounded-xl border-2 border-dashed border-slate-700 p-8 text-center'>
                          <FaFileMedical className='mx-auto mb-3 text-4xl text-slate-600' />
                          <p className='text-slate-400'>No lab reports</p>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                {/* Appointment History with Modern Table */}
                <div className='rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6'>
                  <h3 className='mb-6 flex items-center gap-3 text-xl font-bold text-white'>
                    <div className='rounded-xl bg-green-500/20 p-3 text-green-400'>
                      <MdTimeline className='text-2xl' />
                    </div>
                    Recent Appointments
                  </h3>
                  <div className='overflow-hidden rounded-xl border border-slate-700/50'>
                    <table className='w-full'>
                      <thead className='border-b border-slate-700 bg-slate-800/50'>
                        <tr>
                          <th className='p-4 text-left text-sm font-bold text-slate-300'>
                            Date
                          </th>
                          <th className='p-4 text-left text-sm font-bold text-slate-300'>
                            Status
                          </th>
                          <th className='p-4 text-left text-sm font-bold text-slate-300'>
                            Mode
                          </th>
                          <th className='p-4 text-left text-sm font-bold text-slate-300'>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyAppointments.length > 0 ?
                          historyAppointments.slice(0, 5).map((apt, idx) => (
                            <tr
                              key={idx}
                              className='border-b border-slate-800 transition-colors hover:bg-slate-800/30 last:border-b-0'>
                              <td className='p-4 text-slate-300'>
                                {new Date(apt.date).toLocaleDateString()}
                              </td>
                              <td className='p-4'>
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                                    apt.status === "completed" ?
                                      "bg-green-500/20 text-green-400"
                                    : apt.status === "pending" ?
                                      "bg-yellow-500/20 text-yellow-400"
                                    : "bg-blue-500/20 text-blue-400"
                                  }`}>
                                  {apt.status === "completed" ?
                                    <FaCheckCircle />
                                  : apt.status === "pending" ?
                                    <FaClock />
                                  : <FaCalendarAlt />}
                                  {apt.status}
                                </span>
                              </td>
                              <td className='p-4'>
                                <span className='capitalize text-slate-300'>
                                  {apt.mode}
                                </span>
                              </td>
                              <td className='p-4'>
                                <button className='rounded-lg bg-slate-700 p-2 text-slate-400 transition hover:bg-slate-600 hover:text-white'>
                                  <FaEye />
                                </button>
                              </td>
                            </tr>
                          ))
                        : <tr>
                            <td
                              colSpan='4'
                              className='p-8 text-center text-slate-400'>
                              No appointments found
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div>
                <div className='mb-6 flex items-center justify-between'>
                  <h2 className='text-2xl font-bold text-white'>
                    Medical History Notes
                  </h2>
                  <button className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-orange-500/25'>
                    <FaPlus /> Add Note
                  </button>
                </div>
                <div className='grid gap-4'>
                  {historyPrescriptions.length > 0 ?
                    historyPrescriptions.map((prescription, idx) => (
                      <div
                        key={idx}
                        className='rounded-2xl border border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-6 transition-all duration-300 hover:border-orange-500/30'>
                        <div className='mb-4 flex items-center justify-between'>
                          <h4 className='font-bold text-white'>
                            Prescription -{" "}
                            {new Date(
                              prescription.createdAt,
                            ).toLocaleDateString()}
                          </h4>
                          <span className='rounded-full bg-slate-700 px-4 py-2 text-sm text-slate-300'>
                            {prescription.medicines?.length || 0} medications
                          </span>
                        </div>
                        <p className='text-slate-300'>
                          {prescription.notes || "No notes"}
                        </p>
                      </div>
                    ))
                  : <p className='text-slate-400'>No medical notes found</p>}
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div>
                <div className='mb-6 flex items-center justify-between'>
                  <h2 className='text-2xl font-bold text-white'>Lab Reports</h2>
                  <button className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-blue-500/25'>
                    <FaUpload /> Upload Report
                  </button>
                </div>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {reports.length > 0 ?
                    reports.map((report, idx) => (
                      <div
                        key={idx}
                        className='group cursor-pointer rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10'>
                        <div className='mb-4 flex items-center justify-between'>
                          <MdScience className='text-4xl text-blue-400' />
                          <span className='text-sm text-slate-400'>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className='mb-2 font-semibold text-white'>
                          {report.type}
                        </h4>
                        <p className='mb-3 text-sm text-slate-400'>
                          {report.fileUrl ? "File uploaded" : "No file"}
                        </p>
                        {report.status && (
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                              report.status === "reviewed" ?
                                "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                            }`}>
                            {report.status === "reviewed" ?
                              <>
                                <FaCheckCircle />
                                Reviewed
                              </>
                            : <>
                                <FaClock />
                                Pending Review
                              </>
                            }
                          </span>
                        )}
                      </div>
                    ))
                  : <p className='col-span-full text-center text-slate-400'>
                      No lab reports uploaded
                    </p>
                  }
                </div>
              </div>
            )}

            {activeTab === "prescriptions" && (
              <div>
                <h2 className='mb-6 text-2xl font-bold text-white'>
                  All Prescriptions
                </h2>
                <div className='space-y-6'>
                  {prescriptions.length > 0 ?
                    prescriptions.map((prescription, idx) => (
                      <div
                        key={idx}
                        className='rounded-2xl border border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-8 transition-all duration-300 hover:border-orange-500/30'>
                        <div className='mb-6 flex items-center justify-between'>
                          <div>
                            <h4 className='text-xl font-bold text-white'>
                              Prescription #{idx + 1}
                            </h4>
                            <p className='mt-1 text-sm text-slate-400'>
                              {new Date(
                                prescription.createdAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-4 py-2 text-xs font-semibold ${
                              prescription.isEmergency ?
                                "bg-red-500/20 text-red-400"
                              : "bg-green-500/20 text-green-400"
                            }`}>
                            {prescription.isEmergency ? "Emergency" : "Normal"}
                          </span>
                        </div>
                        <div className='space-y-3'>
                          <p className='text-sm font-semibold text-slate-400'>
                            Medications:
                          </p>
                          {prescription.medicines?.map((med, i) => (
                            <div
                              key={i}
                              className='rounded-xl bg-slate-900/50 p-4 transition-colors hover:bg-slate-900'>
                              <div className='flex items-start justify-between'>
                                <div>
                                  <p className='font-semibold text-white'>
                                    {med.name}
                                  </p>
                                  <p className='mt-1 text-sm text-slate-300'>
                                    {med.dosage}
                                  </p>
                                </div>
                                <span className='rounded-lg bg-slate-700 px-3 py-1 text-xs text-slate-300'>
                                  {med.frequency}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {prescription.notes && (
                          <div className='mt-6 rounded-xl bg-slate-900/50 p-4'>
                            <p className='mb-2 text-sm font-semibold text-slate-400'>
                              Notes:
                            </p>
                            <p className='text-slate-300'>
                              {prescription.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  : <div className='rounded-2xl border-2 border-dashed border-slate-700 p-12 text-center'>
                      <FaPrescription className='mx-auto mb-4 text-6xl text-slate-600' />
                      <p className='mb-4 text-slate-400'>
                        No prescriptions yet
                      </p>
                      <button className='rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:shadow-orange-500/25'>
                        Create Prescription
                      </button>
                    </div>
                  }
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <h2 className='mb-6 text-2xl font-bold text-white'>
                  Medical History Timeline
                </h2>
                {historyPrescriptions.length > 0 || historyReports.length > 0 ?
                  <div className='overflow-hidden rounded-2xl border border-slate-700/50'>
                    <table className='w-full'>
                      <thead className='border-b border-slate-700 bg-slate-800/50'>
                        <tr>
                          <th className='p-4 text-left text-sm font-bold text-slate-300'>
                            Date
                          </th>
                          <th className='p-4 text-left text-sm font-bold text-slate-300'>
                            Type
                          </th>
                          <th className='p-4 text-left text-sm font-bold text-slate-300'>
                            Details
                          </th>
                          <th className='p-4 text-left text-sm font-bold text-slate-300'>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ...historyPrescriptions.map((p) => ({
                            date: p.createdAt,
                            type: "Prescription",
                            details:
                              p.medicines?.map((m) => m.name).join(", ") ||
                              "N/A",
                            status: p.isEmergency ? "Emergency" : "Normal",
                          })),
                          ...historyReports.map((r) => ({
                            date: r.createdAt,
                            type: "Report",
                            details: r.type || "Lab Report",
                            status: r.status || "pending",
                          })),
                        ]
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((item, idx) => (
                            <tr
                              key={idx}
                              className='border-b border-slate-800 transition-colors hover:bg-slate-800/30 last:border-b-0'>
                              <td className='p-4 text-slate-300'>
                                {new Date(item.date).toLocaleDateString()}
                              </td>
                              <td className='p-4'>
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                                    item.type === "Prescription" ?
                                      "bg-orange-500/20 text-orange-400"
                                    : "bg-blue-500/20 text-blue-400"
                                  }`}>
                                  {item.type === "Prescription" ?
                                    <FaPrescription />
                                  : <FaFileMedical />}
                                  {item.type}
                                </span>
                              </td>
                              <td className='p-4 text-slate-300'>
                                {item.details}
                              </td>
                              <td className='p-4'>
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                                    (
                                      item.status === "reviewed" ||
                                      item.status === "Normal"
                                    ) ?
                                      "bg-green-500/20 text-green-400"
                                    : item.status === "Emergency" ?
                                      "bg-red-500/20 text-red-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                  }`}>
                                  {(
                                    item.status === "reviewed" ||
                                    item.status === "Normal"
                                  ) ?
                                    <FaCheckCircle />
                                  : item.status === "Emergency" ?
                                    <FaExclamationTriangle />
                                  : <FaClock />}
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                : <p className='text-slate-400'>No medical history found</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MedicalHistory;
