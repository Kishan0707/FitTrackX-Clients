const SESSIONS_KEY = "fittrack_sessions";
const EMPTY_SESSIONS_STATE = { activeSessionId: null, sessions: {} };

export const getSessions = () => {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : EMPTY_SESSIONS_STATE;
  } catch {
    return EMPTY_SESSIONS_STATE;
  }
};

const saveSessions = (data) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(data));
};

export const generateSessionId = (userId, role) => {
  return `${userId}_${role}`;
};

export const addSession = (user, token) => {
  const data = getSessions();
  const sessionId = generateSessionId(user._id, user.role);

  data.sessions[sessionId] = {
    token,
    user,
    role: user.role,
    createdAt: Date.now(),
  };

  data.activeSessionId = sessionId;
  saveSessions(data);

  return sessionId;
};

export const getActiveSessionId = () => {
  const data = getSessions();
  return data.activeSessionId || null;
};

export const getActiveSession = () => {
  const data = getSessions();
  if (!data.activeSessionId) return null;

  return data.sessions[data.activeSessionId] || null;
};

export const getActiveToken = () => {
  const session = getActiveSession();
  return session?.token || null;
};

export const getActiveUser = () => {
  const session = getActiveSession();
  return session?.user || null;
};

export const switchSession = (sessionId) => {
  const data = getSessions();

  if (!data.sessions[sessionId]) {
    throw new Error("Session not found");
  }

  data.activeSessionId = sessionId;
  saveSessions(data);

  return data.sessions[sessionId];
};

export const getAllSessions = () => {
  const data = getSessions();
  return Object.entries(data.sessions).map(([id, session]) => ({
    id,
    ...session,
    isActive: id === data.activeSessionId,
  }));
};

export const removeSession = (sessionId) => {
  const data = getSessions();

  delete data.sessions[sessionId];

  // If we removed the active session, clear active or set to another
  if (data.activeSessionId === sessionId) {
    const remaining = Object.keys(data.sessions);
    data.activeSessionId = remaining.length > 0 ? remaining[0] : null;
  }

  saveSessions(data);

  return data.activeSessionId ? data.sessions[data.activeSessionId] : null;
};

export const clearAllSessions = () => {
  localStorage.removeItem(SESSIONS_KEY);
};

export const updateSessionUser = (sessionId, userUpdates) => {
  const data = getSessions();
  const session = data.sessions[sessionId];

  if (!session) return null;

  session.user = {
    ...session.user,
    ...userUpdates,
  };
  session.role = session.user?.role || session.role;

  saveSessions(data);
  return session;
};

export const updateActiveSessionUser = (userUpdates) => {
  const activeSessionId = getActiveSessionId();
  if (!activeSessionId) return null;

  return updateSessionUser(activeSessionId, userUpdates);
};

export const hasMultipleSessions = (userId) => {
  const data = getSessions();
  return (
    Object.values(data.sessions).filter((s) => s.user?._id === userId).length >
    1
  );
};

export const getSessionsByUserId = (userId) => {
  const data = getSessions();
  return Object.entries(data.sessions)
    .filter(([_, session]) => session.user?._id === userId)
    .map(([id, session]) => ({
      id,
      ...session,
      isActive: id === data.activeSessionId,
    }));
};
