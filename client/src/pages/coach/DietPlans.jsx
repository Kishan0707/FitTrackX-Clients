import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import MealCard from "../../components/MealCard";
import {
  FaAppleAlt,
  FaChartPie,
  FaEdit,
  FaLeaf,
  FaPlus,
  FaTrash,
  FaTimes,
  FaUserCheck,
} from "react-icons/fa";

const mealOptions = [
  "Breakfast",
  "Mid-Morning Snack",
  "Lunch",
  "Afternoon Snack",
  "Pre-Workout",
  "Post-Workout",
  "Dinner",
  "Late Night Snack",
];

const initialFood = {
  mealName: "",
  foodName: "",
  quantity: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  sugar: "",
  sodium: "",
};

const toNumericValue = (value, fallback = 0) => Number(value) || fallback;

const buildFoodPayload = (food) => ({
  foodName: String(food.foodName || "").trim(),
  quantity: toNumericValue(food.quantity, 1),
  calories: toNumericValue(food.calories),
  protein: toNumericValue(food.protein),
  carbs: toNumericValue(food.carbs),
  fat: toNumericValue(food.fat),
  sugar: toNumericValue(food.sugar),
  sodium: toNumericValue(food.sodium),
});

const flattenMeals = (meals = []) =>
  meals.flatMap((meal, mealIndex) =>
    (meal.foods || []).map((food, foodIndex) => ({
      mealName: meal.mealName,
      mealIndex,
      foodIndex,
      food: buildFoodPayload(food),
    })),
  );

const groupMealEntries = (entries = []) => {
  const mealMap = new Map();

  entries.forEach((entry) => {
    if (!mealMap.has(entry.mealName)) {
      mealMap.set(entry.mealName, {
        mealName: entry.mealName,
        foods: [],
      });
    }

    mealMap.get(entry.mealName).foods.push(entry.food);
  });

  return Array.from(mealMap.values());
};

