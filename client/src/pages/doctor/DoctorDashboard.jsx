import { useState } from "react";
import { FaUsers, FaCalendarAlt, FaFileMedical, FaPrescription, FaRupeeSign, FaChartLine, FaClock, FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";
import API from "../../services/api";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReports: 0,
    monthlyEarnings: 0,
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: <MdBarChart /> },
    { id: "patients", label: "Patients", icon: <FaUsers /> },
    { id: "appointments", label: "Appointments", icon: <FaCalendarAlt /> },
    { id: "prescriptions", label: "Prescriptions", icon: <FaPrescription /> },
    { id: "reports", label: "Lab Reports", icon: <FaFileMedical /> },
    { id: "earnings", label: "Earnings", icon: <FaRupeeSign /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
          <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition">
            + New Appointment
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Patients</p>
                <p className="mt-2 text-3xl font-bold text-white">{stats.totalPatients}</p>
              </div>
              <div className="rounded-xl bg-blue-500/20 p-3 text-blue-400">
                <FaUsers size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Today's Appointments</p>
                <p className="mt-2 text-3xl font-bold text-white">{stats.todayAppointments}</p>
              </div>
              <div className="rounded-xl bg-green-500/20 p-3 text-green-400">
                <FaCalendarAlt size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending Reports</p>
                <p className="mt-2 text-3xl font-bold text-white">{stats.pendingReports}</p>
              </div>
              <div className="rounded-xl bg-yellow-500/20 p-3 text-yellow-400">
                <FaFileMedical size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Monthly Earnings</p>
                <p className="mt-2 text-3xl font-bold text-white">₹{stats.monthlyEarnings}</p>
              </div>
              <div className="rounded-xl bg-green-500/20 p-3 text-green-400">
                <FaRupeeSign size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-700 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-3 font-semibold transition ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          {activeTab === "overview" && (
            <div>
              <h2 className="mb-4 text-xl font-bold text-white">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-slate-700 p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-green-500/20 p-2 text-green-400">
                      <FaCheck />
                    </div>
                    <div>
                      <p className="font-semibold text-white">New appointment confirmed</p>
                      <p className="text-sm text-slate-400">Patient: John Doe • Today at 11:00 AM</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">2 min ago</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-700 p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-blue-500/20 p-2 text-blue-400">
                      <FaFileMedical />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Lab report uploaded</p>
                      <p className="text-sm text-slate-400">Patient: Jane Smith • CBC Report</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">15 min ago</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "patients" && (
            <div>
              <h2 className="mb-4 text-xl font-bold text-white">My Patients</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="pb-3 text-left text-sm font-semibold text-slate-300">Patient</th>
                      <th className="pb-3 text-left text-sm font-semibold text-slate-300">Condition</th>
                      <th className="pb-3 text-left text-sm font-semibold text-slate-300">Last Visit</th>
                      <th className="pb-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-800">
                      <td className="py-4 text-white">John Doe</td>
                      <td className="text-slate-300">Diabetes Type 2</td>
                      <td className="text-slate-300">2 days ago</td>
                      <td>
                        <button className="text-blue-400 hover:underline">View Profile</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Jane Smith</td>
                      <td className="text-slate-300">Hypertension</td>
                      <td className="text-slate-300">1 week ago</td>
                      <td>
                        <button className="text-blue-400 hover:underline">View Profile</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div>
              <h2 className="mb-4 text-xl font-bold text-white">Upcoming Appointments</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-slate-700 p-4">
                  <div>
                    <p className="font-semibold text-white">John Doe</p>
                    <p className="text-sm text-slate-400">Today • 11:00 AM • Video Call</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600">
                      Start Call
                    </button>
                    <button className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">
                      Reschedule
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-700 p-4">
                  <div>
                    <p className="font-semibold text-white">Jane Smith</p>
                    <p className="text-sm text-slate-400">Tomorrow • 2:00 PM • Chat</p>
                  </div>
                  <button className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="text-center text-slate-400 py-12">
              <FaPrescription className="mx-auto mb-4 text-4xl text-slate-600" />
              <p>Prescription management coming soon</p>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="text-center text-slate-400 py-12">
              <FaFileMedical className="mx-auto mb-4 text-4xl text-slate-600" />
              <p>Lab reports review system coming soon</p>
            </div>
          )}

          {activeTab === "earnings" && (
            <div>
              <h2 className="mb-4 text-xl font-bold text-white">Earnings Summary</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <p className="text-sm text-slate-400">This Month</p>
                  <p className="text-2xl font-bold text-green-400">₹45,000</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <p className="text-sm text-slate-400">Last Month</p>
                  <p className="text-2xl font-bold text-white">₹38,500</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <p className="text-sm text-slate-400">Total (Year)</p>
                  <p className="text-2xl font-bold text-white">₹4,20,000</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
