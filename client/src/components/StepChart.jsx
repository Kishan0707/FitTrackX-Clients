import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const StepChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
          labelStyle={{ color: "#94a3b8" }}
          itemStyle={{ color: "#22c55e" }}
        />
        <Line type="monotone" dataKey="steps" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StepChart;
