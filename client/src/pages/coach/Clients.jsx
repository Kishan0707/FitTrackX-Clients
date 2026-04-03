import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { FaUser, FaCheck, FaTimes, FaEye } from "react-icons/fa";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [loadingClient, setLoadingClient] = useState(false);

  const fetchData = async () => {
    try {
      const [clientsRes, pendingRes] = await Promise.all([
        API.get("/coach/clients"),
        API.get("/coach/pending-requests"),
      ]);
      setClients(clientsRes.data.data);
      setPending(pendingRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const respond = async (clientId, action) => {
    await API.patch("/coach/respond-request", { clientId, action });
    fetchData();
  };

  useEffect(() => {
    if (!selectedClient) {
      setClientData(null);
      return;
    }
    setLoadingClient(true);
    API.get(`/coach/client-progress/${selectedClient._id}`)
      .then((res) => setClientData(res.data.data))
      .catch(() => setClientData(null))
      .finally(() => setLoadingClient(false));
  }, [selectedClient]);

  if (loading)
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500' />
      </div>
    );

  return (
    <DashboardLayout>
      <div className='p-4 space-y-8'>
        {/* Pending Requests */}
        {pending.length > 0 && (
          <div>
            <h2 className='text-white font-semibold text-lg mb-3'>
              Pending Requests
              <span className='ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full'>
                {pending.length}
              </span>
            </h2>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {pending.map((p) => (
                <div
                  key={p._id}
                  className='bg-slate-800 border border-yellow-500/30 rounded-xl p-4 space-y-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center'>
                      <FaUser className='text-slate-300' />
                    </div>
                    <div>
                      <p className='text-white font-medium'>{p.name}</p>
                      <p className='text-slate-400 text-xs'>{p.email}</p>
                    </div>
                  </div>
                  {p.coachRequest?.target && (
                    <p className='text-slate-300 text-sm bg-slate-700 rounded px-3 py-2'>
                      🎯 Target: {p.coachRequest.target}
                    </p>
                  )}
                  <div className='flex gap-2'>
                    <button
                      onClick={() => respond(p._id, "accepted")}
                      className='flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm'>
                      <FaCheck /> Accept
                    </button>
                    <button
                      onClick={() => respond(p._id, "rejected")}
                      className='flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm'>
                      <FaTimes /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Clients */}
        <div>
          <h2 className='text-white font-semibold text-lg mb-3'>
            My Clients
            <span className='ml-2 bg-slate-600 text-white text-xs px-2 py-0.5 rounded-full'>
              {clients.length}
            </span>
          </h2>
          {clients.length === 0 ?
            <p className='text-slate-400 text-sm'>No accepted clients yet.</p>
          : <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {clients.map((c) => (
                <div
                  key={c._id}
                  onClick={() =>
                    setSelectedClient(selectedClient?._id === c._id ? null : c)
                  }
                  className={`bg-slate-800 border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedClient?._id === c._id ?
                      "border-blue-500"
                    : "border-slate-700 hover:border-slate-500"
                  }`}>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center'>
                      <FaUser className='text-slate-300' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-white font-medium'>{c.name}</p>
                      <p className='text-slate-400 text-xs'>{c.email}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/coach/clients/${c._id}`)}
                      className='flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg'>
                      <FaEye /> View
                    </button>
                  </div>
                  {selectedClient?._id === c._id && clientData && (
                    <div className='mt-2 space-y-2 border-t border-slate-700 pt-3'>
                      <div className='grid grid-cols-2 gap-2 text-xs'>
                        <div className='bg-slate-700 rounded p-2'>
                          <p className='text-slate-400'>Goal</p>
                          <p className='text-white capitalize'>
                            {clientData.client?.goal || "N/A"}
                          </p>
                        </div>
                        <div className='bg-slate-700 rounded p-2'>
                          <p className='text-slate-400'>Weight</p>
                          <p className='text-white'>
                            {clientData.client?.weight ?
                              `${clientData.client.weight} kg`
                            : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className='bg-slate-700 rounded p-2 text-xs'>
                        <p className='text-slate-400 mb-1'>
                          Recent Workouts Calories
                        </p>
                        {clientData.caloriesBurned?.length > 0 ?
                          clientData.caloriesBurned.slice(-3).map((w, i) => (
                            <p key={i} className='text-white'>
                              {new Date(w.date).toLocaleDateString()} —{" "}
                              {w.calories} kcal
                            </p>
                          ))
                        : <p className='text-slate-500'>No data</p>}
                      </div>
                      <div className='bg-slate-700 rounded p-2 text-xs'>
                        <p className='text-slate-400 mb-1'>Recent Weight</p>
                        {clientData.weightHistory?.length > 0 ?
                          clientData.weightHistory.slice(-3).map((w, i) => (
                            <p key={i} className='text-white'>
                              {new Date(w.date).toLocaleDateString()} —{" "}
                              {w.weight} kg
                            </p>
                          ))
                        : <p className='text-slate-500'>No data</p>}
                      </div>
                    </div>
                  )}
                  {selectedClient?._id === c._id && loadingClient && (
                    <p className='text-slate-400 text-xs mt-2'>Loading...</p>
                  )}
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
