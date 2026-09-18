import { useState } from "react";

import {
  useNavigate
} from "react-router-dom";


function Login() {

  const navigate = useNavigate();


  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);


  /* =========================================
     LOGIN
  ========================================= */

  const handleLogin = async (e) => {

    e.preventDefault();


    /* ================================
       VALIDATION
    ================================= */

    if (
      !email.trim() ||
      !password.trim()
    ) {

      alert(
        "Please enter email and password"
      );

      return;

    }


    setLoading(true);


    try {

      /* ================================
         API REQUEST
      ================================= */

     const response = await fetch(
  `${import.meta.env.VITE_API_URL}/auth/login`,
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      email: email.trim(),
      password: password
    })
  }
);


      /* ================================
         RESPONSE
      ================================= */

      const text =
        await response.text();


      console.log(
        "Login Status:",
        response.status
      );

      console.log(
        "Login Response:",
        text
      );


      /* ================================
         ERROR
      ================================= */

      if (!response.ok) {

        throw new Error(
          text ||
          `Login failed: ${response.status}`
        );

      }


      /* ================================
         JWT TOKEN
      ================================= */

      const token =
        text.trim();


      if (!token) {

        throw new Error(
          "JWT token was not received"
        );

      }


      /* ================================
         SAVE TOKEN
      ================================= */

      localStorage.setItem(
        "token",
        token
      );


      console.log(
        "JWT saved successfully"
      );


      /* ================================
         SUCCESS
      ================================= */

      alert(
        "Login successful!"
      );


      /* ================================
         GO TO ANALYZER
      ================================= */

      navigate(
        "/analyzer",
        {
          replace: true
        }
      );


    } catch (error) {

      console.error(
        "Login Error:",
        error
      );

      alert(
        error.message
      );


    } finally {

      setLoading(false);

    }

  };


  return (

    <main
      className="
        min-h-screen
        bg-slate-50
        flex
        items-center
        justify-center
        px-4
        py-8
      "
    >

      <div
        className="
          w-full
          max-w-md
        "
      >


        {/* =================================
            LOGO
        ================================= */}

        <div
          className="
            text-center
            mb-8
          "
        >

          <div
            className="
              inline-flex
              items-center
              justify-center
              w-16
              h-16
              rounded-2xl
              bg-blue-600
              text-white
              text-2xl
              font-bold
              shadow-lg
              mb-4
            "
          >
            E
          </div>


          <h1
            className="
              text-3xl
              font-bold
              text-slate-900
            "
          >
            Welcome Back
          </h1>


          <p
            className="
              text-slate-500
              mt-2
            "
          >
            Login to your Exchange account
          </p>

        </div>


        {/* =================================
            LOGIN CARD
        ================================= */}

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-slate-200
            shadow-sm
            p-6
            sm:p-8
          "
        >

          <form
            onSubmit={handleLogin}
          >


            {/* =============================
                EMAIL
            ============================== */}

            <div
              className="mb-5"
            >

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                "
              >
                Email Address
              </label>


              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                autoComplete="email"
                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  border
                  border-slate-300
                  outline-none
                  text-slate-700
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                "
              />

            </div>


            {/* =============================
                PASSWORD
            ============================== */}

            <div
              className="mb-6"
            >

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                "
              >
                Password
              </label>


              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  border
                  border-slate-300
                  outline-none
                  text-slate-700
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                "
              />

            </div>


            {/* =============================
                LOGIN BUTTON
            ============================== */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                py-3
                rounded-xl
                bg-blue-600
                text-white
                font-semibold
                hover:bg-blue-700
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >

              {loading
                ? "Logging in..."
                : "Login"
              }

            </button>

          </form>


          {/* =================================
              REGISTER
          ================================= */}

          <div
            className="
              text-center
              mt-6
              pt-6
              border-t
              border-slate-200
            "
          >

            <p
              className="
                text-sm
                text-slate-500
              "
            >

              Don't have an account?

              <button
                type="button"
                onClick={() =>
                  navigate("/register")
                }
                className="
                  ml-1
                  text-blue-600
                  font-semibold
                  hover:text-blue-700
                  transition
                "
              >
                Create Account
              </button>

            </p>

          </div>

        </div>


        {/* =================================
            FOOTER
        ================================= */}

        <p
          className="
            text-center
            text-xs
            text-slate-400
            mt-6
          "
        >
          AI Career Platform • Exchange
        </p>

      </div>

    </main>

  );

}


export default Login;