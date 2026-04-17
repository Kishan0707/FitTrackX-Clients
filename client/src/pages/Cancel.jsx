import React from "react";
import { Link } from "react-router-dom";

const Cancel = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen text-red-400'>
      <h1 className='text-3xl font-bold'>Payment Cancelled ❌</h1>

      <p className='mt-2 text-gray-400'>Try again anytime.</p>

      <Link to='/products' className='mt-5 bg-purple-500 px-4 py-2 rounded'>
        Back to Products
      </Link>
    </div>
  );
};

export default Cancel;
