import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Zap, LogOut, ChevronDown } from "lucide-react";

const Navbar = ({ user = {}, onLogout }) => {
  const navigate = useNavigate();

  // dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleMenuToggle = () => setMenuOpen((prev) => !prev);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  }

  // safe fallback if no user provided
  const currentUser = user ?? { name: "User", avatar: "" };

  // close dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 font-sans">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 max-w-7xl mx-auto">
        {/* LOGO */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-blue-500 to-purple-500 shadow-lg group-hover:shadow-purple-500/30 group-hover:scale-105 transition-all duration-300">
            <Zap className="w-6 h-6 text-white" />
            {/* fix: -right-1 (not -middle-1) */}
            <div className="absolute -bottom-1 w-3 h-3 bg-white rounded-full shadow-md animate-ping" />
          </div>

          <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-wide">
            DevTasks
          </span>
        </div>

        {/* right side */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 text-gray-600 hover:text-blue-500 transition-colors duration-300 hover:bg-purple-50 rounded-full"
            onClick={() => navigate("/profile", {replace: true})}
            type="button"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* USER Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={handleMenuToggle}
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer hover:bg-purple-50 
              transition-colors duration-300 border border-transparent hover:border-purple-200"
            >

              <div className=' relative'>
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full shadow-sm object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full  
                bg-gradient-to-br from-purple-500 via-blue-500 to-purple-500 text-white font-semibold
                shadow-lg">
                    {currentUser.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className=' absolute -bottom-0 -right-0 translate-x-0.5 translate-y-0.5 w-3 h-3 bg-green-400 
               rounded-full border-2 border-white animate-pulse' />
              </div>

              {/* Name and Email Text Container - ADD THIS BLOCK */}
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-sm font-bold text-gray-800 leading-none mb-1">
                  {currentUser.name || "User"}
                </span>
                <span className="text-[11px] text-gray-500 leading-none">
                  {currentUser.email || "user@example.com"}
                </span>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${menuOpen ? "rotate-180" : "rotate-0"
                  }`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  <Settings className="w-3.5 h-3.5 text-gray-800 align-middle" />
                  <span className='text-gray-800'>Profile Setting</span>

                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors "
                  onClick={() => {
                    setMenuOpen(false);
                    if (typeof onLogout === "function") onLogout();
                  }}
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