const DietPlans = () => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [todayDiet, setTodayDiet] = useState(null);
  const [history, setHistory] = useState([]);
  const [macroData, setMacroData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [formData, setFormData] = useState(initialFood);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busyFoodKey, setBusyFoodKey] = useState("");
  const [editingFoodTarget, setEditingFoodTarget] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showMessage = (message, type = "success") => {
    if (type === "error") {
      setError(message);
      setTimeout(() => setError(""), 3000);
      return;
    }

    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const selectedClient = useMemo(
    () => clients.find((client) => client._id === selectedClientId),
    [clients, selectedClientId],
  );

  const resetForm = () => {
    setFormData(initialFood);
    setEditingFoodTarget(null);
  };

  const fetchDietData = async (clientId) => {
    if (!clientId) {
      setTodayDiet(null);
      setHistory([]);
      setMacroData(null);
      setSuggestions([]);
      return;
    }

    try {
      const [todayRes, historyRes, macroRes, suggestionRes] = await Promise.all(
        [
          API.get(`/diet/today?clientId=${clientId}`).catch(() => ({
            data: { data: {} },
          })),
          API.get(`/diet?clientId=${clientId}`).catch(() => ({
            data: { data: [] },
          })),
          API.get(`/diet/macro-distribution?clientId=${clientId}`).catch(
            () => ({
              data: { data: null },
            }),
          ),
          API.get(`/diet/grocery-suggestion?clientId=${clientId}`).catch(
            () => ({
              data: { suggestion: [] },
            }),
          ),
        ],
      );

      const todayDietData = todayRes.data?.data;
      setTodayDiet(todayDietData && todayDietData._id ? todayDietData : null);
      setHistory(historyRes.data?.data || []);
      setMacroData(macroRes.data?.data || null);
      setSuggestions(suggestionRes.data?.suggestion || []);
      setError("");
    } catch (err) {
      console.error(err);
      showMessage("Failed to load diet data.", "error");
    }
  };

  const fetchClientsAndData = async () => {
    setLoading(true);

    try {
      const clientsRes = await API.get("/coach/clients");
      const clientsData = clientsRes.data?.data || [];
      setClients(clientsData);

      if (clientsData.length === 0) {
        setSelectedClientId("");
        setTodayDiet(null);
        setHistory([]);
        setMacroData(null);
        setSuggestions([]);
        setError("");
        return;
      }

      const nextClientId =
        clientsData.find((client) => client._id === selectedClientId)?._id ||
        clientsData[0]._id;

      setSelectedClientId(nextClientId);
      await fetchDietData(nextClientId);
    } catch (err) {
      console.error(err);
      showMessage("Failed to load diet management.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsAndData();
  }, []);

  useEffect(() => {
    if (!selectedClientId) {
      return;
    }

    resetForm();
    fetchDietData(selectedClientId);
  }, [selectedClientId]);

  const startEditingFood = (meal, food, mealIndex, foodIndex) => {
    setEditingFoodTarget({ mealIndex, foodIndex });
    setFormData({
      mealName: meal.mealName || "",
      foodName: food.foodName || "",
      quantity: String(food.quantity || ""),
      calories: String(food.calories || ""),
      protein: String(food.protein || ""),
      carbs: String(food.carbs || ""),
      fat: String(food.fat || ""),
      sugar: String(food.sugar || ""),
      sodium: String(food.sodium || ""),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveMeal = async (event) => {
    event.preventDefault();

    if (!selectedClientId || !formData.mealName || !formData.foodName) {
      showMessage("Client, meal type and food name are required.", "error");
      return;
    }

    try {
      setSaving(true);
      if (editingFoodTarget && todayDiet?._id) {
        const entries = flattenMeals(todayDiet.meals);
        const targetIndex = entries.findIndex(
          (entry) =>
            entry.mealIndex === editingFoodTarget.mealIndex &&
            entry.foodIndex === editingFoodTarget.foodIndex,
        );

        if (targetIndex === -1) {
          throw new Error("Selected food item no longer exists.");
        }

        entries[targetIndex] = {
          mealName: formData.mealName,
          mealIndex: editingFoodTarget.mealIndex,
          foodIndex: editingFoodTarget.foodIndex,
          food: buildFoodPayload(formData),
        };

        await API.put(`/diet/${todayDiet._id}`, {
          meals: groupMealEntries(entries),
        });
        showMessage("Meal updated successfully.");
      } else {
        await API.post("/diet", {
          clientId: selectedClientId,
          meals: [
            {
              mealName: formData.mealName,
              foods: [buildFoodPayload(formData)],
            },
          ],
        });
        showMessage("Meal assigned successfully.");
      }

      resetForm();
      await fetchDietData(selectedClientId);
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Failed to save meal.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeFoodItem = async (mealIndex, foodIndex) => {
    if (!todayDiet?._id) {
      return;
    }

    const foodKey = `${mealIndex}-${foodIndex}`;

    try {
      setBusyFoodKey(foodKey);
      const nextEntries = flattenMeals(todayDiet.meals).filter(
        (entry) =>
          !(
            entry.mealIndex === mealIndex &&
            entry.foodIndex === foodIndex
          ),
      );

      if (nextEntries.length === 0) {
        await API.delete(`/diet/${todayDiet._id}`);
        showMessage("Last food removed. Today's diet deleted.");
      } else {
        await API.put(`/diet/${todayDiet._id}`, {
          meals: groupMealEntries(nextEntries),
        });
        showMessage("Food item removed successfully.");
      }

      if (
        editingFoodTarget?.mealIndex === mealIndex &&
        editingFoodTarget?.foodIndex === foodIndex
      ) {
        resetForm();
      }

      await fetchDietData(selectedClientId);
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Failed to remove food item.",
        "error",
      );
    } finally {
      setBusyFoodKey("");
    }
  };

  const deleteTodayDiet = async () => {
    if (!todayDiet?._id) {
      return;
    }

    try {
      setDeleting(true);
      await API.delete(`/diet/${todayDiet._id}`);
      showMessage("Today's diet deleted.");
      await fetchDietData(selectedClientId);
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Failed to delete diet.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Diet Management</h1>
          <p className='mt-1 text-sm text-slate-400'>
            Selected client ke liye meal plans add karo, daily totals dekho, aur
            nutrition suggestions track karo.
          </p>
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

        {clients.length === 0 ?
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-8 text-center'>
            <p className='text-white font-semibold'>No clients available</p>
            <p className='mt-2 text-sm text-slate-400'>
              Clients accept hone ke baad unke liye diet plans yahan manage kar
              paoge.
            </p>
          </div>
        : <>
            <div className='grid gap-4 md:grid-cols-4'>
              <div className='rounded-xl border border-slate-700 bg-slate-900 p-5 md:col-span-1'>
                <div className='mb-4 flex items-center gap-2'>
                  <FaUserCheck className='text-blue-400' />
                  <h2 className='text-sm font-semibold text-white'>
                    Select Client
                  </h2>
                </div>
                <select
                  value={selectedClientId}
                  onChange={(event) => setSelectedClientId(event.target.value)}
                  className='w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {selectedClient && (
                  <div className='mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-4'>
                    <p className='text-white font-semibold'>
                      {selectedClient.name}
                    </p>
                    <p className='mt-1 text-sm text-slate-400'>
                      {selectedClient.email}
                    </p>
                  </div>
                )}
              </div>

              <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
                <p className='text-sm text-slate-400'>Today's Calories</p>
                <p className='mt-2 text-3xl font-bold text-white'>
                  {Math.round(todayDiet?.totalCalories || 0)}
                </p>
              </div>
              <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
                <p className='text-sm text-slate-400'>Today's Protein</p>
                <p className='mt-2 text-3xl font-bold text-blue-300'>
                  {Math.round(todayDiet?.totalProtein || 0)}g
                </p>
              </div>
              <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
                <p className='text-sm text-slate-400'>Meals Today</p>
                <p className='mt-2 text-3xl font-bold text-emerald-300'>
                  {todayDiet?.meals?.length || 0}
                </p>
              </div>
            </div>

            <div className='rounded-xl border border-slate-700 bg-slate-900 p-6'>
              <div className='mb-5 flex items-center gap-2'>
                {editingFoodTarget ?
                  <FaEdit className='text-amber-400' />
                : <FaPlus className='text-blue-400' />}
                <h2 className='text-lg font-semibold text-white'>
                  {editingFoodTarget ? "Edit Meal Item" : "Add Meal Plan"}
                </h2>
              </div>

              <form onSubmit={saveMeal} className='space-y-5'>
                <div className='grid gap-4 md:grid-cols-3'>
                  <select
                    value={formData.mealName}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        mealName: event.target.value,
                      }))
                    }
                    className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'>
                    <option value=''>Select meal type</option>
                    {mealOptions.map((meal) => (
                      <option key={meal} value={meal}>
                        {meal}
                      </option>
                    ))}
                  </select>
                  <input
                    type='text'
                    value={formData.foodName}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        foodName: event.target.value,
                      }))
                    }
                    placeholder='Food name'
                    className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                  <input
                    type='number'
                    min='1'
                    value={formData.quantity}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantity: event.target.value,
                      }))
                    }
                    placeholder='Quantity (g)'
                    className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                </div>

                <div className='grid gap-4 md:grid-cols-5'>
                  <input
                    type='number'
                    min='0'
                    value={formData.calories}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        calories: event.target.value,
                      }))
                    }
                    placeholder='Calories'
                    className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                  <input
                    type='number'
                    min='0'
                    value={formData.protein}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        protein: event.target.value,
                      }))
                    }
                    placeholder='Protein'
                    className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                  <input
                    type='number'
                    min='0'
                    value={formData.carbs}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        carbs: event.target.value,
                      }))
                    }
                    placeholder='Carbs'
                    className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                  <input
                    type='number'
                    min='0'
                    value={formData.fat}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        fat: event.target.value,
                      }))
                    }
                    placeholder='Fat'
                    className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                  <input
                    type='number'
                    min='0'
                    value={formData.sugar}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        sugar: event.target.value,
                      }))
                    }
                    placeholder='Sugar'
                    className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <input
                    type='number'
                    min='0'
                    value={formData.sodium}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        sodium: event.target.value,
                      }))
                    }
                    placeholder='Sodium (mg)'
                    className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                  <button
                    type='submit'
                    disabled={saving}
                    className={`rounded-lg px-5 py-3 text-sm font-medium transition-colors ${
                      saving ?
                        "cursor-not-allowed bg-slate-700 text-slate-400"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}>
                    {saving ?
                      "Saving..."
                    : editingFoodTarget ?
                      "Update Meal"
                    : "Add Meal"}
                  </button>
                  {editingFoodTarget && (
                    <button
                      type='button'
                      onClick={resetForm}
                      className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800'>
                      <FaTimes /> Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className='grid gap-6 xl:grid-cols-3'>
              <div className='rounded-xl border border-slate-700 bg-slate-900 p-6 xl:col-span-2'>
                <div className='mb-5 flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-2'>
                    <FaAppleAlt className='text-orange-400' />
                    <h2 className='text-lg font-semibold text-white'>
                      Today's Diet
                    </h2>
                  </div>
                  {todayDiet?._id && (
                    <button
                      onClick={deleteTodayDiet}
                      disabled={deleting}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        deleting ?
                          "cursor-not-allowed bg-slate-700 text-slate-400"
                        : "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                      }`}>
                      <FaTrash />
                      {deleting ? "Deleting..." : "Delete Today"}
                    </button>
                  )}
                </div>

                {todayDiet?.meals?.length > 0 ?
                  <div className='space-y-6'>
                    <div className='grid gap-4 md:grid-cols-2'>
                      {todayDiet.meals.map((meal, index) => (
                        <MealCard key={meal._id || index} meal={meal} />
                      ))}
                    </div>

                    <div className='rounded-xl border border-slate-700 bg-slate-950/60 p-5'>
                      <div className='flex items-center gap-2'>
                        <FaEdit className='text-amber-400' />
                        <h3 className='text-sm font-semibold text-white'>
                          Quick Edit Foods
                        </h3>
                      </div>
                      <p className='mt-2 text-sm text-slate-400'>
                        Existing items ko yahin se update ya remove kar sakte ho.
                      </p>

                      <div className='mt-4 space-y-4'>
                        {todayDiet.meals.map((meal, mealIndex) => (
                          <div
                            key={meal._id || `${meal.mealName}-${mealIndex}`}
                            className='rounded-lg border border-slate-700 bg-slate-900 p-4'>
                            <p className='text-sm font-semibold text-white'>
                              {meal.mealName}
                            </p>

                            <div className='mt-3 space-y-3'>
                              {(meal.foods || []).map((food, foodIndex) => {
                                const foodKey = `${mealIndex}-${foodIndex}`;

                                return (
                                  <div
                                    key={food._id || `${food.foodName}-${foodIndex}`}
                                    className='flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-950/70 p-3 lg:flex-row lg:items-center lg:justify-between'>
                                    <div>
                                      <p className='text-sm font-medium text-white'>
                                        {food.foodName}
                                      </p>
                                      <p className='mt-1 text-xs text-slate-400'>
                                        {food.quantity}g . {food.calories} cal . P{" "}
                                        {food.protein}g . C {food.carbs}g . F{" "}
                                        {food.fat}g
                                      </p>
                                    </div>

                                    <div className='flex flex-wrap gap-2'>
                                      <button
                                        type='button'
                                        onClick={() =>
                                          startEditingFood(
                                            meal,
                                            food,
                                            mealIndex,
                                            foodIndex,
                                          )
                                        }
                                        className='inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-500/20'>
                                        <FaEdit /> Edit
                                      </button>
                                      <button
                                        type='button'
                                        onClick={() =>
                                          removeFoodItem(mealIndex, foodIndex)
                                        }
                                        disabled={busyFoodKey === foodKey}
                                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                          busyFoodKey === foodKey ?
                                            "cursor-not-allowed bg-slate-700 text-slate-400"
                                          : "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                        }`}>
                                        <FaTrash />
                                        {busyFoodKey === foodKey ?
                                          "Removing..."
                                        : "Remove"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                : <div className='rounded-lg border border-slate-700 bg-slate-950/40 p-8 text-center'>
                    <p className='text-white font-medium'>
                      No meals added today
                    </p>
                    <p className='mt-2 text-sm text-slate-400'>
                      Upar se meal add karte hi yahan reflect ho jayega.
                    </p>
                  </div>
                }
              </div>

              <div className='space-y-6'>
                <div className='rounded-xl border border-slate-700 bg-slate-900 p-6'>
                  <div className='mb-4 flex items-center gap-2'>
                    <FaChartPie className='text-blue-400' />
                    <h2 className='text-lg font-semibold text-white'>
                      Macro Split
                    </h2>
                  </div>

                  {macroData ?
                    <div className='space-y-4'>
                      {[
                        {
                          label: "Protein",
                          value: macroData.protein?.percentage || 0,
                          color: "bg-blue-500",
                        },
                        {
                          label: "Carbs",
                          value: macroData.carbs?.percentage || 0,
                          color: "bg-emerald-500",
                        },
                        {
                          label: "Fat",
                          value: macroData.fat?.percentage || 0,
                          color: "bg-yellow-500",
                        },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className='mb-2 flex items-center justify-between text-sm'>
                            <span className='text-slate-300'>{item.label}</span>
                            <span className='text-white'>
                              {item.value.toFixed(1)}%
                            </span>
                          </div>
                          <div className='h-2 rounded-full bg-slate-800'>
                            <div
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${Math.min(item.value, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  : <p className='text-sm text-slate-400'>
                      Macro data available hone ke liye aaj ka diet record
                      chahiye.
                    </p>
                  }
                </div>

                <div className='rounded-xl border border-slate-700 bg-slate-900 p-6'>
                  <div className='mb-4 flex items-center gap-2'>
                    <FaLeaf className='text-emerald-400' />
                    <h2 className='text-lg font-semibold text-white'>
                      Grocery Suggestions
                    </h2>
                  </div>
                  {suggestions.length > 0 ?
                    <div className='flex flex-wrap gap-2'>
                      {suggestions.map((item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200'>
                          {item}
                        </span>
                      ))}
                    </div>
                  : <p className='text-sm text-slate-400'>
                      Suggestions generate hone ke liye diet context chahiye.
                    </p>
                  }
                </div>
              </div>
            </div>

            <div className='rounded-xl border border-slate-700 bg-slate-900 p-6'>
              <h2 className='text-lg font-semibold text-white'>
                Recent Diet History
              </h2>
              {history.length === 0 ?
                <p className='mt-3 text-sm text-slate-400'>
                  No diet history yet.
                </p>
              : <div className='mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                  {history.slice(0, 6).map((diet) => (
                    <div
                      key={diet._id}
                      className='rounded-lg border border-slate-700 bg-slate-950/50 p-4'>
                      <p className='text-sm font-medium text-white'>
                        {new Date(diet.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <div className='mt-3 grid grid-cols-2 gap-3 text-sm'>
                        <div>
                          <p className='text-slate-500'>Calories</p>
                          <p className='text-white'>
                            {Math.round(diet.totalCalories || 0)}
                          </p>
                        </div>
                        <div>
                          <p className='text-slate-500'>Protein</p>
                          <p className='text-white'>
                            {Math.round(diet.totalProtein || 0)}g
                          </p>
                        </div>
                        <div>
                          <p className='text-slate-500'>Carbs</p>
                          <p className='text-white'>
                            {Math.round(diet.totalCarbs || 0)}g
                          </p>
                        </div>
                        <div>
                          <p className='text-slate-500'>Fat</p>
                          <p className='text-white'>
                            {Math.round(diet.totalFat || 0)}g
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          </>
        }
      </div>
    </DashboardLayout>
  );
};

export default DietPlans;
