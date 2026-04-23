import "./App.css";
import "./index.css";
import Login from "./pages/auth/Login";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Dashboard from "./pages/Dashboard/Dashboard";
import Register from "./pages/auth/Register";
import Workouts from "./pages/workouts/Workouts";
import AddWorkout from "./pages/workouts/AddWorkout";
import AddMeal from "./pages/diet/AddMeal";
import Diet from "./pages/diet/Diet";
import AiTrainer from "./pages/ai/AiTrainer";
import Plans from "./pages/plans/Plans";
import CoachPlans from "./pages/coach/Plans";
import CoachMembers from "./pages/coach/Members";
import CoachNotifications from "./pages/coach/Notifications";
import Notifications from "./pages/Notifications";
import Progress from "./pages/progress/Progress";
import CoachProgress from "./pages/coach/Progress";
import CoachReport from "./pages/coach/Report";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/Users";
import AdminWorkouts from "./pages/admin/AdminWorkout";
import CoachDashboard from "./pages/coach/CoachDashboard";
import Clients from "./pages/coach/Clients";
import DietPlans from "./pages/coach/DietPlans";
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
import UsersPage from "./components/UsersPage";
import Session from "./pages/coach/Session";
import Workout from "./pages/coach/Workout";
import Message from "./pages/coach/Message";
import UserMessage from "./pages/chat/Message";
import ClientDetail from "./pages/coach/ClientDetail";
import Steps from "./pages/steps/Steps";
import Step from "./pages/coach/Step";
import Onboarding from "./pages/onboarding";
import HealthTips from "./pages/health/HealthTips";
import Grocery from "./pages/health/Grocery";
import ProductList from "./pages/products/ProductList";
import ProductDetail from "./pages/products/ProductDetail";
import MyOrders from "./pages/orders/MyOrders";
import { Route, Routes, useLocation } from "react-router-dom";
import { Navigate } from "react-router-dom";
import AppErrorBoundary from "./components/AppErrorBoundary";
import SellerDashboard from "./pages/SellerDashboard/SellerDashboard";
import AffiliateDashboard from "./pages/AffiliateDashboard/AffiliateDashboard";
import Cart from "./pages/orders/Cart";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import OrderDetail from "./pages/orders/OrderDetail";
import Landing from "./pages/Landing/Landing";

