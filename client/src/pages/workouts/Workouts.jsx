import DashboardLayout from "../../layout/DashboardLayout";
import ClientWorkoutPage from "../../components/workouts/ClientWorkoutPage";

const Workouts = () => {
  return (
    <DashboardLayout>
      <div className='p-4 md:p-6'>
        <ClientWorkoutPage />
      </div>
    </DashboardLayout>
  );
};

export default Workouts;
