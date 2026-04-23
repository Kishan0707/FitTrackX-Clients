// Role definitions
export const ROLES = {
  USER: "user",
  COACH: "coach",
  DOCTOR: "doctor",
  ADMIN: "admin",
  SELLER: "seller",
  AFFILIATE: "affiliate",
};

// Permission matrix
export const PERMISSIONS = {
  VIEW_USERS: ["admin", "doctor"],
  VIEW_MEDICAL_DATA: ["doctor"],
  CREATE_DIET_PLAN: ["coach", "doctor"],
  UPDATE_MEDICAL_NOTES: ["doctor"],
  PRESCRIBE_MEDICATION: ["doctor"],
  START_CHAT: ["user", "doctor"],
  SCHEDULE_APPOINTMENT: ["user", "doctor"],
  PROCESS_PAYMENT: ["admin", "seller", "doctor"],
  VIEW_COACH_CONTENT: ["coach"],
  VIEW_ADMIN_PANEL: ["admin"],
  VIEW_SELLER_PANEL: ["seller"],
  VIEW_AFFILIATE_PANEL: ["affiliate"],
};

// Check if user has permission
export const hasPermission = (userRole, permission) => {
  const normalizedRole = String(userRole || "user").toLowerCase();
  const allowedRoles = PERMISSIONS[permission] || [];
  return allowedRoles.map(r => r.toLowerCase()).includes(normalizedRole);
};

// Check if user can access a route
export const canAccessRoute = (userRole, routePath) => {
  const role = String(userRole || "user").toLowerCase();
  
  const routePermissions = {
    "/doctor": ["doctor"],
    "/doctor/*": ["doctor"],
    "/admin": ["admin"],
    "/coach": ["coach"],
    "/seller": ["seller"],
    "/affiliate": ["affiliate"],
  };
  
  for (const [pattern, roles] of Object.entries(routePermissions)) {
    if (routePath.startsWith(pattern)) {
      return roles.map(r => r.toLowerCase()).includes(role);
    }
  }
  
  return true; // Public routes
};

// Doctor-specific settings
export const DOCTOR_SETTINGS = {
  CONSULTATION_FEE: {
    ONE_TIME: 9999,
    MONTHLY: 499,
  },
  PLAN_TYPES: ["basic", "premium", "enterprise"],
  CONSULTATION_MODES: ["video", "chat", "in_person"],
};
