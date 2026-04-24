import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPrescription,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaUserMd,
  FaCalendarAlt,
  FaPills,
  FaNotesMedical,
  FaTimesCircle,
} from "react-icons/fa";
import {
  MdOutlineLocalPharmacy,
  MdHealthAndSafety,
  MdWarning,
} from "react-icons/md";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

const PrescriptionsManagement = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await API.get(API_ENDPOINTS.DOCTORS.PRESCRIPTIONS);
        setPrescriptions(response.data.data || []);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
        if (error.response?.status !== 404) {
          setError(
            error.response?.data?.message || "Failed to load prescriptions",
          );
        }
        // Use mock data for demo since endpoint might not exist
        setPrescriptions([
          {
            _id: "1",
            patientName: "John Doe",
            patientId: "patient123",
            medicines: [
              {
                name: "Amoxicillin",
                dosage: "500mg",
                frequency: "3 times a day",
              },
              { name: "Ibuprofen", dosage: "200mg", frequency: "As needed" },
            ],
            notes: "Take with food. Complete full course.",
            isEmergency: false,
            status: "active",
            createdAt: new Date().toISOString(),
          },
          {
            _id: "2",
            patientName: "Jane Smith",
            patientId: "patient456",
            medicines: [
              {
                name: "Azithromycin",
                dosage: "250mg",
                frequency: "Once daily",
              },
            ],
            notes: "For throat infection. 5-day course.",
            isEmergency: true,
            status: "emergency",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            _id: "3",
            patientName: "Mike Johnson",
            patientId: "patient789",
            medicines: [
              { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
              {
                name: "Atorvastatin",
                dosage: "10mg",
                frequency: "Once at bedtime",
              },
            ],
            notes: "For diabetes and cholesterol management.",
            isEmergency: false,
            status: "completed",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch =
      prescription.patientName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.medicines?.some((med) =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "emergency" && prescription.isEmergency) ||
      (filterStatus === "active" && prescription.status === "active") ||
      (filterStatus === "completed" && prescription.status === "completed");
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: prescriptions.length,
    active: prescriptions.filter((p) => p.status === "active").length,
    emergency: prescriptions.filter((p) => p.isEmergency).length,
    completed: prescriptions.filter((p) => p.status === "completed").length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
          <div className='text-center'>
            <div className='relative mb-4'>
              <div className='h-20 w-20 animate-spin rounded-full border-4 border-orange-500 border-t-transparent'></div>
              <MdOutlineLocalPharmacy className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-orange-500' />
            </div>
            <p className='text-slate-400 animate-pulse'>
              Loading prescriptions...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8'>
        <div className='mx-auto max-w-7xl'>
          {/* Header */}
          <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-white mb-2'>
                Prescriptions Management
              </h1>
              <p className='text-slate-400'>
                Manage and track all patient prescriptions
              </p>
            </div>
            <button
              onClick={() => navigate("/doctor/prescriptions/new")}
              className='group relative overflow-hidden rounded-xl bg-linear-to-r from-orange-500 to-orange-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:shadow-orange-500/25'>
              <div className='absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
              <FaPlus className='mr-2 inline' />
              New Prescription
            </button>
          </div>

          {/* Stats Cards */}
          <div className='mb-8 grid gap-4 md:grid-cols-4'>
            <div className='rounded-2xl border border-slate-700/50 bg-linear-to-r from-slate-800/80 to-slate-900/80 p-6 backdrop-blur-xl'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold uppercase tracking-wider text-slate-400'>
                    Total
                  </p>
                  <p className='mt-2 text-3xl font-bold text-white'>
                    {stats.total}
                  </p>
                </div>
                <div className='rounded-xl bg-blue-500/20 p-4 text-blue-400'>
                  <FaPrescription className='text-3xl' />
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 backdrop-blur-xl'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold uppercase tracking-wider text-slate-400'>
                    Active
                  </p>
                  <p className='mt-2 text-3xl font-bold text-green-400'>
                    {stats.active}
                  </p>
                </div>
                <div className='rounded-xl bg-green-500/20 p-4 text-green-400'>
                  <FaCheckCircle className='text-3xl' />
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 backdrop-blur-xl'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold uppercase tracking-wider text-slate-400'>
                    Emergency
                  </p>
                  <p className='mt-2 text-3xl font-bold text-red-400'>
                    {stats.emergency}
                  </p>
                </div>
                <div className='rounded-xl bg-red-500/20 p-4 text-red-400'>
                  <MdWarning className='text-3xl' />
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 backdrop-blur-xl'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold uppercase tracking-wider text-slate-400'>
                    Completed
                  </p>
                  <p className='mt-2 text-3xl font-bold text-blue-400'>
                    {stats.completed}
                  </p>
                </div>
                <div className='rounded-xl bg-blue-500/20 p-4 text-blue-400'>
                  <FaCheckCircle className='text-3xl' />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className='mb-6 flex flex-wrap gap-4'>
            <div className='relative flex-1 md:max-w-md'>
              <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
              <input
                type='text'
                placeholder='Search by patient or medicine...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none'
              />
            </div>
            <div className='flex gap-2'>
              {["all", "active", "emergency", "completed"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterStatus(filter)}
                  className={`rounded-xl px-6 py-3 font-semibold transition ${
                    filterStatus === filter ?
                      "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700"
                  }`}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Prescriptions List */}
          {error ?
            <div className='rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center'>
              <FaExclamationTriangle className='mx-auto mb-4 text-6xl text-red-500' />
              <p className='text-xl text-red-400'>{error}</p>
            </div>
          : filteredPrescriptions.length > 0 ?
            <div className='space-y-4'>
              {filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  className='group rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 transition-all duration-300 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10'>
                  <div className='flex flex-wrap items-start justify-between gap-4'>
                    <div className='flex-1'>
                      <div className='mb-4 flex items-center gap-4'>
                        <div className='rounded-xl bg-orange-500/20 p-3 text-orange-400'>
                          <FaUserMd className='text-2xl' />
                        </div>
                        <div>
                          <h3 className='text-xl font-bold text-white'>
                            {prescription.patientName}
                          </h3>
                          <div className='mt-1 flex items-center gap-3 text-sm text-slate-400'>
                            <span className='flex items-center gap-1'>
                              <FaCalendarAlt />
                              {new Date(
                                prescription.createdAt,
                              ).toLocaleDateString()}
                            </span>
                            <span className='flex items-center gap-1'>
                              <FaPills />
                              {prescription.medicines?.length || 0} medications
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Medicines List */}
                      <div className='mb-4 grid gap-2 md:grid-cols-2'>
                        {prescription.medicines?.map((med, idx) => (
                          <div
                            key={idx}
                            className='rounded-lg bg-slate-900/50 p-3'>
                            <p className='font-semibold text-white'>
                              {med.name}
                            </p>
                            <p className='text-sm text-slate-300'>
                              {med.dosage}
                            </p>
                            <p className='text-xs text-slate-400'>
                              {med.frequency}
                            </p>
                          </div>
                        ))}
                      </div>

                      {prescription.notes && (
                        <div className='rounded-lg bg-slate-900/50 p-3'>
                          <p className='flex items-start gap-2 text-sm text-slate-300'>
                            <FaNotesMedical className='mt-1 text-orange-400' />
                            {prescription.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className='flex flex-col items-end gap-3'>
                      {/* Status Badges */}
                      <div className='flex gap-2'>
                        {prescription.isEmergency && (
                          <span className='inline-flex items-center gap-1 rounded-full bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-400'>
                            <FaExclamationTriangle />
                            Emergency
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold ${
                            prescription.status === "completed" ?
                              "bg-green-500/20 text-green-400"
                            : prescription.status === "active" ?
                              "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                          {prescription.status === "completed" ?
                            <FaCheckCircle />
                          : prescription.status === "active" ?
                            <FaClock />
                          : <FaTimesCircle />}
                          {prescription.status}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className='flex gap-2'>
                        <button
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setShowModal(true);
                          }}
                          className='rounded-lg bg-slate-700 p-3 text-slate-300 transition hover:bg-slate-600 hover:text-white'>
                          <FaEye />
                        </button>
                        <button className='rounded-lg bg-slate-700 p-3 text-slate-300 transition hover:bg-slate-600 hover:text-white'>
                          <FaEdit />
                        </button>
                        <button className='rounded-lg bg-red-500/20 p-3 text-red-400 transition hover:bg-red-500/30'>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          : <div className='rounded-2xl border-2 border-dashed border-slate-700 p-12 text-center'>
              <FaPrescription className='mx-auto mb-4 text-6xl text-slate-600' />
              <p className='mb-4 text-slate-400'>No prescriptions found</p>
              <button
                onClick={() => navigate("/doctor/prescriptions/new")}
                className='rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-orange-500/25'>
                <FaPlus className='mr-2 inline' />
                Create Prescription
              </button>
            </div>
          }

          {/* Detail Modal */}
          {showModal && selectedPrescription && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
              <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-8'>
                <div className='mb-6 flex items-center justify-between'>
                  <h2 className='text-2xl font-bold text-white'>
                    Prescription Details
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className='rounded-lg bg-slate-800 p-2 text-slate-400 hover:text-white'>
                    <FaTimesCircle />
                  </button>
                </div>

                <div className='space-y-6'>
                  <div>
                    <p className='text-sm text-slate-400'>Patient</p>
                    <p className='text-xl font-bold text-white'>
                      {selectedPrescription.patientName}
                    </p>
                  </div>

                  <div>
                    <p className='mb-3 text-sm font-semibold text-slate-400'>
                      Medications
                    </p>
                    <div className='space-y-3'>
                      {selectedPrescription.medicines?.map((med, idx) => (
                        <div key={idx} className='rounded-xl bg-slate-800 p-4'>
                          <p className='font-semibold text-white'>{med.name}</p>
                          <p className='text-sm text-slate-300'>{med.dosage}</p>
                          <p className='text-xs text-slate-400'>
                            {med.frequency}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPrescription.notes && (
                    <div>
                      <p className='mb-2 text-sm font-semibold text-slate-400'>
                        Notes
                      </p>
                      <p className='rounded-xl bg-slate-800 p-4 text-slate-300'>
                        {selectedPrescription.notes}
                      </p>
                    </div>
                  )}

                  <div className='flex items-center gap-4'>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                        selectedPrescription.status === "completed" ?
                          "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                      }`}>
                      {selectedPrescription.status}
                    </span>
                    {selectedPrescription.isEmergency && (
                      <span className='inline-flex items-center gap-1 rounded-full bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-400'>
                        <FaExclamationTriangle />
                        Emergency
                      </span>
                    )}
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

export default PrescriptionsManagement;
