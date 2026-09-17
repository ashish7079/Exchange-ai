import { useState } from "react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";


function Navbar() {

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);


  /* =========================================
     LOGOUT
  ========================================= */

  const logout = () => {

    // Remove JWT
    localStorage.removeItem("token");

    // Close mobile menu
    setMenuOpen(false);

    // Completely reload application
    // This prevents old authentication state
    window.location.replace("/login");

  };


  /* =========================================
     CLOSE MOBILE MENU
  ========================================= */

  const closeMenu = () => {

    setMenuOpen(false);

  };


  /* =========================================
     DESKTOP NAV STYLE
  ========================================= */

  const navClass = ({ isActive }) => {

    return `
      px-4
      py-2
      rounded-lg
      text-sm
      font-medium
      transition
      whitespace-nowrap

      ${
        isActive
          ? "bg-blue-600 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }
    `;

  };


  /* =========================================
     MOBILE NAV STYLE
  ========================================= */

  const mobileNavClass = ({ isActive }) => {

    return `
      block
      w-full
      px-4
      py-3
      rounded-lg
      text-sm
      font-medium
      transition

      ${
        isActive
          ? "bg-blue-600 text-white"
          : "text-slate-700 hover:bg-slate-100"
      }
    `;

  };


  return (

    <nav
      className="
        bg-white
        border-b
        border-slate-200
        sticky
        top-0
        z-50
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
        "
      >

        {/* =====================================
            MAIN NAVBAR
        ===================================== */}

        <div
          className="
            h-16
            flex
            items-center
            justify-between
            gap-4
          "
        >


          {/* =================================
              LOGO
          ================================= */}

          <div
            className="
              flex
              items-center
              gap-3
              cursor-pointer
              shrink-0
            "
            onClick={() => navigate("/analyzer")}
          >

            {/* LOGO BOX */}

            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-blue-600
                flex
                items-center
                justify-center
                text-white
                font-bold
                text-xl
                shadow-sm
              "
            >
              E
            </div>


            {/* LOGO TEXT */}

            <div className="hidden sm:block">

              <h1
                className="
                  text-xl
                  font-bold
                  text-slate-900
                  leading-tight
                "
              >
                Exchange
              </h1>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                AI Career Platform
              </p>

            </div>

          </div>


          {/* =================================
              DESKTOP MENU
          ================================= */}

          <div
            className="
              hidden
              md:flex
              items-center
              gap-1
              lg:gap-2
            "
          >

            <NavLink
              to="/analyzer"
              className={navClass}
            >
              Resume Analyzer
            </NavLink>


            <NavLink
              to="/builder"
              className={navClass}
            >
              Resume Builder
            </NavLink>


            <NavLink
              to="/interview"
              className={navClass}
            >
              AI Interviewer
            </NavLink>


            <NavLink
              to="/chatbot"
              className={navClass}
            >
              Career Chatbot
            </NavLink>

          </div>


          {/* =================================
              DESKTOP LOGOUT
          ================================= */}

          <button
            onClick={logout}
            className="
              hidden
              md:block
              px-4
              py-2
              rounded-lg
              bg-slate-900
              text-white
              text-sm
              font-medium
              hover:bg-slate-700
              transition
              shrink-0
            "
          >
            Logout
          </button>


          {/* =================================
              MOBILE MENU BUTTON
          ================================= */}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="
              md:hidden
              w-10
              h-10
              rounded-lg
              bg-slate-100
              flex
              items-center
              justify-center
              text-slate-700
              hover:bg-slate-200
              transition
              shrink-0
            "
            aria-label="Toggle navigation menu"
          >

            {menuOpen ? (

              /* X ICON */

              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />

              </svg>

            ) : (

              /* HAMBURGER ICON */

              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />

              </svg>

            )}

          </button>

        </div>


        {/* =====================================
            MOBILE MENU
        ===================================== */}

        {menuOpen && (

          <div
            className="
              md:hidden
              border-t
              border-slate-100
              py-3
            "
          >

            <div
              className="
                flex
                flex-col
                gap-2
              "
            >

              {/* ANALYZER */}

              <NavLink
                to="/analyzer"
                className={mobileNavClass}
                onClick={closeMenu}
              >
                📄 Resume Analyzer
              </NavLink>


              {/* BUILDER */}

              <NavLink
                to="/builder"
                className={mobileNavClass}
                onClick={closeMenu}
              >
                📝 Resume Builder
              </NavLink>


              {/* INTERVIEW */}

              <NavLink
                to="/interview"
                className={mobileNavClass}
                onClick={closeMenu}
              >
                🎤 AI Interviewer
              </NavLink>


              {/* CHATBOT */}

              <NavLink
                to="/chatbot"
                className={mobileNavClass}
                onClick={closeMenu}
              >
                🤖 Career Chatbot
              </NavLink>


              {/* LOGOUT */}

              <button
                type="button"
                onClick={logout}
                className="
                  w-full
                  text-left
                  px-4
                  py-3
                  rounded-lg
                  bg-slate-900
                  text-white
                  text-sm
                  font-medium
                  hover:bg-slate-700
                  transition
                  mt-1
                "
              >
                🚪 Logout
              </button>

            </div>

          </div>

        )}

      </div>

    </nav>

  );

}


export default Navbar;