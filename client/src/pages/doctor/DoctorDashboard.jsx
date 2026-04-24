import { useEffect, useState } from "react";
import {
  FaUsers,
  FaCalendarAlt,
  FaFileMedical,
  FaPrescription,
  FaRupeeSign,
  FaChartLine,
  FaClock,
  FaCheck,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { MdBarChart } from "react-icons/md";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import DashboardLayout from "../../layout/DashboardLayout";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReports: 0,
    monthlyEarnings: 0,
    upcomingAppointments: [],
    monthlyPrescriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get(API_ENDPOINTS.DOCTORS.DASHBOARD);
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const fetchData = async (tab) => {
    try {
      switch (tab) {
        case "appointments":
          if (appointments.length === 0) {
            const res = await API.get(API_ENDPOINTS.DOCTORS.APPOINTMENTS);
            setAppointments(res.data.data || []);
          }
          break;
        case "prescriptions":
          if (prescriptions.length === 0) {
            const res = await API.get(API_ENDPOINTS.DOCTORS.PRESCRIPTIONS);
            setPrescriptions(res.data.data || []);
          }
          break;
        case "reports":
          if (reports.length === 0) {
            const res = await API.get(API_ENDPOINTS.DOCTORS.REPORTS);
            setReports(res.data.data || []);
          }
          break;
        case "earnings":
          if (!earnings) {
            const res = await API.get(API_ENDPOINTS.DOCTORS.EARNINGS);
            setEarnings(res.data.data);
          }
          break;
        case "schedule":
          if (!schedule) {
            const res = await API.get(API_ENDPOINTS.DOCTORS.SCHEDULE);
            setSchedule(res.data.data);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error fetching ${tab}:`, err);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    fetchData(tabId);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <MdBarChart /> },
    { id: "patients", label: "Patients", icon: <FaUsers /> },
    { id: "appointments", label: "Appointments", icon: <FaCalendarAlt /> },
    { id: "schedule", label: "Schedule", icon: <FaClock /> },
    { id: "prescriptions", label: "Prescriptions", icon: <FaPrescription /> },
    { id: "reports", label: "Lab Reports", icon: <FaFileMedical /> },
    { id: "earnings", label: "Earnings", icon: <FaRupeeSign /> },
  ];

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

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-slate-950 p-4 md:p-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-8 flex items-center justify-between'>
            <h1 className='text-3xl font-bold text-white'>Doctor Dashboard</h1>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className='rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition'>
              + New Appointment
            </button>
          </div>

          {/* Stats Grid */}
          <div className='mb-8 grid gap-6 md:grid-cols-4'>
            <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-slate-400'>Total Patients</p>
                  <p className='mt-2 text-3xl font-bold text-white'>
                    {stats.totalPatients}
                  </p>
                </div>
                <div className='rounded-xl bg-blue-500/20 p-3 text-blue-400'>
                  <FaUsers size={24} />
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-slate-400'>Today's Appointments</p>
                  <p className='mt-2 text-3xl font-bold text-white'>
                    {stats.todayAppointments}
                  </p>
                </div>
                <div className='rounded-xl bg-green-500/20 p-3 text-green-400'>
                  <FaCalendarAlt size={24} />
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-slate-400'>Pending Reports</p>
                  <p className='mt-2 text-3xl font-bold text-white'>
                    {stats.pendingReports}
                  </p>
                </div>
                <div className='rounded-xl bg-yellow-500/20 p-3 text-yellow-400'>
                  <FaFileMedical size={24} />
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-slate-400'>Monthly Earnings</p>
                  <p className='mt-2 text-3xl font-bold text-white'>
                    ₹{stats.monthlyEarnings}
                  </p>
                </div>
                <div className='rounded-xl bg-green-500/20 p-3 text-green-400'>
                  <FaRupeeSign size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className='mb-6 flex gap-2 overflow-x-auto border-b border-slate-700 pb-4'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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

          {/* Content */}
          <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
            {activeTab === "overview" && (
              <div>
                <h2 className='mb-4 text-xl font-bold text-white'>
                  Recent Activity
                </h2>
                <div className='space-y-4'>
                  {stats.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
                    stats.upcomingAppointments.map((apt, idx) => (
                      <div key={idx} className='flex items-center justify-between rounded-xl border border-slate-700 p-4'>
                        <div className='flex items-center gap-4'>
                          <div className={`rounded-full p-2 ${
                            apt.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            apt.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            <FaCalendarAlt />
                          </div>
                          <div>
                            <p className='font-semibold text-white'>
                              {apt.userId?.name || "Patient"}
                            </p>
                            <p className='text-sm text-slate-400'>
                              {new Date(apt.date).toLocaleDateString()} at {apt.timeSlot || "N/A"}
                            </p>
                          </div>
                        </div>
                        <span className={`rounded px-2 py-1 text-xs ${
                          apt.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          apt.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className='text-slate-400'>No upcoming appointments</p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className='mt-8 grid gap-4 md:grid-cols-3'>
                  <div className='rounded-xl border border-slate-700 p-4'>
                    <p className='text-sm text-slate-400'>Monthly Prescriptions</p>
                    <p className='mt-2 text-2xl font-bold text-white'>
                      {stats.monthlyPrescriptions || 0}
                    </p>
                  </div>
                  <div className='rounded-xl border border-slate-700 p-4'>
                    <p className='text-sm text-slate-400'>Active Patients</p>
                    <p className='mt-2 text-2xl font-bold text-white'>
                      {stats.totalPatients}
                    </p>
                  </div>
                  <div className='rounded-xl border border-slate-700 p-4'>
                    <p className='text-sm text-slate-400'>Pending Reports</p>
                    <p className='mt-2 text-2xl font-bold text-orange-400'>
                      {stats.pendingReports}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "patients" && (
              <div>
                <h2 className='mb-4 text-xl font-bold text-white'>
                  My Patients
                </h2>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-slate-700'>
                        <th className='pb-3 text-left text-sm font-semibold text-slate-300'>
                          Patient
                        </th>
                        <th className='pb-3 text-left text-sm font-semibold text-slate-300'>
                          Condition
                        </th>
                        <th className='pb-3 text-left text-sm font-semibold text-slate-300'>
                          Last Visit
                        </th>
                        <th className='pb-3 text-left text-sm font-semibold text-slate-300'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className='border-b border-slate-800'>
                        <td className='py-4 text-white'>John Doe</td>
                        <td className='text-slate-300'>Diabetes Type 2</td>
                        <td className='text-slate-300'>2 days ago</td>
                        <td>
                          <button className='text-blue-400 hover:underline'>
                            View Profile
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className='py-4 text-white'>Jane Smith</td>
                        <td className='text-slate-300'>Hypertension</td>
                        <td className='text-slate-300'>1 week ago</td>
                        <td>
                          <button className='text-blue-400 hover:underline'>
                            View Profile
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "appointments" && (
              <div>
                <h2 className='mb-4 text-xl font-bold text-white'>
                  My Appointments
                </h2>
                <div className='space-y-4'>
                  {appointments.length > 0 ? (
                    appointments.map((apt, idx) => (
                      <div key={idx} className='rounded-xl border border-slate-700 p-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='font-semibold text-white'>
                              {apt.userId?.name || "Patient"}
                            </p>
                            <p className='text-sm text-slate-400'>
                              {new Date(apt.date).toLocaleDateString()} • {apt.timeSlot || "N/A"}
                            </p>
                            <p className='text-xs text-slate-500 capitalize'>{apt.mode}</p>
                          </div>
                          <div className='flex gap-2'>
                            {apt.status === 'pending' && (
                              <button className='rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600'>
                                Start Call
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/doctor/patient/${apt.userId?._id}`)}
                              className='rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700'>
                              View Patient
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-slate-400 text-center py-8'>No appointments found</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "schedule" && (
              <div>
                <h2 className='mb-4 text-xl font-bold text-white'>
                  My Schedule
                </h2>
                {schedule ? (
                  <div className='space-y-6'>
                    {Object.entries(schedule.schedule || {}).map(([date, appts]) => (
                      <div key={date} className='rounded-xl border border-slate-700 p-4'>
                        <h3 className='mb-3 font-semibold text-white'>{date}</h3>
                        <div className='space-y-2'>
                          {appts.map((apt, idx) => (
                            <div key={idx} className='flex items-center justify-between rounded-lg bg-slate-800 p-3'>
                              <div>
                                <p className='text-white'>{apt.userId?.name || "Patient"}</p>
                                <p className='text-sm text-slate-400'>
                                  {apt.timeSlot || new Date(apt.date).toLocaleTimeString()}
                                </p>
                              </div>
                              <span className={`rounded px-2 py-1 text-xs ${
                                apt.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                apt.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {apt.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-slate-400 text-center py-8'>Loading schedule...</p>
                )}
              </div>
            )}

            {activeTab === "prescriptions" && (
              <div>
                <h2 className='mb-4 text-xl font-bold text-white'>
                  My Prescriptions
                </h2>
                <div className='space-y-4'>
                  {prescriptions.length > 0 ? (
                    prescriptions.map((prescription, idx) => (
                      <div key={idx} className='rounded-xl border border-slate-700 p-4'>
                        <div className='flex items-center justify-between'>
                          <p className='font-semibold text-white'>
                            Prescription #{idx + 1}
                          </p>
                          <span className={`rounded px-2 py-1 text-xs ${
                            prescription.isEmergency ?
                              "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                          }`}>
                            {prescription.isEmergency ? "Emergency" : "Normal"}
                          </span>
                        </div>
                        <p className='mt-2 text-sm text-slate-300'>
                          Patient: {prescription.userId?.name || "N/A"}
                        </p>
                        <p className='text-xs text-slate-400'>
                          {new Date(prescription.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className='text-slate-400 text-center py-8'>No prescriptions found</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div>
                <h2 className='mb-4 text-xl font-bold text-white'>
                  Lab Reports
                </h2>
                <div className='space-y-4'>
                  {reports.length > 0 ? (
                    reports.map((report, idx) => (
                      <div key={idx} className='rounded-xl border border-slate-700 p-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='font-semibold text-white'>{report.type}</p>
                            <p className='text-sm text-slate-400'>
                              Patient: {report.userId?.name || "N/A"}
                            </p>
                          </div>
                          <span className={`rounded px-2 py-1 text-xs ${
                            report.status === "reviewed" ?
                              "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {report.status || "pending"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-slate-400 text-center py-8'>No reports found</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "earnings" && (
              <div>
                <h2 className='mb-4 text-xl font-bold text-white'>
                  Earnings Summary
                </h2>
                {earnings ? (
                  <div className='space-y-6'>
                    <div className='grid gap-4 md:grid-cols-3'>
                      <div className='rounded-xl border border-slate-700 bg-slate-800 p-4'>
                        <p className='text-sm text-slate-400'>Total Earnings</p>
                        <p className='text-2xl font-bold text-green-400'>
                          ₹{earnings.totalEarnings || 0}
                        </p>
                      </div>
                      <div className='rounded-xl border border-slate-700 bg-slate-800 p-4'>
                        <p className='text-sm text-slate-400'>Active Subscriptions</p>
                        <p className='text-2xl font-bold text-white'>
                          {earnings.activeSubscriptions || 0}
                        </p>
                      </div>
                      <div className='rounded-xl border border-slate-700 bg-slate-800 p-4'>
                        <p className='text-sm text-slate-400'>This Month</p>
                        <p className='text-2xl font-bold text-white'>
                          ₹{stats.monthlyEarnings || 0}
                        </p>
                      </div>
                    </div>

                    {/* Recent earnings breakdown */}
                    {earnings.recentEarnings && earnings.recentEarnings.length > 0 && (
                      <div>
                        <h3 className='mb-3 font-semibold text-white'>Recent Earnings</h3>
                        <div className='space-y-2'>
                          {earnings.recentEarnings.map((item, idx) => (
                            <div key={idx} className='flex items-center justify-between rounded-lg bg-slate-800 p-3'>
                              <p className='text-white'>
                                {item._id?.month || "N/A"}
                              </p>
                              <p className='text-green-400 font-semibold'>
                                ₹{item.total || 0} ({item.count} subscriptions)
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className='text-slate-400 text-center py-8'>Loading earnings...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
