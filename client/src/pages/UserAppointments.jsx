import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUserMd,
  FaClock,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import DashboardLayout from "../layout/DashboardLayout";
import API from "../services/api";
import { AuthContext } from "../context/authContext";

const UserAppointments = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [aptRes, doctorsRes] = await Promise.all([
          API.get("/user/appointments"),
          API.get("/doctors"),
        ]);

        setAppointments(aptRes.data.data || []);
        setDoctors(doctorsRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/appointments", formData);
      alert("Appointment booked successfully!");
      setShowBooking(false);
      setFormData({
        doctorId: "",
        date: "",
        time: "",
        reason: "",
        notes: "",
      });

      // Refresh appointments
      const res = await API.get("/user/appointments");
      setAppointments(res.data.data || []);
    } catch (error) {
      console.error("Failed to book:", error);
      alert(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/20 text-blue-400";
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex h-64 items-center justify-center'>
          <div className='h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500'></div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredDoctors = doctors.filter((doc) =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedDoctor = doctors.find((d) => d._id === formData.doctorId);

  return (
    <DashboardLayout>
      <div className='space-y-6 p-4 md:p-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
              Appointments
            </h1>
            <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
              Book and manage your doctor appointments
            </p>
          </div>
          <button
            onClick={() => setShowBooking(true)}
            className='flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600'>
            <FaPlus size={14} />
            Book Appointment
          </button>
        </div>

        {/* Booking Modal */}
        {showBooking && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-xl font-bold text-slate-900 dark:text-white'>
                  Book Appointment
                </h3>
                <button
                  onClick={() => setShowBooking(false)}
                  className='text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'>
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                {/* Doctor Search */}
                <div>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Select Doctor
                  </label>
                  <div className='relative mt-1'>
                    <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
                    <input
                      type='text'
                      placeholder='Search doctors...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  {searchTerm && (
                    <div className='mt-2 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'>
                      {filteredDoctors.map((doc) => (
                        <button
                          key={doc._id}
                          type='button'
                          onClick={() => {
                            setFormData({ ...formData, doctorId: doc._id });
                            setSearchTerm("");
                          }}
                          className='flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700'>
                          <div className='h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold'>
                            {doc.name?.charAt(0)}
                          </div>
                          <div>
                            <p className='font-medium text-slate-900 dark:text-white'>
                              {doc.name}
                            </p>
                            <p className='text-xs text-slate-500'>
                              {doc.specialty}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Date
                    </label>
                    <input
                      type='date'
                      name='date'
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Preferred Time
                    </label>
                    <input
                      type='time'
                      name='time'
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                </div>

                <div>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Reason for Visit
                  </label>
                  <textarea
                    name='reason'
                    value={formData.reason}
                    onChange={handleChange}
                    rows='2'
                    required
                    placeholder='Briefly describe your symptoms or reason...'
                    className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Additional Notes (optional)
                  </label>
                  <textarea
                    name='notes'
                    value={formData.notes}
                    onChange={handleChange}
                    rows='2'
                    placeholder='Any additional information...'
                    className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  />
                </div>

                {selectedDoctor && (
                  <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
                    <div className='flex items-center gap-3'>
                      <div className='h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg'>
                        {selectedDoctor.name?.charAt(0)}
                      </div>
                      <div>
                        <p className='font-semibold text-slate-900 dark:text-white'>
                          {selectedDoctor.name}
                        </p>
                        <p className='text-sm text-slate-600 dark:text-slate-400'>
                          {selectedDoctor.specialty}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className='flex justify-end gap-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => setShowBooking(false)}
                    className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'>
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={saving || !formData.doctorId}
                    className='flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 text-white transition hover:bg-orange-600 disabled:opacity-50'>
                    <FaCheck size={14} />
                    {saving ? "Booking..." : "Book Appointment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className='rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <div className='border-b border-slate-200 p-4 dark:border-slate-800'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
              Your Appointments ({appointments.length})
            </h3>
          </div>

          {appointments.length === 0 ?
            <div className='p-8 text-center text-slate-500 dark:text-slate-400'>
              <FaCalendarAlt className='mx-auto mb-2 text-3xl' />
              <p>No appointments yet.</p>
              <button
                onClick={() => setShowBooking(true)}
                className='mt-2 text-orange-500 hover:underline'>
                Book your first appointment
              </button>
            </div>
          : <div className='divide-y divide-slate-200 dark:divide-slate-800'>
              {appointments.map((apt) => (
                <div
                  key={apt._id}
                  className='p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50'>
                  <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                    <div className='flex items-start gap-4'>
                      <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold'>
                        {apt.doctorId?.name?.charAt(0) || "D"}
                      </div>
                      <div>
                        <p className='font-semibold text-slate-900 dark:text-white'>
                          {apt.doctorId?.name || "Unknown Doctor"}
                        </p>
                        <p className='text-sm text-slate-600 dark:text-slate-400'>
                          {apt.doctorId?.specialty}
                        </p>
                        <div className='mt-1 flex items-center gap-3 text-xs text-slate-500'>
                          <span className='flex items-center gap-1'>
                            <FaCalendarAlt size={12} />
                            {new Date(apt.date).toLocaleDateString()}
                          </span>
                          <span className='flex items-center gap-1'>
                            <FaClock size={12} />
                            {apt.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-1 items-center justify-between'>
                      <p className='text-sm text-slate-600 dark:text-slate-400 max-w-xs'>
                        {apt.reason}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                          apt.status,
                        )}`}>
                        {apt.status.charAt(0).toUpperCase() +
                          apt.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserAppointments;
