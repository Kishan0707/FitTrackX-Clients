import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import {
  FaUsers,
  FaCalendarAlt,
  FaDumbbell,
  FaAppleAlt,
  FaWalking,
  FaFilePdf,
  FaFileExcel,
  FaSync,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#ef4444",
  "#f59e0b",
  "#a855f7",
  "#06b6d4",
];
const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #475569",
  borderRadius: "8px",
};

const StatBox = ({ icon, label, value, color }) => (
  <div className='bg-slate-800/60 border border-slate-700 rounded-xl p-4'>
    <div className='flex items-center gap-3'>
      <div className={`text-xl ${color}`}>{icon}</div>
      <div>
        <p className='text-slate-400 text-xs'>{label}</p>
        <p className='text-white font-bold text-xl'>{value}</p>
      </div>
    </div>
  </div>
);

const CoachReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");
  const reportRef = useRef();

  const fetchReport = () => {
    setLoading(true);
    API.get(`/coach/report?days=${days}`)
      .then((res) => {
        console.log(res.data.data);
        setData(res.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [days]);

  const exportPDF = async () => {
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: "#0f172a",
      useCORS: true,
    });
    const pdf = new jsPDF("p", "mm", "a4");
    const imgW = 210;
    const imgH = (canvas.height * imgW) / canvas.width;
    let left = imgH,
      pos = 0;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, pos, imgW, imgH);
    left -= 297;
    while (left > 0) {
      pos = left - imgH;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, pos, imgW, imgH);
      left -= 297;
    }
    pdf.save(`coach-report-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.clients.list.map((c) => ({
          Name: c.name,
          Email: c.email,
          Goal: c.goal,
          Weight: c.weight,
          Status: c.status,
        })),
      ),
      "Clients",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(data.sessions.byStatus),
      "Sessions",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(data.workouts.byType),
      "Workouts",
    );
    XLSX.writeFile(
      wb,
      `coach-report-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

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
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold text-white'>Coach Report</h1>
            <p className='text-slate-400 text-sm'>
              Your clients and activity overview
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className='bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm outline-none'>
              <option value='7'>Last 7 days</option>
              <option value='30'>Last 30 days</option>
              <option value='90'>Last 3 months</option>
              <option value='365'>Last year</option>
            </select>
            <button
              onClick={fetchReport}
              className='bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-700'>
              <FaSync /> Refresh
            </button>
            <button
              onClick={exportPDF}
              className='bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2'>
              <FaFilePdf /> PDF
            </button>
            <button
              onClick={exportExcel}
              className='bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2'>
              <FaFileExcel /> Excel
            </button>
          </div>
        </div>

        <div ref={reportRef} className='space-y-6'>
          {/* Summary Stats */}
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
            <StatBox
              icon={<FaUsers />}
              label='Total Clients'
              value={data?.clients.total || 0}
              color='text-blue-400'
            />
            <StatBox
              icon={<FaCalendarAlt />}
              label='Total Sessions'
              value={data?.sessions.total || 0}
              color='text-yellow-400'
            />
            <StatBox
              icon={<FaDumbbell />}
              label='Total Workouts'
              value={data?.workouts.total || 0}
              color='text-green-400'
            />
            <StatBox
              icon={<FaAppleAlt />}
              label='Diet Logs'
              value={data?.diet.total || 0}
              color='text-purple-400'
            />
            <StatBox
              icon={<FaWalking />}
              label='Steps Met Goal'
              value={data?.steps.metGoal || 0}
              color='text-orange-400'
            />
            <StatBox
              icon={<FaWalking />}
              label='Steps Met Goal'
              value={data?.steps.metGoal || 0}
              color='text-orange-400'
            />
          </div>

          {/* Clients Section */}
          <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
            <h2 className='text-white font-semibold mb-4 flex items-center gap-2'>
              <FaUsers className='text-blue-400' /> My Clients (
              {data?.clients.total})
            </h2>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-slate-400 border-b border-slate-700'>
                    <th className='text-left py-2 pr-4'>Name</th>
                    <th className='text-left py-2 pr-4'>Email</th>
                    <th className='text-left py-2 pr-4'>Goal</th>
                    <th className='text-left py-2 pr-4'>Weight</th>
                    <th className='text-left py-2'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.clients.list.map((c) => (
                    <tr
                      key={c._id}
                      className='border-b border-slate-700/50 hover:bg-slate-700/30'>
                      <td className='py-2 pr-4 text-white font-medium'>
                        {c.name}
                      </td>
                      <td className='py-2 pr-4 text-slate-400'>{c.email}</td>
                      <td className='py-2 pr-4 text-slate-300 capitalize'>
                        {c.goal || "—"}
                      </td>
                      <td className='py-2 pr-4 text-slate-300'>
                        {c.weight ? `${c.weight} kg` : "—"}
                      </td>
                      <td className='py-2'>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            c.status === "active" ?
                              "bg-green-500/20 text-green-400"
                            : "bg-slate-600/40 text-slate-400"
                          }`}>
                          {c.status || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data?.clients.list.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className='py-4 text-slate-500 text-center'>
                        No clients yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Sessions by Status */}
            <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
              <h2 className='text-white font-semibold mb-2 flex items-center gap-2'>
                <FaCalendarAlt className='text-yellow-400' /> Sessions by Status
                <span className='ml-auto text-slate-400 text-xs font-normal'>
                  Last {days} days: {data?.sessions.recent}
                </span>
              </h2>
              <ResponsiveContainer width='100%' height={220}>
                <BarChart
                  data={data?.sessions.byStatus.filter((s) => s.count > 0)}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                  <XAxis
                    dataKey='status'
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey='count' radius={[4, 4, 0, 0]}>
                    {data?.sessions.byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Workouts by Type */}
            <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
              <h2 className='text-white font-semibold mb-2 flex items-center gap-2'>
                <FaDumbbell className='text-green-400' /> Workouts by Type
                <span className='ml-auto text-slate-400 text-xs font-normal'>
                  {data?.workouts.totalCalories.toLocaleString()} kcal total
                </span>
              </h2>
              {data?.workouts.byType.length === 0 ?
                <p className='text-slate-400 text-sm mt-4'>No workout data.</p>
              : <ResponsiveContainer width='100%' height={220}>
                  <PieChart>
                    <Pie
                      data={data?.workouts.byType}
                      dataKey='count'
                      nameKey='type'
                      cx='50%'
                      cy='50%'
                      outerRadius={80}
                      label={({ type, percent }) =>
                        `${type}: ${(percent * 100).toFixed(0)}%`
                      }>
                      {data?.workouts.byType.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              }
            </div>
          </div>

          {/* Diet + Steps Summary */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
              <h2 className='text-white font-semibold mb-4 flex items-center gap-2'>
                <FaAppleAlt className='text-purple-400' /> Diet Summary
              </h2>
              <div className='grid grid-cols-2 gap-3'>
                <div className='bg-slate-700 rounded-lg p-3'>
                  <p className='text-slate-400 text-xs'>Total Diet Logs</p>
                  <p className='text-white font-bold text-xl'>
                    {data?.diet.total}
                  </p>
                </div>
                <div className='bg-slate-700 rounded-lg p-3'>
                  <p className='text-slate-400 text-xs'>Avg Protein</p>
                  <p className='text-white font-bold text-xl'>
                    {data?.diet.avgProtein}g
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-slate-800 border border-slate-700 rounded-xl p-5'>
              <h2 className='text-white font-semibold mb-4 flex items-center gap-2'>
                <FaWalking className='text-orange-400' /> Steps Summary
              </h2>
              <div className='grid grid-cols-2 gap-3'>
                <div className='bg-slate-700 rounded-lg p-3'>
                  <p className='text-slate-400 text-xs'>Total Records</p>
                  <p className='text-white font-bold text-xl'>
                    {data?.steps.total}
                  </p>
                </div>
                <div className='bg-slate-700 rounded-lg p-3'>
                  <p className='text-slate-400 text-xs'>Goal Met</p>
                  <p className='text-green-400 font-bold text-xl'>
                    {data?.steps.metGoal}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachReport;
