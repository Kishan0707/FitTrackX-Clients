import { useNavigate } from "react-router-dom";

export default function Appointments() {
  const navigate = useNavigate();

  // 🔥 demo data (API से replace करना)
  const appointments = [
    {
      _id: "abc123",
      patientName: "Rahul",
      date: "Today",
    },
  ];

  return (
    <div className='p-6'>
      <h1 className='text-white text-xl mb-4'>Appointments</h1>

      {appointments.map((appointment) => (
        <div
          key={appointment._id}
          className='bg-slate-900 p-4 rounded-xl mb-3 flex justify-between'>
          <div>
            <p className='text-white'>{appointment.patientName}</p>
            <p className='text-slate-400 text-sm'>{appointment.date}</p>
          </div>

          <button
            onClick={() => navigate(`/doctor/video/${appointment._id}`)}
            className='bg-green-500 px-4 py-2 rounded text-white'>
            Start Call
          </button>
        </div>
      ))}
    </div>
  );
}
