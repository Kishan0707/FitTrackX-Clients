import { useState } from "react";
import API from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await API.post("/email/password-reset", { email });
      setSuccessMessage(res.data.message);
      setEmail("");
      setTimeout(() => setSuccessMessage(""), 5000);
      alert(res.data.message);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Error");
      setSuccessMessage("");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-900 dark:bg-gray-900'>
      {successMessage && (
        <div className='fixed top-4 right-4 bg-green-500 text-white p-4 rounded'>
          {successMessage}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className='bg-slate-800/80 backdrop-blur-2xl dark:bg-gray-800 p-6 rounded-lg w-80'>
        <h2 className='text-xl mb-4  dark:text-white text-gray-200'>
          Forgot Password
        </h2>

        <input
          type='email'
          placeholder='Enter your email'
          className='border border-gray-600 bg-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-2 ring-1 ring-blue-900 focus:ring-blue-500 w-full my-3 text-white'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type='submit'
          className='w-full bg-blue-500 text-white p-2 rounded'
          disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
