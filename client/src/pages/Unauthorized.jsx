import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const fromPath = location.state?.from || "";
  const homePath = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
      <div className="w-full max-w-lg rounded-xl border border-red-500/25 bg-slate-900 p-8 text-center shadow-lg">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-red-300">
          Access Restricted
        </p>
        <h1 className="mb-3 text-3xl font-bold">Unauthorized</h1>
        <p className="mb-5 text-sm text-slate-300">
          You do not have permission to access this page.
          {fromPath ? ` Requested path: ${fromPath}` : ""}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(homePath)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
          >
            Go to Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold transition hover:bg-slate-700"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
