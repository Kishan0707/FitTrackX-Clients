import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import StepChart from "../../components/StepChart";
import API from "../../services/api";
import { FaWalking } from "react-icons/fa";

const Step = () => {
  const [steps, setSteps] = useState(0);
  const [history, setHistory] = useState([]);
  const [goal, setGoal] = useState(10000);
  const progress = Math.min((steps / goal) * 100, 100).toFixed(1);
  const userId = localStorage.getItem("userId");

  const fetchSteps = async () => {
    const res = await API.get("/steps");
    setHistory(res.data.data.history || []);
    setGoal(res.data.data.goal || 10000);
    setSteps(res.data.data.todaySteps || 0);
  };

  const saveSteps = async () => {
    await API.post("/steps", { steps, goal });
    fetchSteps();
  };

  useEffect(() => {
    fetchSteps();
  }, []);

  return (
    <DashboardLayout>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-2xl font-bold text-white mb-6 flex items-center gap-2'>
          <FaWalking className='text-green-400' />
          Steps Tracker
        </h1>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          {/* Input Card */}
          <div className='bg-slate-900 border border-slate-700 p-6 rounded-xl'>
            <h2 className='text-slate-400 text-sm font-medium mb-4'>
              Log Today's Steps
            </h2>
            <input
              type='tel'
              placeholder='Enter steps'
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value) || 0)}
              className='bg-slate-800 border border-slate-700 text-white p-3 w-full mb-4 rounded-lg outline-none focus:border-green-500 transition-colors'
            />
            <button
              onClick={saveSteps}
              className='bg-green-500 hover:bg-green-600 text-white py-2.5 w-full rounded-lg font-medium transition-colors'>
              Save Steps
            </button>
          </div>

          {/* Progress Card */}
          <div className='bg-slate-900 border border-slate-700 p-6 rounded-xl'>
            <h2 className='text-slate-400 text-sm font-medium mb-4'>
              Daily Goal Progress
            </h2>
            <div className='flex items-end justify-between mb-3'>
              <span className='text-3xl font-bold text-white'>
                {steps.toLocaleString()}
              </span>
              <span className='text-slate-400 text-sm'>
                / {goal.toLocaleString()} steps
              </span>
            </div>
            <div className='bg-slate-700 h-3 rounded-full overflow-hidden mb-2'>
              <div
                className='bg-green-500 h-3 rounded-full transition-all duration-500'
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className='text-green-400 text-sm font-medium'>
              {progress}% of daily goal
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className='bg-slate-900 border border-slate-700 p-6 rounded-xl'>
          <h2 className='text-white font-semibold mb-4'>Steps History</h2>
          {history.length > 0 ?
            <StepChart data={history} />
          : <div className='flex items-center justify-center h-48 text-slate-500 text-sm'>
              No step history yet
            </div>
          }
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Step;
