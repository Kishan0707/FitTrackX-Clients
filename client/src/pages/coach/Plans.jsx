import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { FaPlus, FaTrash, FaUserPlus, FaCheck, FaTimes } from "react-icons/fa";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: 30,
    features: "",
  });

  const [assignData, setAssignData] = useState({
    clientId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Attempt to fetch coach's custom plans, fallback to global plans
      let plansRes;
      try {
        plansRes = await API.get("/coach/plans");
      } catch (err) {
        plansRes = await API.get("/plans");
      }

      // Fetch coach's clients
      const clientsRes = await API.get("/coach/clients").catch(() => ({
        data: { data: [] },
      }));

      setPlans(plansRes.data?.data || []);
      setClients(clientsRes.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (msg, type = "success") => {
    if (type === "error") {
      setError(msg);
      setTimeout(() => setError(""), 3000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f),
        price: Number(formData.price),
        duration: Number(formData.duration),
      };
      await API.post("/coach/plans", payload);
      showMessage("Plan created successfully!");
      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        price: "",
        duration: 30,
        features: "",
      });
      fetchData();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Failed to create plan",
        "error",
      );
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await API.delete(`/coach/plans/${id}`);
      showMessage("Plan deleted successfully!");
      fetchData();
    } catch (err) {
      showMessage("Failed to delete plan", "error");
    }
  };

  const handleAssignPlan = async (e) => {
    e.preventDefault();
    if (!assignData.clientId)
      return showMessage("Please select a client", "error");
    try {
      await API.post("/coach/plans/assign", {
        planId: selectedPlan._id,
        clientId: assignData.clientId,
      });
      showMessage("Plan assigned successfully!");
      setShowAssignModal(false);
      setAssignData({ clientId: "" });
    } catch (err) {
      // If specific assign route fails, we might just try a general subscription route
      try {
        await API.post("/subscriptions/assign", {
          planId: selectedPlan._id,
          userId: assignData.clientId,
        });
        showMessage("Plan assigned successfully!");
        setShowAssignModal(false);
        setAssignData({ clientId: "" });
      } catch (fallbackErr) {
        showMessage(
          err.response?.data?.message || "Failed to assign plan",
          "error",
        );
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex justify-center items-center h-screen'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500' />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='p-4 space-y-6 max-w-7xl mx-auto'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-white'>Subscription Plans</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors'>
            <FaPlus /> Create Plan
          </button>
        </div>

        {error && (
          <div className='p-4 bg-red-500/20 border border-red-500 text-red-100 rounded-lg'>
            {error}
          </div>
        )}
        {success && (
          <div className='p-4 bg-green-500/20 border border-green-500 text-green-100 rounded-lg'>
            {success}
          </div>
        )}

        {plans.length === 0 ?
          <div className='text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700'>
            <p className='text-slate-400'>No plans available yet.</p>
          </div>
        : <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {plans.map((plan) => (
              <div
                key={plan._id}
                className='bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors flex flex-col'>
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h3 className='text-xl font-bold text-white'>
                      {plan.title}
                    </h3>
                    <p className='text-slate-400 text-sm mt-1 line-clamp-2'>
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className='mb-4'>
                  <span className='bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium'>
                    ₹{plan.price} / {plan.duration} days
                  </span>
                </div>

                <div className='space-y-2 mb-6 flex-grow'>
                  <p className='text-sm font-medium text-slate-300'>
                    Features:
                  </p>
                  <ul className='space-y-2'>
                    {plan.features?.length > 0 ?
                      plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className='text-slate-400 text-sm flex items-start gap-2'>
                          <FaCheck className='text-green-500 mt-0.5 shrink-0' />
                          <span>{feature}</span>
                        </li>
                      ))
                    : <>
                        <li className='text-slate-400 text-sm flex items-center gap-2'>
                          <FaCheck className='text-green-500' /> Personalized
                          workout plans
                        </li>
                        <li className='text-slate-400 text-sm flex items-center gap-2'>
                          <FaCheck className='text-green-500' /> Nutrition
                          guidance
                        </li>
                        <li className='text-slate-400 text-sm flex items-center gap-2'>
                          <FaCheck className='text-green-500' /> Progress
                          tracking
                        </li>
                      </>
                    }
                  </ul>
                </div>

                <div className='flex gap-3 mt-auto border-t border-slate-700 pt-4'>
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowAssignModal(true);
                    }}
                    className='flex-1 flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 py-2 rounded-lg transition-colors border border-blue-500/30'>
                    <FaUserPlus /> Assign to Client
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className='flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg transition-colors border border-red-500/20'
                    title='Delete Plan'>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        }

        {/* Create Plan Modal */}
        {showCreateModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
            <div className='bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold text-white'>
                  Create New Plan
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='text-slate-400 hover:text-white'>
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleCreatePlan} className='space-y-4'>
                <div>
                  <label className='block text-slate-300 text-sm font-medium mb-1'>
                    Title
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className='w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none'
                    placeholder='e.g. Premium Plan'
                  />
                </div>
                <div>
                  <label className='block text-slate-300 text-sm font-medium mb-1'>
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className='w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none'
                    placeholder='Brief description...'
                    rows='2'
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-slate-300 text-sm font-medium mb-1'>
                      Price (₹)
                    </label>
                    <input
                      type='number'
                      required
                      min='0'
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className='w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none'
                      placeholder='0'
                    />
                  </div>
                  <div>
                    <label className='block text-slate-300 text-sm font-medium mb-1'>
                      Duration (days)
                    </label>
                    <input
                      type='number'
                      required
                      min='1'
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className='w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none'
                      placeholder='30'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-slate-300 text-sm font-medium mb-1'>
                    Features
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    className='w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none'
                    placeholder='Comma separated (e.g. Diet Plan, 24/7 Support)'
                  />
                </div>
                <button
                  type='submit'
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-6'>
                  Create Plan
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Assign Plan Modal */}
        {showAssignModal && selectedPlan && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
            <div className='bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-xl'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold text-white'>Assign Plan</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className='text-slate-400 hover:text-white'>
                  <FaTimes />
                </button>
              </div>
              <div className='mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700'>
                <p className='text-white font-medium'>{selectedPlan.title}</p>
                <p className='text-slate-400 text-sm mt-1'>
                  Select a client to assign this subscription.
                </p>
              </div>
              <form onSubmit={handleAssignPlan} className='space-y-4'>
                <div>
                  <label className='block text-slate-300 text-sm font-medium mb-2'>
                    Select Client
                  </label>
                  {clients.length > 0 ?
                    <select
                      required
                      value={assignData.clientId}
                      onChange={(e) =>
                        setAssignData({ clientId: e.target.value })
                      }
                      className='w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none'>
                      <option value=''>-- Choose a client --</option>
                      {clients.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                  : <div className='p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm'>
                      You don't have any accepted clients yet.
                    </div>
                  }
                </div>
                <button
                  type='submit'
                  disabled={clients.length === 0}
                  className={`w-full font-medium py-3 rounded-lg transition-colors mt-6 ${
                    clients.length === 0 ?
                      "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                  }`}>
                  Confirm Assignment
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Plans;
