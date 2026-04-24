import { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import {
  FaUserMd,
  FaUserTie,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaExchangeAlt,
} from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const roleIcons = {
  doctor: FaUserMd,
  coach: FaUserTie,
  user: FaUser,
  admin: FaCog,
  seller: FaUser,
  affiliate: FaUser,
};

const roleColors = {
  doctor: "from-blue-500 to-cyan-500",
  coach: "from-green-500 to-emerald-500",
  user: "from-orange-500 to-red-500",
  admin: "from-purple-500 to-pink-500",
  seller: "from-yellow-500 to-orange-500",
  affiliate: "from-teal-500 to-cyan-500",
};

const SessionSwitcher = () => {
  const navigate = useNavigate();
  const { sessions, switchToSession, logout, refreshSessions } =
    useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  if (!sessions || sessions.length <= 1) return null;

  const activeSession = sessions.find((s) => s.isActive);
  const handleSwitch = (sessionId) => {
    const session = switchToSession(sessionId);
    setIsOpen(false);
    console.log("session", session);
    // 🔥 role based navigation
    if (session?.user?.role === "admin") {
      navigate("/admin");
    } else if (session?.user?.role === "coach") {
      navigate("/coach/Dashboard");
    } else if (session?.user?.role === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = (sessionId, e) => {
    e.stopPropagation();
    logout(sessionId);
    refreshSessions();
  };

  return (
    <div className='relative'>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700 transition'>
        {activeSession && roleIcons[activeSession.role] && (
          <span className='text-lg'>
            {(() => {
              const Icon = roleIcons[activeSession.role];
              return <Icon />;
            })()}
          </span>
        )}
        <span className='text-sm font-semibold'>
          {activeSession?.user?.name || "Switch Account"}
        </span>
        <FaExchangeAlt className='text-slate-400' />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-[55]'
            onClick={() => setIsOpen(false)}></div>

          {/* Dropdown Content */}
          <div className='absolute right-0 top-12 z-[60] w-80 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden'>
            {/* Header */}
            <div className='border-b border-slate-700 bg-slate-800 p-4'>
              <h3 className='text-sm font-bold text-white'>Active Sessions</h3>
              <p className='mt-1 text-xs text-slate-400'>
                Switch between your accounts
              </p>
            </div>

            {/* Sessions List */}
            <div className='max-h-64 overflow-y-auto'>
              {sessions.map((session) => {
                const Icon = roleIcons[session.role] || FaUser;
                const gradient =
                  roleColors[session.role] || "from-slate-500 to-slate-600";

                return (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between border-b border-slate-800 p-3 transition ${
                      session.isActive ? "bg-slate-800" : (
                        "hover:bg-slate-800/50"
                      )
                    }`}>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`rounded-xl bg-gradient-to-br p-2 text-white ${gradient}`}>
                        <Icon />
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-white'>
                          {session.user?.name || "Unknown"}
                        </p>
                        <p className='text-xs text-slate-400 capitalize'>
                          {session.role} • {session.user?.email || ""}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      {session.isActive ?
                        <span className='rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400'>
                          Active
                        </span>
                      : <button
                          onClick={() => handleSwitch(session.id)}
                          className='rounded-lg bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-400 hover:bg-orange-500/30'>
                          Switch
                        </button>
                      }

                      {!session.isActive && (
                        <button
                          onClick={(e) => handleLogout(session.id, e)}
                          className='rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400'>
                          <FaSignOutAlt />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className='border-t border-slate-700 bg-slate-800 p-3'>
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = "/login";
                }}
                className='w-full rounded-xl bg-slate-700 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-600'>
                Add New Account
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SessionSwitcher;
