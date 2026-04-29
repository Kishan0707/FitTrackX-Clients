import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import {
  FaUserMd,
  FaUserTie,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaExchangeAlt,
  FaPlus,
  FaCheck,
  FaChevronDown,
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

const AccountManager = () => {
  const navigate = useNavigate();
  const { user, sessions, switchToSession, logout, refreshSessions } =
    useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddAccount(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const activeSession = sessions.find((s) => s.isActive);

  const handleSwitch = (sessionId) => {
    const session = switchToSession(sessionId);
    setIsOpen(false);
    setShowAddAccount(false);

    // Navigate based on role
    if (session?.user?.role === "admin") {
      navigate("/admin");
    } else if (session?.user?.role === "coach") {
      navigate("/coach/dashboard");
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

  const handleAddAccount = () => {
    setIsOpen(false);
    // Store that user wants to add account without logging out
    localStorage.setItem("addAccountMode", "true");
    window.location.href = "/login";
  };

  // Always show button when user is logged in
  if (!user) return null;

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-white hover:from-blue-600 hover:to-purple-700 transition shadow-lg'>
        <div className='flex h-6 w-6 items-center justify-center'>
          {activeSession && roleIcons[activeSession.role] && (
            <span className='text-sm'>
              {(() => {
                const Icon = roleIcons[activeSession.role];
                return <Icon />;
              })()}
            </span>
          )}
        </div>
        <div className='hidden sm:block'>
          <p className='text-sm font-semibold'>
            {activeSession?.user?.name?.split(" ")[0] || "Account"}
          </p>
          <p className='text-[10px] opacity-80'>
            {activeSession?.user?.role || "User"}
          </p>
        </div>
        <FaChevronDown
          className={`text-xs transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-[55]'
            onClick={() => {
              setIsOpen(false);
              setShowAddAccount(false);
            }}
          />

          {/* Dropdown Content */}
          <div className='absolute -right-10 top-full mt-2 z-[60] w-80 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden'>
            {/* Header */}
            <div className='border-b border-slate-700 bg-slate-800 p-4'>
              <h3 className='text-sm font-bold text-white'>My Accounts</h3>
              <p className='mt-1 text-xs text-slate-400'>
                Switch between your logged-in accounts
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
                    onClick={() => {
                      if (!session.isActive) {
                        handleSwitch(session.id);
                      }
                    }}
                    className={`flex items-center justify-between border-b border-slate-800 p-3 transition cursor-pointer ${
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
                          {session.role} •{" "}
                          {session.user?.email?.split("@")[0] || ""}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      {session.isActive ?
                        <span className='rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400 flex items-center gap-1'>
                          <FaCheck size={10} />
                          Active
                        </span>
                      : <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwitch(session.id);
                          }}
                          className='rounded-lg bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-400 hover:bg-orange-500/30'>
                          Switch
                        </button>
                      }

                      {!session.isActive && (
                        <button
                          onClick={(e) => handleLogout(session.id, e)}
                          className='rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition'
                          title='Remove account'>
                          <FaSignOutAlt size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className='border-t border-slate-700 bg-slate-800 p-3 space-y-2'>
              {sessions.length > 0 && (
                <button
                  onClick={() => setShowAddAccount(!showAddAccount)}
                  className='w-full flex items-center justify-center gap-2 rounded-xl bg-slate-700 py-2 text-sm font-semibold text-white transition hover:bg-slate-600'>
                  <FaPlus size={12} />
                  Add Another Account
                </button>
              )}

              {showAddAccount && (
                <div className='bg-slate-900/50 rounded-xl p-3 text-center'>
                  <p className='text-xs text-slate-400 mb-2'>
                    You&apos;ll be redirected to login. Your current session
                    will remain active.
                  </p>
                  <button
                    onClick={handleAddAccount}
                    className='w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 py-2 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-700 transition'>
                    Continue to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountManager;
