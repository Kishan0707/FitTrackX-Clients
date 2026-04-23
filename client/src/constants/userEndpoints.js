// User API with role-based filtering
const USER_ENDPOINTS = {
  // Admin endpoints - filter by role
  ADMIN_USERS: (role = null) => 
    role ? `/admin/users?role=${role}` : "/admin/users",
  
  // Coach endpoints - automatically filtered to coach's clients
  COACH_CLIENTS: "/coach/clients",
  COACH_MEMBERS: "/coach/members",
  
  // Doctor endpoints
  DOCTORS: "/doctors",
  DOCTOR_DETAIL: (id) => `/doctors/${id}`,
  DOCTOR_PATIENTS: "/doctor/patients",
  DOCTOR_PATIENT: (userId) => `/doctor/patient/${userId}`,
  DOCTOR_APPOINTMENTS: "/doctor/appointments",
  DOCTOR_PRESCRIPTIONS: "/doctor/prescriptions",
  DOCTOR_LAB_REPORTS: "/doctor/lab-reports",
  
  // User endpoints
  USER_PROFILE: "/auth/me",
  USER_DOCTORS: "/doctors", // users can browse doctors
  
  // Common
  SEARCH: (query, filters = {}) => {
    const params = new URLSearchParams({ ...filters, q: query });
    return `/search?${params}`;
  },
};

export const getUserEndpoints = (userRole) => {
  const role = userRole?.toLowerCase();
  
  switch (role) {
    case "admin":
      return {
        ...USER_ENDPOINTS,
        USERS: USER_ENDPOINTS.ADMIN_USERS, // admin can pass role filter
      };
    case "coach":
      return {
        ...USER_ENDPOINTS,
        USERS: USER_ENDPOINTS.COACH_CLIENTS, // coach sees only clients
        CLIENTS: USER_ENDPOINTS.COACH_CLIENTS,
        MEMBERS: USER_ENDPOINTS.COACH_MEMBERS,
      };
    case "doctor":
      return {
        ...USER_ENDPOINTS,
        USERS: USER_ENDPOINTS.DOCTOR_PATIENTS, // doctor sees only patients
        PATIENTS: USER_ENDPOINTS.DOCTOR_PATIENTS,
      };
    default:
      return {
        ...USER_ENDPOINTS,
        USERS: USER_ENDPOINTS.USER_DOCTORS, // regular users browse doctors
      };
  }
};
