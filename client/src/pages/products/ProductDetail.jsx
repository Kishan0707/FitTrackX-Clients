import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const res = await API.get(`/products/${id}`);
    console.log("res", res);
    console.log(product);
    setProduct(res.data.product);
    console.log("res.data", res.data);
  };

  const handleStripePayment = async () => {
    try {
      if (!product?._id) {
        alert("Product is not ready yet. Please try again.");
        return;
      }

      setLoading(true);
      const payload = { productId: product._id };

      const res = await API.post("/payment/checkout", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Sending productId:", payload.productId);

      if (res?.data?.url) {
        window.location.href = res.data.url;
        return;
      }

      alert("Could not start payment. Please try again.");
    } catch (err) {
      console.error(err);
      alert("Payment failed ❌");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <p className='text-white'>Loading...</p>;

  return (
    <DashboardLayout>
      <div className='p-6 text-white bg-slate-800/80 border border-slate-700 rounded-2xl'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10 items-center p-5 rounded-2xl bg-slate-700/80 border border-slate-600 py-7'>
          <img src={product.imageUrl} className='w-72 rounded-2xl shadow-lg' />

          <div>
            <h1 className='text-2xl font-bold truncate'>{product.name}</h1>

            <p className='text-purple-400 text-xl mt-2'>
              ₹{product.finalPrice}
            </p>

            <p className='text-gray-400 mt-4 max-w-lg'>
              {product.description.slice(0, 200)}...
            </p>

            <button
              onClick={handleStripePayment}
              disabled={loading}
              className={`mt-5 px-5 py-2 rounded-lg ${
                loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
              }`}>
              {loading ? "Processing..." : "Pay with Stripe 💳"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductDetail;
