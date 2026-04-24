import { useState, useEffect } from "react";
import {
  FaFileMedical,
  FaPrescription,
  FaNotesMedical,
  FaHistory,
  FaUserMd,
} from "react-icons/fa";
import { MdTimeline, MdBloodtype } from "react-icons/md";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

const MedicalHistory = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicalData, setMedicalData] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        // Try to fetch data, but handle 404s gracefully
        const requests = [
          API.get(API_ENDPOINTS.USERS.MEDICAL_HISTORY).catch((err) => {
            if (err.response?.status === 404) {
              console.warn("Medical history endpoint not available");
              return { data: { data: null } };
            }
            throw err;
          }),
          API.get(API_ENDPOINTS.DOCTORS.PRESCRIPTIONS).catch((err) => {
            if (err.response?.status === 404) {
              console.warn("Prescriptions endpoint not available");
              return { data: { data: [] } };
            }
            throw err;
          }),
          API.get(API_ENDPOINTS.DOCTORS.REPORTS).catch((err) => {
            if (err.response?.status === 404) {
              console.warn("Reports endpoint not available");
              return { data: { data: [] } };
            }
            throw err;
          }),
          API.get(API_ENDPOINTS.APPOINTMENTS.USER_LIST).catch((err) => {
            if (err.response?.status === 404) {
              console.warn("Appointments endpoint not available");
              return { data: { data: [] } };
            }
            throw err;
          }),
        ];

        const [historyRes, prescriptionsRes, reportsRes, appointmentsRes] =
          await Promise.all(requests);

        setMedicalData(historyRes.data.data);
        setPrescriptions(prescriptionsRes.data.data || []);
        setReports(reportsRes.data.data || []);
        setAppointments(appointmentsRes.data.data || []);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch medical history:", error);
        // Don't show error for missing endpoints, just log it
        if (error.response?.status !== 404) {
          setError(
            error.response?.data?.message || "Failed to load medical history",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: <MdTimeline /> },
    { id: "prescriptions", label: "Prescriptions", icon: <FaPrescription /> },
    { id: "reports", label: "Lab Reports", icon: <FaFileMedical /> },
    { id: "appointments", label: "Appointments", icon: <FaUserMd /> },
    { id: "history", label: "History", icon: <FaHistory /> },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="rounded-xl border border-red-500/30 bg-slate-900 p-6 text-center text-red-400">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { bodyMeasurements, historyAppointments = [], progressRecords } =
    medicalData || {};

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-3xl font-bold text-white">
            Medical History
          </h1>

          {/* Vital Signs */}
          {bodyMeasurements && (
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="flex items-center gap-3">
                  <MdBloodtype className="text-2xl text-red-400" />
                  <div>
                    <p className="text-xs text-slate-400">Weight</p>
                    <p className="font-bold text-white">
                      {bodyMeasurements.weight || "N/A"} kg
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="flex items-center gap-3">
                  <FaUserMd className="text-2xl text-blue-400" />
                  <div>
                    <p className="text-xs text-slate-400">Height</p>
                    <p className="font-bold text-white">
                      {bodyMeasurements.height || "N/A"} cm
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="flex items-center gap-3">
                  <MdTimeline className="text-2xl text-green-400" />
                  <div>
                    <p className="text-xs text-slate-400">BMI</p>
                    <p className="font-bold text-white">
                      {bodyMeasurements.bmi || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="flex items-center gap-3">
                  <FaNotesMedical className="text-2xl text-yellow-400" />
                  <div>
                    <p className="text-xs text-slate-400">Body Fat</p>
                    <p className="font-bold text-white">
                      {bodyMeasurements.bodyFat || "N/A"}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                }`}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            {activeTab === "overview" && (
              <div className="grid gap-8 md:grid-cols-2">
                {/* Current Prescriptions */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                    <FaPrescription className="text-orange-400" />
                    Current Prescriptions
                  </h3>
                  <div className="space-y-3">
                    {prescriptions.length > 0 ? (
                      prescriptions.slice(0, 3).map((prescription, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-700 p-4">
                          <p className="font-semibold text-white">
                            {prescription.medicines
                              ?.map((m) => m.name)
                              .join(", ") || "No medications"}
                          </p>
                          <p className="mt-1 text-sm text-slate-300">
                            {prescription.notes || "No notes"}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            {new Date(
                              prescription.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No active prescriptions</p>
                    )}
                  </div>
                </div>

                {/* Recent Lab Reports */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                    <FaFileMedical className="text-blue-400" />
                    Recent Reports
                  </h3>
                  <div className="space-y-3">
                    {reports.length > 0 ? (
                      reports.slice(0, 3).map((report, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-slate-700 p-4">
                          <div>
                            <p className="font-semibold text-white">
                              {report.type}
                            </p>
                            <p className="text-sm text-slate-400">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`rounded px-2 py-1 text-xs ${
                              report.status === "reviewed"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}>
                            {report.status || "pending"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No lab reports</p>
                    )}
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="md:col-span-2">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                    <FaUserMd className="text-green-400" />
                    Recent Appointments
                  </h3>
                  <div className="rounded-xl border border-slate-700">
                    <table className="w-full">
                      <thead className="border-b border-slate-700">
                        <tr>
                          <th className="p-4 text-left text-sm font-semibold text-slate-300">
                            Date
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-300">
                            Doctor
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-300">
                            Status
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-300">
                            Mode
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.length > 0 ? (
                          appointments.slice(0, 5).map((apt, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-slate-800 last:border-b-0">
                              <td className="p-4 text-slate-300">
                                {new Date(apt.date).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-slate-300">
                                {apt.doctor?.name || "N/A"}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`rounded px-2 py-1 text-xs ${
                                    apt.status === "completed"
                                      ? "bg-green-500/20 text-green-400"
                                      : apt.status === "pending"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : "bg-blue-500/20 text-blue-400"
                                  }`}>
                                  {apt.status}
                                </span>
                              </td>
                              <td className="p-4 text-slate-300 capitalize">
                                {apt.mode}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="p-4 text-center text-slate-400">
                              No appointments found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "prescriptions" && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-white">
                  Prescriptions
                </h2>
                <div className="space-y-4">
                  {prescriptions.length > 0 ? (
                    prescriptions.map((prescription, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-700 p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white">
                              Prescription #{idx + 1}
                            </h4>
                            <p className="text-sm text-slate-400">
                              {new Date(
                                prescription.createdAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`rounded px-3 py-1 text-xs font-semibold ${
                              prescription.isEmergency
                                ? "bg-red-500/20 text-red-400"
                                : "bg-green-500/20 text-green-400"
                            }`}>
                            {prescription.isEmergency
                              ? "Emergency"
                              : "Normal"}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-slate-400">
                            Medications:
                          </p>
                          {prescription.medicines?.map((med, i) => (
                            <div key={i} className="rounded-lg bg-slate-800 p-3">
                              <p className="font-semibold text-white">
                                {med.name}
                              </p>
                              <p className="text-sm text-slate-300">
                                {med.dosage}
                              </p>
                              <p className="text-xs text-slate-400">
                                {med.frequency}
                              </p>
                            </div>
                          ))}
                        </div>
                        {prescription.notes && (
                          <div className="mt-4 rounded-lg bg-slate-800 p-3">
                            <p className="text-sm text-slate-400">Notes:</p>
                            <p className="text-slate-300">
                              {prescription.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-slate-700 p-12 text-center">
                      <FaPrescription className="mx-auto mb-4 text-4xl text-slate-600" />
                      <p className="text-slate-400">No prescriptions yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-white">
                  Lab Reports
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reports.length > 0 ? (
                    reports.map((report, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-700 bg-slate-800 p-4 transition hover:border-orange-500">
                        <div className="mb-3 flex items-center justify-between">
                          <FaFileMedical className="text-3xl text-red-400" />
                          <span className="text-sm text-slate-400">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-white">
                          {report.type}
                        </h4>
                        <p className="mt-1 text-sm text-slate-400">
                          {report.fileUrl ? "File uploaded" : "No file"}
                        </p>
                        {report.status && (
                          <span
                            className={`mt-2 inline-block rounded px-2 py-1 text-xs font-semibold ${
                              report.status === "reviewed"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}>
                            {report.status === "reviewed"
                              ? "Reviewed"
                              : "Pending Review"}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-slate-400">
                      No lab reports uploaded
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "appointments" && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-white">
                  Appointments History
                </h2>
                <div className="rounded-xl border border-slate-700">
                  <table className="w-full">
                    <thead className="border-b border-slate-700">
                      <tr>
                        <th className="p-4 text-left text-sm font-semibold text-slate-300">
                          Date
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-slate-300">
                          Doctor
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-slate-300">
                          Status
                        </th>
                        <th className="p-4 text-left text-sm font-semibold text-slate-300">
                          Mode
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length > 0 ? (
                        appointments.map((apt, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-slate-800 last:border-b-0">
                            <td className="p-4 text-slate-300">
                              {new Date(apt.date).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-slate-300">
                              {apt.doctor?.name || "N/A"}
                            </td>
                            <td className="p-4">
                              <span
                                className={`rounded px-2 py-1 text-xs ${
                                  apt.status === "completed"
                                    ? "bg-green-500/20 text-green-400"
                                    : apt.status === "pending"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-blue-500/20 text-blue-400"
                                }`}>
                                {apt.status}
                              </span>
                            </td>
                            <td className="p-4 text-slate-300 capitalize">
                              {apt.mode}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="p-4 text-center text-slate-400">
                            No appointments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-white">
                  Medical History Timeline
                </h2>
                {prescriptions.length > 0 || reports.length > 0 ? (
                  <div className="rounded-xl border border-slate-700">
                    <table className="w-full">
                      <thead className="border-b border-slate-700">
                        <tr>
                          <th className="p-4 text-left text-sm font-semibold text-slate-300">
                            Date
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-300">
                            Type
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-300">
                            Details
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-slate-300">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ...prescriptions.map((p) => ({
                            date: p.createdAt,
                            type: "Prescription",
                            details:
                              p.medicines
                                ?.map((m) => m.name)
                                .join(", ") || "N/A",
                            status: p.isEmergency ? "Emergency" : "Normal",
                          })),
                          ...reports.map((r) => ({
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
                              className="border-b border-slate-800 last:border-b-0">
                              <td className="p-4 text-slate-300">
                                {new Date(item.date).toLocaleDateString()}
                              </td>
                              <td className="font-semibold text-white">
                                {item.type}
                              </td>
                              <td className="text-slate-300">
                                {item.details}
                              </td>
                              <td className="text-slate-300 capitalize">
                                <span
                                  className={`rounded px-2 py-1 text-xs ${
                                    item.status === "reviewed" ||
                                    item.status === "Normal"
                                      ? "bg-green-500/20 text-green-400"
                                      : item.status === "Emergency"
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                  }`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-400">No medical history found</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MedicalHistory;
