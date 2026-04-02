import React, { useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleDateString("en-IN", options);
};

const Session = () => {
  const [sessions, setSessions] = React.useState([]);
  const [clients, setClients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [formData, setFormData] = React.useState({
    title: "",
    clientId: "",
    date: "",
    time: "",
  });
  //   POST   /api/sessions              # Create session
  // GET    /api/sessions/my-sessions  # Get all coach sessions
  // DELETE /api/sessions/:id          # Delete session
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.clientId.trim()) {
      setError("Please select a client");
      return;
    }
    if (!formData.date) {
      setError("Date is required");
      return;
    }
    if (!formData.time) {
      setError("Time is required");
      return;
    }

    try {
      // Combine date + time into ISO format
      const combinedDate = new Date(`${formData.date}T${formData.time}`);

      console.log("Submitting session:", {
        title: formData.title,
        clientId: formData.clientId,
        date: combinedDate.toISOString(),
      });

      const res = await API.post("/sessions", {
        title: formData.title,
        clientId: formData.clientId,
        date: combinedDate.toLocaleString(),
      });

      setSuccess("Session created successfully");
      setFormData({
        title: "",
        clientId: "",
        date: "",
        time: "",
      });
      setTimeout(() => fetchSessions(), 1000);
    } catch (err) {
      console.error("Create session error:", err.response?.data || err.message);
      setError(
        "Failed to create session: " +
          (err.response?.data?.message || err.message),
      );
    }
  };
  const fetchSessions = async () => {
    try {
      const res = await API.get("/sessions/my-sessions");
      console.log("sessions response:", res.data);
      setSessions(Array.isArray(res.data.data) ? res.data.data : []);
      setSuccess("Sessions fetched successfully");
      setTimeout(() => setSuccess(""), 3000);
      setError("");
    } catch (err) {
      console.error("Fetch sessions error:", err);
      setError("Failed to fetch sessions: " + err.message);
      setTimeout(() => setError(""), 3000);
      setSuccess("");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchClients = async () => {
    try {
      const res = await API.get("/coach/clients");
      console.log("clients response:", res.data);
      setClients(Array.isArray(res.data.data) ? res.data.data : []);
      setSuccess("Clients fetched successfully");
      setTimeout(() => setSuccess(""), 3000);
      setError("");
    } catch (err) {
      console.error("Fetch clients error:", err.response?.data || err.message);
      setError(
        "Failed to fetch clients: " +
          (err.response?.data?.message || err.message),
      );
      setTimeout(() => setError(""), 3000);
      setSuccess("");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSessions();
    fetchClients();
  }, []);

  return (
    <DashboardLayout>
      <div className='bg-slate-900 p-5'>
        <div className='p-5 bg-slate-800 border border-slate-700'>
          <h1 className='text-2xl font-bold mb-4'>Sessions</h1>
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>
              {error}
            </div>
          )}
          {success && (
            <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4'>
              {success}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className='grid  gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full'>
            <div className='mb-4 w-full'>
              <label
                className='block  text-gray-300 text-sm font-bold mb-2'
                htmlFor='title'>
                Title
              </label>
              <input
                className='bg-slate-700 px-4 py-2 rounded w-full  text-gray-300 placeholder:text-gray-500 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                id='title'
                type='text'
                placeholder='Enter session title'
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className='mb-4'>
              <label
                className='block  text-gray-300 text-sm font-bold mb-2'
                htmlFor='clientId'>
                Client Id
              </label>
              <select
                value={formData.clientId}
                id='clientId'
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
                className='bg-slate-700 px-4 py-2 rounded w-full text-gray-300 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500'>
                <option value=''>Select Client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>
            <div className='mb-4'>
              <label
                className='block text-gray-300 text-sm font-bold mb-2'
                htmlFor='date'>
                Date
              </label>
              <input
                className='bg-slate-700 px-4 py-2 rounded w-full  text-gray-300 placeholder:text-gray-500 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                id='date'
                type='date'
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className='mb-4'>
              <label
                className='block text-gray-300 text-sm font-bold mb-2'
                htmlFor='time'>
                Time
              </label>
              <input
                className='bg-slate-700 px-4 py-2 rounded w-full  text-gray-300 placeholder:text-gray-500 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                id='time'
                type='time'
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
            <button
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300'
              type='submit'>
              Create Session
            </button>
          </form>
          <div className='grid md:grid-cols-1 lg:grid-cols-3 gap-5 mt-10  p-5 rounded'>
            {Array.isArray(sessions) && sessions.length > 0 ?
              sessions.map((session) => (
                <div
                  key={session._id}
                  className='bg-slate-900/80 backdrop-blur-2xl border border-slate-700 p-5 rounded flex justify-between items-center shadow-md'>
                  <div>
                    <h3 className='text-lg font-bold'>{session.title}</h3>
                    <p className='text-gray-400'>
                      Client: {session.clientId?.name || session.clientId}
                    </p>
                    <p className='text-gray-400'>
                      Date: {formatDate(session.date)}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await API.delete(`/sessions/${session._id}`);
                      fetchSessions();
                    }}
                    className='bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded'>
                    Delete
                  </button>
                </div>
              ))
            : <div className='text-gray-400'>No sessions found</div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Session;
