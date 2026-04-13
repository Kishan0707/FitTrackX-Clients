import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CalisthenicsOnboarding from "../components/CalisthenicsOnboarding";
import { AuthContext } from "../context/authContext";

const Onboarding = () => {
  const { onboardingComplete, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && onboardingComplete) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, onboardingComplete, navigate]);

  return <CalisthenicsOnboarding />;
};

export default Onboarding;
