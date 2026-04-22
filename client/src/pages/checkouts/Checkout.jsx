import { useSearchParams } from "react-router-dom";
import API from "../../services/api";

const Checkout = () => {
  const [params] = useSearchParams();
  const role = params.get("role");

  const handlePayment = async () => {
    try {
      const res = await API.post("/payment/role-checkout", { role });
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      alert("Payment failed ❌");
    }
  };

  return (
    <div className='text-white text-center mt-20'>
      <h1 className='text-2xl'>Complete Payment for {role}</h1>
      <button
        onClick={handlePayment}
        className='mt-5 bg-purple-500 px-6 py-3 rounded-xl'>
        Pay Now 💳
      </button>
    </div>
  );
};

export default Checkout;
