import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Pdf_AnalyzerUi from "./Components/Pdf_AnalyzerUi";
import ResumuBuilderUi from "./Components/ResumuBuilderUi";
import InterviewUi from "./Components/InterviewUi";
import CareerChatbotUi from "./Components/CareerChatbotUi";

import Navbar from "./Components/Navbar";

import Login from "./Components/Login";
import Register from "./Components/Register";

import ProtectedRoute from "./Components/ProtectedRoute";


/* =========================================
   DASHBOARD
========================================= */

function Dashboard() {

  return (

    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}

      <Navbar />


      {/* APPLICATION ROUTES */}

      <Routes>

        {/* RESUME ANALYZER */}

        <Route
          path="/analyzer"
          element={<Pdf_AnalyzerUi />}
        />


        {/* RESUME BUILDER */}

        <Route
          path="/builder"
          element={<ResumuBuilderUi />}
        />


        {/* AI INTERVIEWER */}

        <Route
          path="/interview"
          element={<InterviewUi />}
        />


        {/* CAREER CHATBOT */}

        <Route
          path="/chatbot"
          element={<CareerChatbotUi />}
        />


        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={
            <Navigate
              to="/analyzer"
              replace
            />
          }
        />

      </Routes>

    </div>

  );

}


/* =========================================
   APP
========================================= */

function App() {

  const token = localStorage.getItem("token");


  return (

    <BrowserRouter>

      <Routes>

        {/* =================================
            LOGIN
        ================================= */}

        <Route
          path="/login"
          element={
            token ? (
              <Navigate
                to="/analyzer"
                replace
              />
            ) : (
              <Login />
            )
          }
        />


        {/* =================================
            REGISTER
        ================================= */}

        <Route
          path="/register"
          element={
            token ? (
              <Navigate
                to="/analyzer"
                replace
              />
            ) : (
              <Register />
            )
          }
        />


        {/* =================================
            PROTECTED APPLICATION
        ================================= */}

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;