import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import {
  FaArrowRight,
  FaCheckCircle,
  FaCrown,
  FaUserCheck,
  FaUsers,
} from "react-icons/fa";

const Members = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [planStats, setPlanStats] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [selectedPlans, setSelectedPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigningClientId, setAssigningClientId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const showMessage = (message, type = "success") => {
    if (type === "error") {
      setError(message);
      setTimeout(() => setError(""), 3000);
      return;
    }

    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const [clientsRes, plansRes] = await Promise.all([
        API.get("/coach/clients"),
        API.get("/coach/plans"),
      ]);

      const clientsData = clientsRes.data?.data || [];
      const plansData = plansRes.data?.data || [];

      const subscriberResponses = await Promise.all(
        plansData.map((plan) =>
          API.get(`/plans/subscribe/${plan._id}`).catch(() => ({
            data: { data: [] },
          })),
        ),
      );

      const nextAssignments = {};
      const nextPlanStats = plansData.map((plan, index) => {
        const subscribers = subscriberResponses[index]?.data?.data || [];

        subscribers.forEach((subscriber) => {
          nextAssignments[subscriber._id] = {
            planId: plan._id,
            planTitle: plan.title,
            price: plan.price,
            duration: plan.duration,
          };
        });

        return {
          ...plan,
          subscriberCount: subscribers.length,
        };
      });

      setClients(clientsData);
      setPlans(plansData);
      setPlanStats(nextPlanStats);
      setAssignments(nextAssignments);
      setSelectedPlans((prev) => {
        const nextSelections = {};

        clientsData.forEach((client) => {
          nextSelections[client._id] =
            prev[client._id] || nextAssignments[client._id]?.planId || "";
        });

        return nextSelections;
      });
      setError("");
    } catch (err) {
      console.error(err);
      showMessage("Failed to load member assignments.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignPlan = async (clientId) => {
    const planId = selectedPlans[clientId];
    const currentPlanId = assignments[clientId]?.planId;

    if (!planId) {
      showMessage("Please select a plan first.", "error");
      return;
    }

    if (currentPlanId === planId) {
      showMessage("This client already has that plan assigned.", "error");
      return;
    }

    try {
      setAssigningClientId(clientId);
      await API.post("/coach/plans/assign", { planId, clientId });
      showMessage("Plan assigned successfully.");
      await fetchData();
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Failed to assign plan.",
        "error",
      );
    } finally {
      setAssigningClientId("");
    }
  };

  const assignedCount = Object.keys(assignments).length;
  const unassignedCount = Math.max(clients.length - assignedCount, 0);
  const plansWithMembers = planStats.filter((plan) => plan.subscriberCount > 0);
  const sortedClients = [...clients].sort((first, second) => {
    const firstAssigned = assignments[first._id] ? 1 : 0;
    const secondAssigned = assignments[second._id] ? 1 : 0;

    if (firstAssigned !== secondAssigned) {
      return secondAssigned - firstAssigned;
    }

    return first.name.localeCompare(second.name);
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex min-h-[60vh] items-center justify-center'>
          <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500' />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-white'>
              Members & Assignments
            </h1>
            <p className='mt-1 text-sm text-slate-400'>
              Apne clients ko plans assign karo aur active members ko ek jagah
              se manage karo.
            </p>
          </div>
          <button
            onClick={() => navigate("/coach/plans")}
            className='inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/20'>
            Manage Plans <FaArrowRight />
          </button>
        </div>

        {error && (
          <div className='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200'>
            {error}
          </div>
        )}
        {success && (
          <div className='rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-green-200'>
            {success}
          </div>
        )}

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
            <p className='text-sm text-slate-400'>Total Clients</p>
            <p className='mt-2 text-3xl font-bold text-white'>{clients.length}</p>
          </div>
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
            <p className='text-sm text-slate-400'>Active Members</p>
            <p className='mt-2 text-3xl font-bold text-emerald-400'>
              {assignedCount}
            </p>
          </div>
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
            <p className='text-sm text-slate-400'>Unassigned Clients</p>
            <p className='mt-2 text-3xl font-bold text-amber-400'>
              {unassignedCount}
            </p>
          </div>
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
            <p className='text-sm text-slate-400'>Plans With Members</p>
            <p className='mt-2 text-3xl font-bold text-blue-400'>
              {plansWithMembers.length}
            </p>
          </div>
        </div>

        {plans.length === 0 && (
          <div className='rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100'>
            <p className='font-semibold'>Abhi tak koi coach plan create nahi hua.</p>
            <p className='mt-1 text-sm text-amber-200/80'>
              Members page ka full use tab hoga jab aap ek ya zyada plans bana
              loge.
            </p>
            <button
              onClick={() => navigate("/coach/plans")}
              className='mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400'>
              Create Your First Plan <FaArrowRight />
            </button>
          </div>
        )}

        {planStats.length > 0 && (
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <FaCrown className='text-yellow-400' />
              <h2 className='text-lg font-semibold text-white'>Plan Overview</h2>
            </div>
            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
              {planStats.map((plan) => (
                <div
                  key={plan._id}
                  className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <h3 className='text-lg font-semibold text-white'>
                        {plan.title}
                      </h3>
                      <p className='mt-1 text-sm text-slate-400'>
                        Rs. {plan.price} / {plan.duration} days
                      </p>
                    </div>
                    <span className='rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300'>
                      {plan.subscriberCount} members
                    </span>
                  </div>
                  <p className='mt-3 line-clamp-2 text-sm text-slate-400'>
                    {plan.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <FaUsers className='text-blue-400' />
            <h2 className='text-lg font-semibold text-white'>Client Assignments</h2>
          </div>

          {sortedClients.length === 0 ?
            <div className='rounded-xl border border-slate-700 bg-slate-900 p-10 text-center'>
              <p className='text-lg font-semibold text-white'>No clients yet</p>
              <p className='mt-2 text-sm text-slate-400'>
                Jab clients accept honge tab unko yahan plans assign kar paoge.
              </p>
            </div>
          : <div className='grid gap-4 lg:grid-cols-2'>
              {sortedClients.map((client) => {
                const currentAssignment = assignments[client._id];
                const selectedPlanId = selectedPlans[client._id] || "";
                const isCurrentPlanSelected =
                  currentAssignment?.planId === selectedPlanId;

                return (
                  <div
                    key={client._id}
                    className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
                    <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <p className='text-lg font-semibold text-white'>
                            {client.name}
                          </p>
                          {currentAssignment && (
                            <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300'>
                              <FaCheckCircle /> Active
                            </span>
                          )}
                        </div>
                        <p className='mt-1 text-sm text-slate-400'>
                          {client.email}
                        </p>
                        <div className='mt-3 rounded-lg border border-slate-700 bg-slate-950/60 p-3'>
                          <p className='text-xs uppercase tracking-wide text-slate-500'>
                            Current Plan
                          </p>
                          {currentAssignment ?
                            <>
                              <p className='mt-1 font-medium text-white'>
                                {currentAssignment.planTitle}
                              </p>
                              <p className='mt-1 text-sm text-slate-400'>
                                Rs. {currentAssignment.price} /{" "}
                                {currentAssignment.duration} days
                              </p>
                            </>
                          : <p className='mt-1 text-sm text-amber-300'>
                              No active plan assigned
                            </p>
                          }
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/coach/clients/${client._id}`)}
                        className='inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800'>
                        View Client <FaArrowRight />
                      </button>
                    </div>

                    <div className='mt-4 flex flex-col gap-3 sm:flex-row'>
                      <select
                        value={selectedPlanId}
                        onChange={(event) =>
                          setSelectedPlans((prev) => ({
                            ...prev,
                            [client._id]: event.target.value,
                          }))
                        }
                        className='w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-blue-500'
                        disabled={plans.length === 0}>
                        <option value=''>Select a plan</option>
                        {plans.map((plan) => (
                          <option key={plan._id} value={plan._id}>
                            {plan.title} - Rs. {plan.price}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleAssignPlan(client._id)}
                        disabled={
                          plans.length === 0 ||
                          !selectedPlanId ||
                          isCurrentPlanSelected ||
                          assigningClientId === client._id
                        }
                        className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                          plans.length === 0 ||
                          !selectedPlanId ||
                          isCurrentPlanSelected ||
                          assigningClientId === client._id ?
                            "cursor-not-allowed bg-slate-700 text-slate-400"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}>
                        {assigningClientId === client._id ?
                          "Saving..."
                        : currentAssignment ? "Update Plan" : "Assign Plan"}
                      </button>
                    </div>

                    {!currentAssignment && (
                      <p className='mt-3 flex items-center gap-2 text-sm text-amber-300'>
                        <FaUserCheck /> Is client ko plan assign karna baki hai.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          }
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Members;
