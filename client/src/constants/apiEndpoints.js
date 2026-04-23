// Centralized API endpoints with role-based permissions
// Each entry documents who can access it and what it returns

export const API_ENDPOINTS = {
  // ==================== AUTH ====================
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    ME: "/auth/me", // returns current user with role
  },

  // ==================== USERS ====================
  USERS: {
    // Admin: list all NON-DOCTOR users only (filters: ?role=user|coach|seller|affiliate)
    ADMIN_LIST: "/admin/users",
    
    // Coach: list clients assigned to this coach (no params needed, backend scoped)
    COACH_CLIENTS: "/coach/clients",
    COACH_PENDING: "/coach/pending-requests",
    COACH_ASSIGN: (clientId) => `/coach/${clientId}/assign`,
    
    // Doctor: list patients assigned to this doctor (backend scoped)
    DOCTOR_PATIENTS: "/doctor/patients",
    
    // User: view own profile
    USER_PROFILE: "/user/profile",
    
    // Admin: get single user by ID
    ADMIN_GET: (userId) => `/admin/users/${userId}`,
    ADMIN_UPDATE: (userId) => `/admin/users/${userId}`,
    ADMIN_DELETE: (userId) => `/admin/users/${userId}`,
    ADMIN_ASSIGN_COACH: (userId) => `/admin/users/${userId}/assign-coach`,
  },

  // ==================== DOCTORS ====================
  DOCTORS: {
    // Public: list all doctors (anyone can browse)
    LIST: "/doctors",
    DETAIL: (id) => `/doctors/${id}`,
    
    // Doctor: my own dashboard data
    DASHBOARD: "/doctor/dashboard",
    APPOINTMENTS: "/doctor/appointments",
    PRESCRIPTIONS: "/doctor/prescriptions",
    LAB_REPORTS: "/doctor/lab-reports",
    EARNINGS: "/doctor/earnings",
    SUBSCRIPTIONS: "/doctor/subscriptions",
    
    // Patient medical data (doctor only)
    PATIENT_HISTORY: (userId) => `/doctor/patient/${userId}`,
    PATIENT_NOTES: (userId) => `/doctor/patient/${userId}/notes`,
    LAB_REPORT_UPLOAD: "/doctor/lab-reports/upload",
    PRESCRIBE: "/doctor/prescribe",
    
    // Doctor profile management
    PROFILE_UPDATE: "/doctor/profile",
    AVAILABILITY: "/doctor/availability",
  },

  // ==================== APPOINTMENTS ====================
  APPOINTMENTS: {
    // User: book appointment
    BOOK: "/appointments",
    USER_LIST: "/user/appointments",
    
    // Doctor: view/manage appointments
    DOCTOR_LIST: "/doctor/appointments",
    DOCTOR_UPDATE: (id) => `/doctor/appointments/${id}`,
    
    // Admin: all appointments
    ADMIN_LIST: "/admin/appointments",
  },

  // ==================== DASHBOARD ====================
  DASHBOARD: {
    ADMIN: "/admin/dashboard",
    COACH: "/coach/dashboard",
    USER: "/user/dashboard",
    DOCTOR: "/doctor/dashboard",
  },

  // ==================== WORKOUTS ====================
  WORKOUTS: {
    LIST: "/workouts",
    DETAIL: (id) => `/workouts/${id}`,
    ASSIGN: "/workouts/assign",
    USER_WORKOUTS: "/user/workouts",
    COACH_WORKOUTS: "/coach/workouts",
    PROGRESS: "/workouts/progress",
    STATS: "/workouts/stats",
  },

  // ==================== DIET ====================
  DIET: {
    PLANS: "/diet/plans",
    USER_DIET: "/diet/my",
    COACH_DIET: "/coach/diet",
    ADMIN_DIET: "/admin/diet",
    ASSIGN: "/diet/assign",
    LOG: "/diet/log",
    TODAY: "/diet/today",
  },

  // ==================== PROGRESS ====================
  PROGRESS: {
    GRAPHS: "/progress/graphs",
    STATS: "/progress/stats",
    WEIGHT: "/progress/weight",
    MEASUREMENTS: "/progress/measurements",
  },

  // ==================== NOTIFICATIONS ====================
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
    UNREAD_COUNT: "/notifications/unread-count",
  },

  // ==================== FCM PUSH ====================
  FCM: {
    SAVE_TOKEN: "/api/save-token",
    SEND_TO_USER: (userId) => `/api/notifications/send/${userId}`,
    SEND_TO_ROLE: (role) => `/api/notifications/broadcast/${role}`,
  },

  // ==================== CHAT ====================
  CHAT: {
    CONVERSATIONS: "/chat/conversations",
    MESSAGES: (conversationId) => `/chat/messages/${conversationId}`,
    SEND: "/chat/send",
    USERS: "/chat/users", // list of users you can chat with (role-filtered)
  },

  // ==================== PAYMENTS ====================
  PAYMENTS: {
    PLANS: "/payments/plans",
    SUBSCRIBE: "/payments/subscribe",
    HISTORY: "/payments/history",
    CONSULTATION_FEE: (doctorId) => `/payments/consultation/${doctorId}`,
  },
};

// Helper to construct filtered admin user queries
export const getAdminUserQuery = (excludeRoles = [], includeRoles = []) => {
  const params = new URLSearchParams();
  if (excludeRoles.length) params.set("excludeRoles", excludeRoles.join(","));
  if (includeRoles.length) params.set("includeRoles", includeRoles.join(","));
  const query = params.toString();
  return query ? `${API_ENDPOINTS.USERS.ADMIN_LIST}?${query}` : API_ENDPOINTS.USERS.ADMIN_LIST;
};

// Example usage:
// API.get(getAdminUserQuery({ excludeRoles: ["doctor"] }));
// API.get(getAdminUserQuery({ includeRoles: ["user"] }));
