import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Login from "./pages/auth/Login";
import AppErrorBoundary from "./components/AppErrorBoundary";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Dashboard from "./pages/Dashboard/Dashboard";
import Register from "./pages/auth/Register";
import Workouts from "./pages/workouts/Workouts";
import AddWorkout from "./pages/workouts/AddWorkout";
import AddMeal from "./pages/diet/AddMeal";
import Diet from "./pages/diet/Diet";
import AiTrainer from "./pages/ai/AiTrainer";
import Plans from "./pages/plans/Plans";
import Progress from "./pages/progress/Progress";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import AdminWorkouts from "./pages/admin/Workouts";
import CoachDashboard from "./pages/coach/CoachDashboard";
import Clients from "./pages/coach/Clients";
import AdminDiet from "./pages/admin/AdminDiet";
import Reports from "./pages/admin/Reports";
import CoachManagement from "./pages/admin/CoachManagement";
import CoachDetails from "./pages/admin/CoachDetails";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/Settings";
import WorkoutAnalytics from "./pages/WorkoutAnalytics";
import WorkoutsHistory from "./pages/WorkoutsHistory";
import TestFeatures from "./pages/TestFeatures";
import DebugPage from "./pages/DebugPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
function App() {
  return (
    <>
      <BrowserRouter>
        <AppErrorBoundary>
          <div className="App">
            <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoutes>
                  <Dashboard />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/workouts"
              element={
                <ProtectedRoutes>
                  <Workouts />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/add-workout"
              element={
                <ProtectedRoutes>
                  <AddWorkout />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/diet"
              element={
                <ProtectedRoutes>
                  <Diet />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/add-meal"
              element={
                <ProtectedRoutes>
                  <AddMeal />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/ai"
              element={
                <ProtectedRoutes>
                  <AiTrainer />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/plans"
              element={
                <ProtectedRoutes>
                  <Plans />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoutes>
                  <Progress />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoutes allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoutes allowedRoles={["admin"]}>
                  <AdminUsers />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/workouts"
              element={
                <ProtectedRoutes allowedRoles={["admin"]}>
                  <AdminWorkouts />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/diet"
              element={
                <ProtectedRoutes allowedRoles={["admin"]}>
                  <AdminDiet />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoutes allowedRoles={["admin"]}>
                  <Reports />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/coaches"
              element={
                <ProtectedRoutes allowedRoles={["admin"]}>
                  <CoachManagement />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/coaches/:id"
              element={
                <ProtectedRoutes allowedRoles={["admin"]}>
                  <CoachDetails />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoutes allowedRoles={["admin"]}>
                  <AuditLogs />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoutes>
                  <Settings />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/workout-analytics"
              element={
                <ProtectedRoutes>
                  <WorkoutAnalytics />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/workout-history"
              element={
                <ProtectedRoutes>
                  <WorkoutsHistory />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/test-features"
              element={
                <ProtectedRoutes>
                  <TestFeatures />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/debug"
              element={
                <ProtectedRoutes>
                  <DebugPage />
                </ProtectedRoutes>
              }
            />

            <Route path="/coachDashboard" element={<CoachDashboard />} index />
            <Route path="/coach/clients" element={<Clients />} />
            </Routes>
          </div>
        </AppErrorBoundary>
      </BrowserRouter>
    </>
  );
}

export default App;
