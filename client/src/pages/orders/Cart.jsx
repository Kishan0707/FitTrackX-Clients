import React, { useEffect, useState } from "react";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";

const Cart = () => {
  const [cart, setCart] = useState([]);
  console.log(cart);
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const res = await API.get("/cart");
    console.log(res);
    setCart(res.data.cart?.items || []);
  };

  const handleRemove = async (id) => {
    await API.delete(`/cart/${id}`);
    fetchCart();
  };

  const handleCheckout = async () => {
    for (let item of cart) {
      await API.post("/orders", {
        productId: item.productId._id,
      });
    }

    alert("Order placed 🚀");
  };

  return (
    <DashboardLayout>
      <div className='md:p-6'>
        {cart.length === 0 && (
          <p className='text-red-500 border-red-100 bg-red-50 p-5 backdrop-blur-2xl rounded-2xl mb-5 font-bold'>
            {" "}
            Cart is empty
          </p>
        )}
        <h1 className='text-xl text-white mb-4'>Your Cart</h1>

        {cart.map((item) => (
          <div key={item.productId._id} className='bg-white/5 p-4 mb-3 rounded'>
            <h2 className='text-white'>{item.productId.name}</h2>

            <p className='text-purple-300'>₹{item.productId.finalPrice}</p>

            <button
              onClick={() => handleRemove(item.productId._id)}
              className='text-red-400 mt-2'>
              Remove
            </button>
          </div>
        ))}

        {cart.length > 0 && (
          <button
            onClick={handleCheckout}
            className='bg-green-500 px-4 py-2 rounded mt-4'>
            Checkout
          </button>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Cart;
