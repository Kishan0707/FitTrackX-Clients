import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";

const Success = () => {
  const [params] = useSearchParams();

  const type = params.get("type"); //  plan / product
  const navigate = useNavigate();
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // 🔥 PLAN FLOW
        if (type === "plan") {
          await API.get("/subscription/my-subscription");

          setTimeout(() => {
            navigate("/dashboard");
          }, 5000);
        }

        // 🔥 PRODUCT FLOW
        else if (type === "product") {
          setTimeout(() => {
            navigate("/orders"); // or /cart
          }, 5000);
        }

        // fallback
        else {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error(err);
        navigate("/dashboard");
      }
    };

    handleRedirect();
  }, []);
  return (
    <div className='flex flex-col items-center justify-center h-screen text-green-400'>
      <div className='bg-slate-800/80 border border-slate-700 p-0.5 rounded-2xl shadow shadow-white'>
        <div className='bg-slate-800/70 border border-slate-600 p-7 rounded-2xl  shadow-white'>
          <h1 className='text-3xl font-bold'>Payment Successful 🎉</h1>
          <h1>
            {type === "plan" ?
              "Plan Activated 🎉"
            : "Order Placed Successfully 🛒"}
          </h1>
          <p className='mt-2 text-gray-400 my-4'>Your payment is completed.</p>
          <Link
            to={type === "plan" ? "/dashboard" : "/orders"}
            className='mt-5 bg-green-500 text-white font-bold px-4 py-2  rounded'>
            {type === "plan" ? "" : "View Orders"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
