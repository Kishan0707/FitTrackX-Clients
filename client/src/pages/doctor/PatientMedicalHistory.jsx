import { useState, useEffect } from "react";
import { FaUserMd, FaFileMedical, FaPrescription, FaNotesMedical, FaHistory, FaPlus, FaUpload, FaStethoscope } from "react-icons/fa";
import { MdTimeline, MdBloodtype } from "react-icons/md";
import API from "../../services/api";

const PatientMedicalHistory = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medicalNotes, setMedicalNotes] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  // Mock patient data - in real app, fetch by patientId from route
  const patientId = "sample-patient-id";

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const [patientRes, notesRes, reportsRes, prescriptionsRes] = await Promise.all([
          API.get(`/patients/${patientId}`),
          API.get(`/patients/${patientId}/medical-notes`),
          API.get(`/patients/${patientId}/lab-reports`),
          API.get(`/patients/${patientId}/prescriptions`),
        ]);
        
        setPatient(patientRes.data.data);
        setMedicalNotes(notesRes.data.data || []);
        setLabReports(reportsRes.data.data || []);
        setPrescriptions(prescriptionsRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch patient data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId]);

  const tabs = [
    { id: "overview", label: "Overview", icon: <MdTimeline /> },
    { id: "notes", label: "Medical Notes", icon: <FaNotesMedical /> },
    { id: "reports", label: "Lab Reports", icon: <FaFileMedical /> },
    { id: "prescriptions", label: "Prescriptions", icon: <FaPrescription /> },
    { id: "history", label: "History", icon: <FaHistory /> },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Patient Header */}
        <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                {patient?.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{patient?.name}</h1>
                <p className="text-blue-400">Age: {patient?.age} • Gender: {patient?.gender}</p>
                <p className="mt-1 text-sm text-slate-400">Patient ID: {patientId}</p>
                {patient.conditions && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {patient.conditions.map((cond, idx) => (
                      <span key={idx} className="rounded-lg bg-red-500/20 px-3 py-1 text-xs text-red-300">
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition">
              <FaPrescription className="mr-2 inline" /> New Prescription
            </button>
          </div>

          {/* Vital Signs */}
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <div className="rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <MdBloodtype className="text-2xl text-red-400" />
                <div>
                  <p className="text-xs text-slate-400">BP</p>
                  <p className="font-bold text-white">{patient?.vitals?.bp || "120/80"} mmHg</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <FaStethoscope className="text-2xl text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Heart Rate</p>
                  <p className="font-bold text-white">{patient?.vitals?.hr || "72"} bpm</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <FaUserMd className="text-2xl text-green-400" />
                <div>
                  <p className="text-xs text-slate-400">Weight</p>
                  <p className="font-bold text-white">{patient?.vitals?.weight || "68"} kg</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <FaNotesMedical className="text-2xl text-yellow-400" />
                <div>
                  <p className="text-xs text-slate-400">Glucose</p>
                  <p className="font-bold text-white">{patient?.vitals?.glucose || "95"} mg/dL</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <FaHistory className="text-2xl text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Last Visit</p>
                  <p className="font-bold text-white">{patient?.lastVisit || "2 days ago"}</p>
                </div>
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
            <div className="grid gap-8 md:grid-cols-2">
              {/* Current Medications */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                  <FaPrescription className="text-orange-400" />
                  Current Medications
                </h3>
                <div className="space-y-3">
                  {prescriptions.slice(0, 2).map((prescription, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-700 p-4">
                      <p className="font-semibold text-white">{prescription.medication}</p>
                      <p className="mt-1 text-sm text-slate-300">{prescription.dosage}</p>
                      <p className="mt-1 text-xs text-slate-400">Duration: {prescription.duration}</p>
                    </div>
                  )) || <p className="text-slate-400">No active prescriptions</p>}
                </div>
              </div>

              {/* Recent Lab Reports */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                  <FaFileMedical className="text-blue-400" />
                  Recent Reports
                </h3>
                <div className="space-y-3">
                  {labReports.slice(0, 3).map((report, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-700 p-4">
                      <div>
                        <p className="font-semibold text-white">{report.name}</p>
                        <p className="text-sm text-slate-400">{report.date}</p>
                      </div>
                      <button className="text-blue-400 hover:underline">View</button>
                    </div>
                  )) || <p className="text-slate-400">No lab reports</p>}
                </div>
              </div>

              {/* Medical History Timeline */}
              <div className="md:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                  <MdTimeline className="text-green-400" />
                  Medical History Timeline
                </h3>
                <div className="relative border-l border-slate-700 pl-6">
                  {medicalNotes.map((note, idx) => (
                    <div key={idx} className="mb-6 relative">
                      <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-orange-500 bg-slate-900"></div>
                      <p className="text-sm text-slate-400">{note.date}</p>
                      <p className="mt-1 font-semibold text-white">{note.title}</p>
                      <p className="mt-1 text-sm text-slate-300">{note.description}</p>
                      <p className="mt-1 text-xs text-slate-500">— Dr. {note.doctorName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Medical Notes</h2>
                <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 transition">
                  <FaPlus /> Add Note
                </button>
              </div>
              <div className="space-y-4">
                {medicalNotes.map((note, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-700 p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-bold text-white">{note.title}</h4>
                      <span className="text-sm text-slate-400">{note.date}</span>
                    </div>
                    <p className="text-slate-300">{note.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
                      <span>Diagnosis: {note.diagnosis}</span>
                      {note.contraindications && (
                        <span className="text-red-400">⚠️ Contraindications noted</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Lab Reports</h2>
                <button className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 transition">
                  <FaUpload /> Upload Report
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {labReports.map((report, idx) => (
                  <div key={idx} className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 p-4 transition hover:border-orange-500">
                    <div className="mb-3 flex items-center justify-between">
                      <FaFileMedical className="text-3xl text-red-400" />
                      <span className="text-sm text-slate-400">{report.date}</span>
                    </div>
                    <h4 className="font-semibold text-white">{report.name}</h4>
                    <p className="mt-1 text-sm text-slate-400">{report.type}</p>
                    {report.status && (
                      <span className={`mt-2 inline-block rounded px-2 py-1 text-xs font-semibold ${
                        report.status === "-reviewed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {report.status === "reviewed" ? "Reviewed" : "Pending Review"}
                      </span>
                    )}
                  </div>
                )) || <p className="text-slate-400">No lab reports uploaded</p>}
              </div>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div>
              <h2 className="mb-4 text-xl font-bold text-white">Prescriptions</h2>
              <div className="space-y-4">
                {prescriptions.map((prescription, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-700 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white">{prescription.medication}</h4>
                        <p className="text-sm text-slate-400">{prescription.diagnosis}</p>
                      </div>
                      <span className="rounded bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                        Active
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-xs text-slate-400">Dosage</p>
                        <p className="font-semibold text-white">{prescription.dosage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Duration</p>
                        <p className="font-semibold text-white">{prescription.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Frequency</p>
                        <p className="font-semibold text-white">{prescription.frequency}</p>
                      </div>
                    </div>
                    {prescription.notes && (
                      <div className="mt-4 rounded-lg bg-slate-800 p-3">
                        <p className="text-sm text-slate-400">Notes:</p>
                        <p className="text-slate-300">{prescription.notes}</p>
                      </div>
                    )}
                  </div>
                )) || (
                  <div className="rounded-xl border-2 border-dashed border-slate-700 p-12 text-center">
                    <FaPrescription className="mx-auto mb-4 text-4xl text-slate-600" />
                    <p className="text-slate-400">No prescriptions yet</p>
                    <button className="mt-4 rounded-xl bg-orange-500 px-6 py-2 font-semibold text-white hover:bg-orange-600">
                      Create Prescription
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h2 className="mb-4 text-xl font-bold text-white">Medical History</h2>
              <div className="rounded-xl border border-slate-700">
                <table className="w-full">
                  <thead className="border-b border-slate-700">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold text-slate-300">Date</th>
                      <th className="p-4 text-left text-sm font-semibold text-slate-300">Condition</th>
                      <th className="p-4 text-left text-sm font-semibold text-slate-300">Severity</th>
                      <th className="p-4 text-left text-sm font-semibold text-slate-300">Status</th>
                      <th className="p-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalNotes.map((note, idx) => (
                      <tr key={idx} className="border-b border-slate-800 last:border-b-0">
                        <td className="p-4 text-slate-300">{note.date}</td>
                        <td className="font-semibold text-white">{note.title}</td>
                        <td className="text-slate-300">
                          <span className={`rounded px-2 py-1 text-xs ${
                            note.severity === "high" ? "bg-red-500/20 text-red-400" :
                            note.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-green-500/20 text-green-400"
                          }`}>
                            {note.severity || " Mild"}
                          </span>
                        </td>
                        <td className="text-slate-300 capitalize">{note.status || "Resolved"}</td>
                        <td>
                          <button className="text-blue-400 hover:underline">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMedicalHistory;
