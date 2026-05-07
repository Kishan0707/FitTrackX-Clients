import { useContext, useEffect, useState } from "react";
import { FaVideo, FaCalendarAlt, FaClock, FaUserMd } from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

const VideoConsultHistory = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const res = await API.get("/doctor/video-consult/history");
        setHistory(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex h-64 items-center justify-center'>
          <div className='h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6 p-4 md:p-8'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
            Consultation History
          </h1>
          <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
            Review all your past video consultations
          </p>
        </div>

        {history.length === 0 ? (
          <div className='rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900'>
            <FaVideo className='mx-auto mb-2 text-4xl text-slate-400' />
            <p className='text-slate-600 dark:text-slate-400'>
              No consultations yet.
            </p>
          </div>
        ) : (
          <div className='rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <table className='w-full'>
              <thead className='bg-slate-50 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
                <tr>
                  <th className='px-4 py-3 text-left'>Patient</th>
                  <th className='px-4 py-3 text-left'>Date</th>
                  <th className='px-4 py-3 text-left'>Duration</th>
                  <th className='px-4 py-3 text-left'>Status</th>
                  <th className='px-4 py-3 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
                {history.map((call) => (
                  <tr
                    key={call._id}
                    className='hover:bg-slate-50 dark:hover:bg-slate-800/50'>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <div className='h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold'>
                          {call.patientId?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className='font-medium text-slate-900 dark:text-white'>
                            {call.patientId?.name}
                          </p>
                          <p className='text-xs text-slate-500'>
                            {call.patientId?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3 text-slate-600 dark:text-slate-300'>
                      {new Date(call.startedAt).toLocaleDateString()}
                    </td>
                    <td className='px-4 py-3 text-slate-600 dark:text-slate-300'>
                      {Math.round(call.duration / 60)} mins
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          call.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : call.status === "missed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                        {call.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      {call.recordingUrl && (
                        <a
                          href={call.recordingUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='text-blue-500 hover:underline'>
                          View Recording
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VideoConsultHistory;
