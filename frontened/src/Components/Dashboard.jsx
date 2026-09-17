import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Dashboard() {

    const navigate = useNavigate();


    return (

        <div className="min-h-screen bg-slate-50">

            <Navbar />


            <main className="max-w-7xl mx-auto px-6 py-10">


                {/* HERO */}

                <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white">

                    <p className="text-blue-100 font-medium">
                        Welcome to Exchange
                    </p>

                    <h1 className="text-4xl md:text-5xl font-bold mt-3">
                        Your AI Career Assistant 🚀
                    </h1>

                    <p className="text-blue-100 mt-4 max-w-2xl">
                        Prepare for interviews, analyze your resume,
                        build professional resumes and chat with your
                        career documents using AI.
                    </p>

                </section>


                {/* FEATURES */}

                <section className="mt-10">

                    <h2 className="text-2xl font-bold text-slate-900">
                        AI Career Tools
                    </h2>

                    <p className="text-slate-500 mt-1">
                        Choose a tool to continue your career preparation.
                    </p>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">


                        {/* INTERVIEW */}

                        <div
                            onClick={() => navigate("/interview")}
                            className="bg-white rounded-2xl p-6 border border-slate-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition"
                        >

                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                                🎯
                            </div>

                            <h3 className="text-xl font-bold mt-5">
                                AI Interviewer
                            </h3>

                            <p className="text-slate-500 text-sm mt-2">
                                Practice technical interviews with AI
                                and receive detailed evaluation.
                            </p>

                            <p className="text-blue-600 font-semibold mt-5">
                                Start Interview →
                            </p>

                        </div>


                        {/* ANALYZER */}

                        <div
                            onClick={() => navigate("/resume-analyzer")}
                            className="bg-white rounded-2xl p-6 border border-slate-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition"
                        >

                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                                📄
                            </div>

                            <h3 className="text-xl font-bold mt-5">
                                Resume Analyzer
                            </h3>

                            <p className="text-slate-500 text-sm mt-2">
                                Compare your resume with a job
                                description using AI.
                            </p>

                            <p className="text-purple-600 font-semibold mt-5">
                                Analyze Resume →
                            </p>

                        </div>


                        {/* BUILDER */}

                        <div
                            onClick={() => navigate("/resume-builder")}
                            className="bg-white rounded-2xl p-6 border border-slate-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition"
                        >

                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                                ✨
                            </div>

                            <h3 className="text-xl font-bold mt-5">
                                AI Resume Builder
                            </h3>

                            <p className="text-slate-500 text-sm mt-2">
                                Generate a professional resume
                                using AI.
                            </p>

                            <p className="text-green-600 font-semibold mt-5">
                                Build Resume →
                            </p>

                        </div>


                        {/* CHATBOT */}

                        <div
                            onClick={() => navigate("/career-chatbot")}
                            className="bg-white rounded-2xl p-6 border border-slate-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition"
                        >

                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                                🤖
                            </div>

                            <h3 className="text-xl font-bold mt-5">
                                Career Chatbot
                            </h3>

                            <p className="text-slate-500 text-sm mt-2">
                                Upload your PDF and ask career-related
                                questions using RAG.
                            </p>

                            <p className="text-orange-600 font-semibold mt-5">
                                Start Chat →
                            </p>

                        </div>

                    </div>

                </section>


                {/* HOW IT WORKS */}

                <section className="mt-12 bg-white rounded-3xl border border-slate-200 p-8">

                    <h2 className="text-2xl font-bold">
                        How Exchange Works
                    </h2>


                    <div className="grid md:grid-cols-4 gap-6 mt-8">

                        <div>
                            <div className="text-3xl">
                                01
                            </div>

                            <h3 className="font-bold mt-3">
                                Login
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Securely login using JWT authentication.
                            </p>
                        </div>


                        <div>
                            <div className="text-3xl">
                                02
                            </div>

                            <h3 className="font-bold mt-3">
                                Choose Tool
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Select an AI career tool.
                            </p>
                        </div>


                        <div>
                            <div className="text-3xl">
                                03
                            </div>

                            <h3 className="font-bold mt-3">
                                Use AI
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Interact with the AI-powered feature.
                            </p>
                        </div>


                        <div>
                            <div className="text-3xl">
                                04
                            </div>

                            <h3 className="font-bold mt-3">
                                Improve
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Use the feedback to improve your career.
                            </p>
                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;