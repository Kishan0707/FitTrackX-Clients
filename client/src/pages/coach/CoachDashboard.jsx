import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { FaAppleAlt, FaDumbbell, FaFire, FaUsers } from "react-icons/fa";
import API from "../../services/api";

const CoachDashboard = () => {
  const [client, setClient] = useState(0);
  const [session, setSession] = useState(0);
  useEffect(() => {
    const fetchClient = async () => {
      const res = await API.get("/coach/dashboard");
      console.log(res.data);
      setClient(res.data.data);
    };
    const fetchSessions = async () => {
      const res = await API.get("/sessions/my-sessions");
      console.log(res.data);
      setSession(res.data.data);
    };
    fetchClient();
    fetchSessions();
  }, []);
  return (
    <DashboardLayout>
      <h1 className='mb-6 text-2xl font-bold'>Coach Dashboard</h1>
      <p>
        Welcome to your dashboard. You can manage your sessions, view reports,
        and more here.
      </p>
      <div className='grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4 mt-6'>
        {/* Dashboard cards go here */}
        {/* <h2 className="text-xl font-semibold">Upcoming Sessions</h2> */}
        {/* Total Users Card */}
        <div className='p-6 shadow-md bg-slate-900 rounded-xl'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='mb-2 text-sm text-slate-400'>👥 Client</h3>
              <p className='text-3xl font-bold text-white'>
                {client.totalClients || 0}
              </p>
              <p className='mt-2 text-sm text-green-400'>
                {/* +{stats.userGrowth || 0}% */}
              </p>
            </div>
            <FaUsers className='text-2xl text-slate-600' />
          </div>
        </div>

        {/* Total Workouts Card */}
        <div className='p-6 shadow-md bg-slate-900 rounded-xl'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='mb-2 text-sm text-slate-400'>💪 Active Client</h3>
              <p className='text-3xl font-bold text-white'>
                {client.activeClientsCount || 0}
              </p>
              <p className='mt-2 text-sm text-blue-400'>
                {/* +{stats.monthWorkouts || 0} MTD */}
              </p>
            </div>
            <FaDumbbell className='text-2xl text-slate-600' />
          </div>
        </div>

        {/* Total Monthly Sessions Card */}
        <div className='p-6 shadow-md bg-slate-900 rounded-xl'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='mb-2 text-sm text-slate-400'>
                🍽️ Monthly Sessions
              </h3>
              <p className='text-3xl font-bold text-white'>
                {session.length || 0}
              </p>
              <p className='mt-2 text-sm text-yellow-400'>
                {/* {Math.round((stats.totalDiets || 0) * 0.73)} Active */}
              </p>
            </div>
            <FaAppleAlt className='text-2xl text-slate-600' />
          </div>
        </div>

        {/* revenue Card */}
        <div className='p-6 shadow-md bg-slate-900 rounded-xl'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='mb-2 text-sm text-slate-400'>🏋️ Revenue</h3>
              <p className='text-3xl font-bold text-white'>
                {/* {Math.round((stats.totalUsers || 0) * 0.08)} */}
                {client.revenue || 0}
              </p>
              <p className='mt-2 text-sm text-purple-400'>
                {/* {Math.round((stats.totalUsers || 0) * 0.65)} Users */}
              </p>
            </div>
            <FaFire className='text-2xl text-slate-600' />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachDashboard;
