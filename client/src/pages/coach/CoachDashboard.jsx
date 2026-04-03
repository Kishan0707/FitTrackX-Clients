import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import {
  FaUsers,
  FaDumbbell,
  FaCalendarAlt,
  FaRupeeSign,
  FaCheck,
  FaTimes,
  FaUser,
  FaArrowRight,
} from "react-icons/fa";

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className='bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4'>
    <div className={`text-3xl ${color}`}>{icon}</div>
    <div>
      <p className='text-slate-400 text-xs mb-1'>{label}</p>
      <p className='text-white text-2xl font-bold'>{value}</p>
      {sub && <p className='text-slate-400 text-xs mt-1'>{sub}</p>}
    </div>
  </div>
);

const CoachDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [pending, setPending] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [statsRes, pendingRes, sessionsRes, clientsRes] = await Promise.all(
        [
          API.get("/coach/dashboard"),
          API.get("/coach/pending-requests"),
          API.get("/sessions/my-sessions").catch(() => ({
            data: { data: [] },
          })),
          API.get("/coach/clients"),
        ],
      );
      setStats(statsRes.data.data || {});
      setPending(pendingRes.data.data || []);
      setSessions(sessionsRes.data.data || []);
      setClients(clientsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const respond = async (clientId, action) => {
    await API.patch("/coach/respond-request", { clientId, action });
    fetchAll();
  };

  // Today's sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySessions = sessions.filter((s) => new Date(s.date) >= today);

  if (loading)
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' />
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-2xl font-bold text-white'>Coach Dashboard</h1>
          <p className='text-slate-400 text-sm'>
            Welcome back! Here's your overview.
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatCard
            icon={<FaUsers />}
            label='Total Clients'
            value={stats.totalClients || 0}
            sub={`${stats.activeClientsCount || 0} active`}
            color='text-blue-400'
          />
          <StatCard
            icon={<FaDumbbell />}
            label='Active Plans'
            value={stats.activePlans || 0}
            color='text-green-400'
          />
          <StatCard
            icon={<FaCalendarAlt />}
            label='Sessions This Month'
            value={stats.monthlySessions || 0}
            sub={`${todaySessions.length} today`}
            color='text-yellow-400'
          />
          <StatCard
            icon={<FaRupeeSign />}
            label='Revenue'
            value={`₹${(stats.revenue || 0).toLocaleString()}`}
            sub={`₹${(stats.monthlyRevenue || 0).toLocaleString()} this month`}
            color='text-purple-400'
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Pending Requests */}
          <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-white font-semibold'>Pending Requests</h2>
              {pending.length > 0 && (
                <span className='bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-medium'>
                  {pending.length}
                </span>
              )}
            </div>
            {pending.length === 0 ?
              <p className='text-slate-400 text-sm'>No pending requests.</p>
            : <div className='space-y-3'>
                {pending.slice(0, 4).map((p) => (
                  <div
                    key={p._id}
                    className='flex items-center gap-3 bg-slate-700 rounded-lg p-3'>
                    <div className='w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0'>
                      <FaUser className='text-slate-300 text-xs' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-white text-sm font-medium truncate'>
                        {p.name}
                      </p>
                      {p.coachRequest?.target && (
                        <p className='text-slate-400 text-xs truncate'>
                          🎯 {p.coachRequest.target}
                        </p>
                      )}
                    </div>
                    <div className='flex gap-1 shrink-0'>
                      <button
                        onClick={() => respond(p._id, "accepted")}
                        className='bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-lg'>
                        <FaCheck className='text-xs' />
                      </button>
                      <button
                        onClick={() => respond(p._id, "rejected")}
                        className='bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg'>
                        <FaTimes className='text-xs' />
                      </button>
                    </div>
                  </div>
                ))}
                {pending.length > 4 && (
                  <button
                    onClick={() => navigate("/coach/clients")}
                    className='text-blue-400 text-xs hover:underline'>
                    +{pending.length - 4} more → View all
                  </button>
                )}
              </div>
            }
          </div>

          {/* Today's Sessions */}
          <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-white font-semibold'>Today's Sessions</h2>
              <button
                onClick={() => navigate("/coach/sessions")}
                className='text-blue-400 text-xs hover:underline flex items-center gap-1'>
                View all <FaArrowRight className='text-[10px]' />
              </button>
            </div>
            {todaySessions.length === 0 ?
              <p className='text-slate-400 text-sm'>No sessions today.</p>
            : <div className='space-y-3'>
                {todaySessions.slice(0, 4).map((s) => (
                  <div
                    key={s._id}
                    className='flex items-center gap-3 bg-slate-700 rounded-lg p-3'>
                    <div className='w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center shrink-0'>
                      <FaCalendarAlt className='text-blue-400 text-xs' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-white text-sm font-medium truncate'>
                        {s.title}
                      </p>
                      <p className='text-slate-400 text-xs'>
                        {s.clientId?.name || "—"} ·{" "}
                        {new Date(s.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>

        {/* My Clients */}
        <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-white font-semibold'>My Clients</h2>
            <button
              onClick={() => navigate("/coach/clients")}
              className='text-blue-400 text-xs hover:underline flex items-center gap-1'>
              View all <FaArrowRight className='text-[10px]' />
            </button>
          </div>
          {clients.length === 0 ?
            <p className='text-slate-400 text-sm'>No clients yet.</p>
          : <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
              {clients.slice(0, 8).map((c) => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/coach/clients/${c._id}`)}
                  className='flex items-center gap-2 bg-slate-700 hover:bg-slate-600 rounded-lg p-3 cursor-pointer transition-colors'>
                  <div className='w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center shrink-0'>
                    <FaUser className='text-slate-300 text-xs' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-white text-sm font-medium truncate'>
                      {c.name}
                    </p>
                    <p className='text-slate-400 text-xs truncate'>{c.email}</p>
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

export default CoachDashboard;
