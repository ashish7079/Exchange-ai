import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Register() {

  const navigate = useNavigate();


  const [form, setForm] = useState({

    name: "",
    email: "",
    password: "",
    college: "",
    bio: ""

  });


  const [loading, setLoading] = useState(false);


  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]: e.target.value

    });

  };


  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {

    e.preventDefault();


    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.college.trim()
    ) {

      alert(
        "Please fill all required fields"
      );

      return;

    }


    setLoading(true);


    try {

      const response = await fetch(
        "http://localhost:8080/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(form)

        }
      );


      const text =
        await response.text();


      console.log(
        "Register Status:",
        response.status
      );

      console.log(
        "Register Response:",
        text
      );


      // =========================
      // ERROR
      // =========================

      if (!response.ok) {

        throw new Error(
          text ||
          `Registration failed: ${response.status}`
        );

      }


      // =========================
      // SUCCESS
      // =========================

      alert(
        "Registration successful! Please login."
      );


      navigate("/login");


    } catch (error) {

      console.error(
        "Register Error:",
        error
      );

      alert(error.message);


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
        py-10
      "
    >

      <div className="w-full max-w-lg">


        {/* =========================
            LOGO
        ========================= */}

        <div className="text-center mb-7">

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
            Create Your Account
          </h1>


          <p className="text-slate-500 mt-2">

            Join Exchange and prepare for your career

          </p>

        </div>


        {/* =========================
            REGISTER CARD
        ========================= */}

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-slate-200
            shadow-sm
            p-8
          "
        >

          <form onSubmit={handleRegister}>


            {/* NAME */}

            <div className="mb-4">

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                "
              >
                Full Name
              </label>


              <input
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
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


            {/* EMAIL */}

            <div className="mb-4">

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
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
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


            {/* PASSWORD */}

            <div className="mb-4">

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
                name="password"
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
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


            {/* COLLEGE */}

            <div className="mb-4">

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                "
              >
                College / University
              </label>


              <input
                name="college"
                type="text"
                placeholder="Enter your college"
                value={form.college}
                onChange={handleChange}
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


            {/* BIO */}

            <div className="mb-6">

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                "
              >
                Bio

                <span
                  className="
                    font-normal
                    text-slate-400
                  "
                >
                  {" "} (Optional)
                </span>

              </label>


              <textarea
                name="bio"
                placeholder="Tell us something about yourself..."
                value={form.bio}
                onChange={handleChange}
                rows={4}
                className="
                  w-full
                  px-4
                  py-3
                  rounded-xl
                  border
                  border-slate-300
                  outline-none
                  resize-none
                  text-slate-700
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                "
              />

            </div>


            {/* REGISTER BUTTON */}

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
                ? "Creating Account..."
                : "Create Account"
              }

            </button>

          </form>


          {/* =========================
              LOGIN
          ========================= */}

          <div
            className="
              text-center
              mt-6
              pt-6
              border-t
              border-slate-200
            "
          >

            <p className="text-sm text-slate-500">

              Already have an account?

              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="
                  ml-1
                  text-blue-600
                  font-semibold
                  hover:text-blue-700
                "
              >
                Login
              </button>

            </p>

          </div>

        </div>


        {/* FOOTER */}

        <p
          className="
            text-center
            text-xs
            text-slate-400
            mt-6
          "
        >
          Exchange • AI Career Platform
        </p>

      </div>

    </main>

  );

}


export default Register;