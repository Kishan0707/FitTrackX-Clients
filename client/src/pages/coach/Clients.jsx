import { useEffect, useState } from "react";
import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import ClientCard from "../../components/ClientCard";
import API from "../../services/api";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await API.get("/coach/clients");
        setClients(res.data.data);
        setSuccess("Clients fetched successfully");
        console.log("clients:", res.data.data);

        setTimeout(() => setSuccess(""), 3000);
        setError("");
      } catch (err) {
        console.log(err);
        setError("Failed to fetch clients");
        setTimeout(() => setError(""), 3000);
        setSuccess("");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);
  if (!clients) return <div>no clients found</div>;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}
      <div className="flex items-center justify-between mb-6 flex-col bg-slate-900 border border-slate-600">
        <h1 className="text-2xl font-bold mb-6">My clients</h1>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-5 p-5 rounded w-full">
          {clients.map((client) => (
            <div
              className="bg-slate-800 backdrop-blur-2xl border border-slate-700 p-5 rounded shadow-md"
              key={client.id}
            >
              <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700 p-5 rounded shadow-md">
                <h2 className="text-lg font-bold mb-2">{client.name}</h2>
                <p className="text-gray-600">{client.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