// Doctor components
import DoctorsList from "./pages/doctor/DoctorsList";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import BookAppointment from "./pages/doctor/BookAppointment";
import PatientMedicalHistory from "./pages/doctor/PatientMedicalHistory";
import { useEffect } from "react";

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");

    if (ref) {
      localStorage.setItem("refCode", ref);
    }
  }, [location]);

  return (
    <AppErrorBoundary>
      <div className='App'>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/login' element={<Login />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/unauthorized' element={<Unauthorized />} />
          <Route
            path='/dashboard'
            element={
              <ProtectedRoutes>
                <Dashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/workouts'
            element={
              <ProtectedRoutes>
                <Workouts />
              </ProtectedRoutes>
            }
          />

          <Route
            path='/add-workout'
            element={
              <ProtectedRoutes>
                <AddWorkout />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/diet'
            element={
              <ProtectedRoutes>
                <Diet />
              </ProtectedRoutes>
            }
          />

          <Route
            path='/add-meal'
            element={
              <ProtectedRoutes>
                <AddMeal />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/ai'
            element={
              <ProtectedRoutes>
                <AiTrainer />
              </ProtectedRoutes>
            }
          />

          <Route
            path='/plans'
            element={
              <ProtectedRoutes>
                <Plans />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/progress'
            element={
              <ProtectedRoutes>
                <Progress />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/admin'
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/admin/users'
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/admin/workouts'
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <AdminWorkouts />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/admin/diet'
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <AdminDiet />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/admin/products'
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <AdminProducts />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/admin/reports'
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <Reports />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/admin/coaches'
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <CoachManagement />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/admin/coaches/:id'
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <CoachDetails />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/admin/audit-logs'
            element={
              <ProtectedRoutes allowedRoles={["admin"]}>
                <AuditLogs />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/settings'
            element={
              <ProtectedRoutes>
                <Settings />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/workout-analytics'
            element={
              <ProtectedRoutes>
                <WorkoutAnalytics />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/workout-history'
            element={
              <ProtectedRoutes>
                <WorkoutsHistory />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/test-features'
            element={
              <ProtectedRoutes>
                <TestFeatures />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/debug'
            element={
              <ProtectedRoutes>
                <DebugPage />
              </ProtectedRoutes>
            }
          />

          <Route
            path='/coachDashboard'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <CoachDashboard />
              </ProtectedRoutes>
            }
            index
          />
          <Route
            path='/coach/clients'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <Clients />
              </ProtectedRoutes>
            }
          />

          <Route
            path='/coach/sessions'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <Session />
              </ProtectedRoutes>
            }
          />

          <Route
            path='/coach/workouts'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <Workout />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/coach/diet'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <DietPlans />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/coach/messages'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <Navigate to='/coach/chat' replace />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/steps'
            element={
              <ProtectedRoutes>
                <Steps />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/coach/clients/:userId'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <ClientDetail />
              </ProtectedRoutes>
            }
          />

          <Route
            path='/coach/chat'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <Message />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/coach/ai'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <AiTrainer />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/coach/progress'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <CoachProgress />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/coach/reports'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <CoachReport />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/coach/steps'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <Step />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/coach/plans'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <CoachPlans />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/coach/members'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <CoachMembers />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/coach/notifications'
            element={
              <ProtectedRoutes allowedRoles={["coach"]}>
                <CoachNotifications />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/notifications'
            element={
              <ProtectedRoutes>
                <Notifications />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/chat'
            element={
              <ProtectedRoutes>
                <UserMessage />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/onboarding'
            element={
              <ProtectedRoutes>
                <Onboarding />
              </ProtectedRoutes>
            }
          />

          <Route
            path='/health-tips'
            element={
              <ProtectedRoutes>
                <HealthTips />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/grocery'
            element={
              <ProtectedRoutes>
                <Grocery />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/products'
            element={
              <ProtectedRoutes>
                <ProductList />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/orders'
            element={
              <ProtectedRoutes>
                <MyOrders />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/product/:id'
            element={
              <ProtectedRoutes>
                <ProductDetail />
              </ProtectedRoutes>
            }
          />

          {/* Doctor Routes */}
          <Route
            path='/doctors'
            element={
              <ProtectedRoutes allowedRoles={["doctor", "user"]}>
                <DoctorsList />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/doctors/:doctorId'
            element={
              <ProtectedRoutes allowedRoles={["doctor", "user"]}>
                <DoctorProfile />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/book-appointment'
            element={
              <ProtectedRoutes allowedRoles={["user"]}>
                <BookAppointment />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/doctor'
            element={
              <ProtectedRoutes allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/doctor/patients'
            element={
              <ProtectedRoutes allowedRoles={["doctor"]}>
                <div className='p-8 text-white'>
                  Patients List (Coming Soon)
                </div>
              </ProtectedRoutes>
            }
          />
          <Route
            path='/doctor/patient/:userId'
            element={
              <ProtectedRoutes allowedRoles={["doctor"]}>
                <PatientMedicalHistory />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/doctor/appointments'
            element={
              <ProtectedRoutes allowedRoles={["doctor"]}>
                <div className='p-8 text-white'>Doctor Appointments</div>
              </ProtectedRoutes>
            }
          />
          <Route
            path='/doctor/prescriptions'
            element={
              <ProtectedRoutes allowedRoles={["doctor"]}>
                <div className='p-8 text-white'>Prescriptions Management</div>
              </ProtectedRoutes>
            }
          />
          <Route
            path='/doctor/lab-reports'
            element={
              <ProtectedRoutes allowedRoles={["doctor"]}>
                <div className='p-8 text-white'>Lab Reports Review</div>
              </ProtectedRoutes>
            }
          />
          <Route
            path='/doctor/earnings'
            element={
              <ProtectedRoutes allowedRoles={["doctor"]}>
                <div className='p-8 text-white'>Earnings Dashboard</div>
              </ProtectedRoutes>
            }
          />
          <Route
            path='/doctor/subscriptions'
            element={
              <ProtectedRoutes allowedRoles={["doctor"]}>
                <div className='p-8 text-white'>Subscription Plans</div>
              </ProtectedRoutes>
            }
          />
          <Route
            path='/cart'
            element={
              <ProtectedRoutes>
                <Cart />
              </ProtectedRoutes>
            }
          />
          <Route
            path='/products'
            element={
              <ProtectedRoutes>
                <ProductList />
              </ProtectedRoutes>
            }
          />

          <Route
            path='/seller'
            element={
              <ProtectedRoutes allowedRoles={["seller"]}>
                <SellerDashboard />
              </ProtectedRoutes>
            }
          />

          <Route
            path='/affiliate'
            element={
              <ProtectedRoutes allowedRoles={["affiliate"]}>
                <AffiliateDashboard />
              </ProtectedRoutes>
            }
          />
          <Route path='/order/:id' element={<OrderDetail />} />
          <Route path='/success' element={<Success />} />
          <Route path='/cancel' element={<Cancel />} />
          <Route path='/test-users' element={<UsersPage />} />
        </Routes>
      </div>
    </AppErrorBoundary>
  );
}
export default AppContent;
