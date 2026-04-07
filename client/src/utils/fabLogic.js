export const getFabAction = (goal, path) => {
  if (path.includes("meal")) {
    return { path: "/add-meal", icon: "🍛" };
  }

  switch (goal) {
    case "bulk":
      return { path: "/add-meal", icon: "🍛" };
    case "cut":
      return { path: "/add-workout", icon: "🔥" };
    case "maintain":
      return { path: "/steps", icon: "🚶" };
    default:
      return { path: "/dashboard", icon: "➕" };
  }
};

export const fabActions = [
  { path: "/add-meal", icon: "🍛", label: "Add Meal" },
  { path: "/add-workout", icon: "🔥", label: "Add Workout" },
  { path: "/steps", icon: "🚶", label: "Add Steps" },
  { path: "/ai", icon: "🤖", label: "AI Trainer" },
];
export const getInitials = (name) => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
