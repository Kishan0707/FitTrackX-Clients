import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUserMd,
  FaClock,
  FaStethoscope,
  FaCheck,
  FaTimes,
  FaVideo,
  FaVideoSlash,
  FaPrescription,
  FaFileMedical,
} from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

const DoctorAppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchAppointment = async () => {
      try {
        const res = await API.get(`/doctor/appointments/${id}`);
        setAppointment(res.data.data);
      } catch (err) {
        console.error("Failed to fetch appointment:", err);
        setError(err.response?.data?.message || "Not found");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      await API.put(`/doctor/appointments/${id}/status`, { status });
      setAppointment({ ...appointment, status });
    } catch (error) {
      console.error("Failed to update:", error);
      alert("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const startVideoCall = () => {
    navigate(`/doctor/video?appointmentId=${id}`);
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

  if (error) {
    return (
      <DashboardLayout>
        <div className='flex h-64 flex-col items-center justify-center text-red-400'>
          <p>{error}</p>
          <button
            onClick={() => navigate("/doctor/appointments")}
            className='mt-2 text-orange-500 hover:underline'>
            Back to appointments
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6 p-4 md:p-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <button
            onClick={() => navigate("/doctor/appointments")}
            className='text-sm text-blue-500 hover:underline'>
            ← Back to Appointments
          </button>
          <div className='flex gap-2'>
            {appointment?.status === "scheduled" && (
              <>
                <button
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={updating}
                  className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50'>
                  <FaCheck size={14} />
                  Complete
                </button>
                <button
                  onClick={startVideoCall}
                  className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700'>
                  <FaVideo size={14} />
                  Start Video
                </button>
                <button
                  onClick={() => handleStatusUpdate("cancelled")}
                  disabled={updating}
                  className='flex items-center gap-2 rounded-lg border border-red-500 bg-red-500/10 px-4 py-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50'>
                  <FaTimes size={14} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Main Info */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Patient Info */}
            <div className='rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
              <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white'>
                <FaUserMd className='text-blue-500' />
                Patient Information
              </h3>
              <div className='flex items-center gap-4'>
                 <div className='h-16 w-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white'>
                   {appointment?.patientId?.name?.[0] ?? ''}
                 </div>
                <div>
                  <p className='text-lg font-semibold text-slate-900 dark:text-white'>
                    {appointment?.patientId?.name || "Unknown"}
                  </p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    {appointment?.patientId?.email}
                  </p>
                  <p className='text-sm text-slate-500'>
                    Age: {appointment?.patientId?.age || "N/A"} •{" "}
                    {appointment?.patientId?.gender || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className='rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
              <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white'>
                <FaCalendarAlt className='text-orange-500' />
                Appointment Details
              </h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Date
                  </p>
                   <p className='font-semibold text-slate-900 dark:text-white'>
                     {appointment?.date ? new Date(appointment?.date).toLocaleDateString() : ''}
                   </p>
                </div>
                <div>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Time
                  </p>
                  <p className='font-semibold text-slate-900 dark:text-white'>
                    {appointment?.time}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Status
                  </p>
                 <span
                     className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                       appointment?.status === "scheduled"
                         ? "bg-blue-500/20 text-blue-400"
                         : appointment?.status === "completed"
                         ? "bg-green-500/20 text-green-400"
                         : appointment?.status === "cancelled"
                         ? "bg-red-500/20 text-red-400"
                         : "bg-gray-500/20 text-gray-400"
                     }`}>
                     {appointment?.status ? appointment?.status.charAt(0).toUpperCase() + appointment?.status.slice(1) : ''}
                   </span>
                </div>
                <div>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Reason
                  </p>
                  <p className='font-semibold text-slate-900 dark:text-white'>
                    {appointment?.reason}
                  </p>
                </div>
              </div>
              {appointment?.notes && (
                <div className='mt-4'>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Patient Notes
                  </p>
                  <p className='mt-1 rounded-lg bg-slate-100 p-3 text-slate-900 dark:bg-slate-800 dark:text-white'>
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className='rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
              <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-white'>
                Quick Actions
              </h3>
              <div className='flex flex-wrap gap-3'>
                 <button
                   onClick={() => {
                     if (appointment?.patientId?._id) {
                       navigate(`/doctor/patient/${appointment?.patientId._id}`);
                     }
                   }}
                   className='flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'>
                   <FaUserMd size={14} />
                   View Patient Profile
                 </button>
                <button
                  onClick={() => navigate(`/doctor/prescriptions?patient=${appointment?.patientId?._id}`)}
                  className='flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'>
                  <FaPrescription size={14} />
                  Write Prescription
                </button>
                <button
                  className='flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'>
                  <FaFileMedical size={14} />
                  Add Medical Report
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Doctor Info */}
            <div className='rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
              <h4 className='mb-3 font-semibold text-slate-900 dark:text-white'>
                Your Info
              </h4>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold'>
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className='font-medium text-slate-900 dark:text-white'>
                    {user?.name}
                  </p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    {user?.specialty}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Summary */}
            <div className='rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
              <h4 className='mb-3 font-semibold text-slate-900 dark:text-white'>
                Appointment ID
              </h4>
              <p className='text-sm font-mono text-slate-600 dark:text-slate-400'>
                #{appointment?._id?.slice(-8)}
              </p>
              <p className='mt-2 text-xs text-slate-500'>
                Created:{" "}
                {new Date(appointment?.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointmentDetail;
