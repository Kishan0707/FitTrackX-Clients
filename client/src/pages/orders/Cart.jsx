import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const res = await API.get("/cart");
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
    <div className='p-6'>
      <h1 className='text-xl text-white mb-4'>Cart</h1>

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
  );
};

export default Cart;
