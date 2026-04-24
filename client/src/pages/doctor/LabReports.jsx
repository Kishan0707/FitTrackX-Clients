import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileMedical,
  FaUpload,
  FaEye,
  FaDownload,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaPlus,
  FaFileAlt,
  FaFlask,
  FaVial,
  FaTimesCircle,
} from "react-icons/fa";
import {
  MdScience,
  MdOutlineUploadFile,
  MdHealthAndSafety,
  MdAssignment,
} from "react-icons/md";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

const LabReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await API.get(API_ENDPOINTS.DOCTORS.REPORTS);
        setReports(response.data.data || []);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        if (error.response?.status !== 404) {
          setError(
            error.response?.data?.message || "Failed to load lab reports",
          );
        }
        // Mock data for demo
        setReports([
          {
            _id: "1",
            type: "Blood Test",
            patientName: "John Doe",
            patientId: "patient123",
            status: "reviewed",
            fileUrl: "/reports/blood-test-123.pdf",
            createdAt: new Date().toISOString(),
            results: {
              hemoglobin: "14.5 g/dL",
              wbc: "7,500 /μL",
              platelets: "250,000 /μL",
            },
          },
          {
            _id: "2",
            type: "X-Ray Chest",
            patientName: "Jane Smith",
            patientId: "patient456",
            status: "pending",
            fileUrl: "/reports/xray-456.pdf",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            results: null,
          },
          {
            _id: "3",
            type: "Lipid Profile",
            patientName: "Mike Johnson",
            patientId: "patient789",
            status: "reviewed",
            fileUrl: "/reports/lipid-789.pdf",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            results: {
              cholesterol: "180 mg/dL",
              hdl: "55 mg/dL",
              ldl: "100 mg/dL",
              triglycerides: "120 mg/dL",
            },
          },
          {
            _id: "4",
            type: "Urine Analysis",
            patientName: "Sarah Wilson",
            patientId: "patient101",
            status: "pending",
            fileUrl: null,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            results: null,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: reports.length,
    reviewed: reports.filter((r) => r.status === "reviewed").length,
    pending: reports.filter((r) => r.status === "pending").length,
    withFile: reports.filter((r) => r.fileUrl).length,
  };

  const handleFileUpload = (e) => {
    const files = e.target.files || e.dataTransfer?.files;
    if (files?.length > 0) {
      console.log("Files to upload:", files);
      // Handle file upload logic here
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="text-center">
            <div className="relative mb-4">
              <div className="h-20 w-20 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <MdScience className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-blue-500" />
            </div>
            <p className="text-slate-400 animate-pulse">Loading lab reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Lab Reports Management
              </h1>
              <p className="text-slate-400">
                Upload, review, and manage patient lab reports
              </p>
            </div>
            <button
              onClick={() => document.getElementById("fileUpload").click()}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:shadow-blue-500/25">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <MdOutlineUploadFile className="mr-2 inline text-xl" />
              Upload Report
              <input
                id="fileUpload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Total Reports
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {stats.total}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-500/20 p-4 text-blue-400">
                  <MdAssignment className="text-3xl" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Reviewed
                  </p>
                  <p className="mt-2 text-3xl font-bold text-green-400">
                    {stats.reviewed}
                  </p>
                </div>
                <div className="rounded-xl bg-green-500/20 p-4 text-green-400">
                  <FaCheckCircle className="text-3xl" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Pending
                  </p>
                  <p className="mt-2 text-3xl font-bold text-yellow-400">
                    {stats.pending}
                  </p>
                </div>
                <div className="rounded-xl bg-yellow-500/20 p-4 text-yellow-400">
                  <FaClock className="text-3xl" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    With Files
                  </p>
                  <p className="mt-2 text-3xl font-bold text-purple-400">
                    {stats.withFile}
                  </p>
                </div>
                <div className="rounded-xl bg-purple-500/20 p-4 text-purple-400">
                  <FaFileAlt className="text-3xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Drag & Drop Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileUpload(e);
            }}
            className={`mb-6 rounded-2xl border-2 border-dashed p-8 text-center transition ${
              dragOver
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-700 bg-slate-800/30"
            }`}>
            <MdOutlineUploadFile className="mx-auto mb-3 text-5xl text-slate-500" />
            <p className="text-lg font-semibold text-white">
              Drop files here to upload
            </p>
            <p className="mt-1 text-sm text-slate-400">
              or click the Upload Report button above
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="relative flex-1 md:max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by patient or report type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "reviewed"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterStatus(filter)}
                  className={`rounded-xl px-6 py-3 font-semibold transition ${
                    filterStatus === filter
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700"
                  }`}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Grid */}
          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center">
              <FaExclamationTriangle className="mx-auto mb-4 text-6xl text-red-500" />
              <p className="text-xl text-red-400">{error}</p>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report) => (
                <div
                  key={report._id}
                  className="group rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-xl bg-blue-500/20 p-3 text-blue-400">
                      <MdScience className="text-3xl" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                        report.status === "reviewed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                      {report.status === "reviewed" ? (
                        <>
                          <FaCheckCircle />
                          Reviewed
                        </>
                      ) : (
                        <>
                          <FaClock />
                          Pending
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-white">
                    {report.type}
                  </h3>

                  <div className="mb-4 space-y-2">
                    <p className="flex items-center gap-2 text-sm text-slate-300">
                      <FaUserMd className="text-blue-400" />
                      {report.patientName}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-slate-400">
                      <FaCalendarAlt className="text-blue-400" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {report.results && (
                    <div className="mb-4 rounded-lg bg-slate-900/50 p-3">
                      <p className="mb-2 text-xs font-semibold text-slate-400">
                        Key Results:
                      </p>
                      {Object.entries(report.results)
                        .slice(0, 2)
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-xs">
                            <span className="text-slate-400">{key}:</span>
                            <span className="text-white">{value}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowModal(true);
                      }}
                      className="flex-1 rounded-lg bg-slate-700 py-2 text-center text-sm font-semibold text-slate-300 transition hover:bg-slate-600 hover:text-white">
                      <FaEye className="mr-1 inline" />
                      View
                    </button>
                    {report.fileUrl ? (
                      <button className="flex-1 rounded-lg bg-blue-500/20 py-2 text-center text-sm font-semibold text-blue-400 transition hover:bg-blue-500/30">
                        <FaDownload className="mr-1 inline" />
                        Download
                      </button>
                    ) : (
                      <button className="flex-1 rounded-lg bg-slate-700 py-2 text-center text-sm font-semibold text-slate-400 transition hover:bg-slate-600">
                        <FaUpload className="mr-1 inline" />
                        Upload
                      </button>
                    )}
                    <button className="rounded-lg bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/30">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-700 p-12 text-center">
              <MdScience className="mx-auto mb-4 text-6xl text-slate-600" />
              <p className="mb-2 text-xl font-semibold text-slate-400">
                No reports found
              </p>
              <p className="text-slate-500">
                Upload a new report to get started
              </p>
            </div>
          )}

          {/* Report Detail Modal */}
          {showModal && selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    Report Details
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:text-white">
                    <FaTimesCircle />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-blue-500/20 p-4 text-blue-400">
                      <MdScience className="text-4xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {selectedReport.type}
                      </h3>
                      <p className="text-slate-400">
                        {selectedReport.patientName}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-slate-800 p-4">
                      <p className="text-sm text-slate-400">Status</p>
                      <span
                        className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                          selectedReport.status === "reviewed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                        {selectedReport.status === "reviewed" ? (
                          <>
                            <FaCheckCircle />
                            Reviewed
                          </>
                        ) : (
                          <>
                            <FaClock />
                            Pending
                          </>
                        )}
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-800 p-4">
                      <p className="text-sm text-slate-400">Date</p>
                      <p className="mt-2 font-semibold text-white">
                        {new Date(
                          selectedReport.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedReport.results && (
                    <div>
                      <p className="mb-3 text-sm font-semibold text-slate-400">
                        Test Results
                      </p>
                      <div className="space-y-2 rounded-xl bg-slate-800 p-4">
                        {Object.entries(selectedReport.results).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between border-b border-slate-700 py-2 last:border-b-0">
                              <span className="text-slate-300 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </span>
                              <span className="font-semibold text-white">
                                {value}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {selectedReport.fileUrl ? (
                      <button className="flex-1 rounded-xl bg-blue-500 py-3 font-semibold text-white transition hover:bg-blue-600">
                        <FaDownload className="mr-2 inline" />
                        Download Report
                      </button>
                    ) : (
                      <button className="flex-1 rounded-xl bg-slate-700 py-3 font-semibold text-white transition hover:bg-slate-600">
                        <FaUpload className="mr-2 inline" />
                        Upload File
                      </button>
                    )}
                    <button
                      onClick={() =>
                        alert("Update status functionality here")
                      }
                      className="flex-1 rounded-xl bg-green-500 py-3 font-semibold text-white transition hover:bg-green-600">
                      <FaCheckCircle className="mr-2 inline" />
                      Mark Reviewed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LabReports;
