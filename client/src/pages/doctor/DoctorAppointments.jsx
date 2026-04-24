import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaTimes,
  FaUser,
  FaVideo,
  FaHospital,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { MdPending, MdCancel } from "react-icons/md";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import DashboardLayout from "../../layout/DashboardLayout";
import { useNavigate } from "react-router-dom";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeFilter, searchTerm]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await API.get(API_ENDPOINTS.DOCTORS.APPOINTMENTS);
      if (res.data?.success) {
        setAppointments(res.data.data || []);
      }
    } catch (err) {
      console.error("Appointments fetch error:", err);
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (activeFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === activeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.type?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredAppointments(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        icon: <MdPending />,
      },
      confirmed: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        icon: <FaCheck />,
      },
      completed: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        icon: <FaCheck />,
      },
      cancelled: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        icon: <MdCancel />,
      },
      "in-progress": {
        bg: "bg-orange-500/20",
        text: "text-orange-400",
        icon: <FaClock />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const getModeIcon = (mode) => {
    if (mode === "video") return <FaVideo className='text-blue-400' />;
    if (mode === "in-person") return <FaHospital className='text-green-400' />;
    return <FaCalendarAlt className='text-slate-400' />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filters = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "in-progress", label: "In Progress" },
  ];

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-slate-950 md:p-6'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-white'>Appointments</h1>
          <p className='text-slate-400'>Manage your patient appointments</p>
        </div>

        {/* Stats Cards */}
        <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-xl border border-slate-800 bg-slate-900 p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-400'>Total</p>
                <p className='mt-1 text-2xl font-bold text-white'>
                  {appointments.length}
                </p>
              </div>
              <FaCalendarAlt className='text-3xl text-orange-400' />
            </div>
          </div>
          <div className='rounded-xl border border-slate-800 bg-slate-900 p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-400'>Pending</p>
                <p className='mt-1 text-2xl font-bold text-white'>
                  {appointments.filter((a) => a.status === "pending").length}
                </p>
              </div>
              <MdPending className='text-3xl text-yellow-400' />
            </div>
          </div>
          <div className='rounded-xl border border-slate-800 bg-slate-900 p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-400'>Today</p>
                <p className='mt-1 text-2xl font-bold text-white'>
                  {
                    appointments.filter(
                      (a) =>
                        new Date(a.date).toDateString() ===
                        new Date().toDateString(),
                    ).length
                  }
                </p>
              </div>
              <FaClock className='text-3xl text-blue-400' />
            </div>
          </div>
          <div className='rounded-xl border border-slate-800 bg-slate-900 p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-400'>Completed</p>
                <p className='mt-1 text-2xl font-bold text-white'>
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
              </div>
              <FaCheck className='text-3xl text-green-400' />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex flex-wrap gap-2'>
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === filter.id ?
                    "bg-orange-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}>
                {filter.label}
              </button>
            ))}
          </div>

          <div className='relative'>
            <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
            <input
              type='text'
              placeholder='Search patient...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none md:w-64'
            />
          </div>
        </div>

        {/* Appointments Table */}
        {loading ?
          <div className='flex items-center justify-center py-20'>
            <div className='h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent'></div>
          </div>
        : error ?
          <div className='rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-center text-red-400'>
            {error}
          </div>
        : filteredAppointments.length === 0 ?
          <div className='rounded-xl border border-slate-800 bg-slate-900 p-12 text-center'>
            <FaCalendarAlt className='mx-auto mb-4 text-5xl text-slate-700' />
            <p className='text-lg text-slate-400'>No appointments found</p>
            <p className='mt-2 text-sm text-slate-500'>
              {searchTerm || activeFilter !== "all" ?
                "Try adjusting your filters"
              : "Your appointments will appear here"}
            </p>
          </div>
        : <div className='overflow-hidden rounded-xl border border-slate-800 bg-slate-900'>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[800px]'>
                <thead className='border-b border-slate-800 bg-slate-800/50'>
                  <tr>
                    <th className='p-4 text-left text-sm font-semibold text-slate-300'>
                      Patient
                    </th>
                    <th className='p-4 text-left text-sm font-semibold text-slate-300'>
                      Date
                    </th>
                    <th className='p-4 text-left text-sm font-semibold text-slate-300'>
                      Time
                    </th>
                    <th className='p-4 text-left text-sm font-semibold text-slate-300'>
                      Type
                    </th>
                    <th className='p-4 text-left text-sm font-semibold text-slate-300'>
                      Mode
                    </th>
                    <th className='p-4 text-left text-sm font-semibold text-slate-300'>
                      Status
                    </th>
                    <th className='p-4 text-left text-sm font-semibold text-slate-300'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-800'>
                  {filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className='transition hover:bg-slate-800/50'>
                      <td className='p-4'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-700'>
                            <FaUser className='text-slate-300' />
                          </div>
                          <div>
                            <p className='font-semibold text-white'>
                              {appointment.patientName || "Unknown Patient"}
                            </p>
                            <p className='text-xs text-slate-400'>
                              {appointment.patientPhone || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='p-4 text-slate-300'>
                        {formatDate(appointment.date)}
                      </td>
                      <td className='p-4 text-slate-300'>
                        {appointment.timeSlot ?
                          formatTime(appointment.timeSlot)
                        : formatTime(appointment.time)}
                      </td>
                      <td className='p-4'>
                        <span className='text-sm text-slate-300 capitalize'>
                          {appointment.type || "Consultation"}
                        </span>
                      </td>
                      <td className='p-4'>
                        <div className='flex items-center gap-2'>
                          {getModeIcon(appointment.mode)}
                          <span className='text-sm text-slate-300 capitalize'>
                            {appointment.mode || "video"}
                          </span>
                        </div>
                      </td>
                      <td className='p-4'>
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className='p-4'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() =>
                              navigate(
                                `/doctor/patient/${appointment.patientId}`,
                              )
                            }
                            className='rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700'>
                            View
                          </button>
                          {appointment.status === "pending" && (
                            <button className='rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-semibold text-green-400 transition hover:bg-green-500/30'>
                              Accept
                            </button>
                          )}
                          {appointment.mode === "video" &&
                            appointment.status === "confirmed" && (
                              <button className='rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/30'>
                                Join
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
