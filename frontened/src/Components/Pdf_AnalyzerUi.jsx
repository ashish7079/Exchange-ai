import { useState } from "react";

function Pdf_AnalyzerUi() {

  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);


  const analyzeResume = async () => {

    if (!resume || !jd.trim()) {
      alert("Please upload resume and enter job description");
      return;
    }

    const formData = new FormData();

    formData.append("resume", resume);
    formData.append("jd", jd);

    setLoading(true);
    setResult("");

    try {

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/resume/analyze`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          text || `Request failed: ${response.status}`
        );
      }

      try {

        const data = JSON.parse(text);

        setResult(data.answer);

      } catch {

        setResult(text);

      }

    } catch (error) {

      console.error(error);
      alert(error.message);

    } finally {

      setLoading(false);

    }

  };


  return (

    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10">

      <div className="max-w-5xl mx-auto">


        {/* HEADER */}

        <div className="text-center mb-10">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-2xl mb-4">
            ✨
          </div>

          <h1 className="text-4xl font-bold text-slate-900">
            Resume Analyzer
          </h1>

          <p className="mt-3 text-slate-500">
            Compare your resume with a job description using AI
          </p>

        </div>


        {/* MAIN CARD */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">


          {/* RESUME */}

          <div className="mb-7">

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Upload Resume
            </label>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition">

              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  setResume(e.target.files[0])
                }
                className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              />

              {resume && (
                <p className="mt-3 text-sm text-green-600">
                  ✓ {resume.name}
                </p>
              )}

            </div>

          </div>


          {/* JOB DESCRIPTION */}

          <div className="mb-7">

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Job Description
            </label>

            <textarea
              placeholder="Paste the job description here..."
              value={jd}
              onChange={(e) =>
                setJd(e.target.value)
              }
              rows={10}
              className="w-full rounded-xl border border-slate-300 px-4 py-3
              text-slate-700 outline-none resize-none
              focus:ring-2 focus:ring-blue-500
              focus:border-blue-500"
            />

            <p className="text-xs text-slate-400 mt-2">
              Include skills, technologies, qualifications and requirements.
            </p>

          </div>


          {/* BUTTON */}

          <button
            onClick={analyzeResume}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600
            text-white font-semibold
            hover:bg-blue-700 transition
            disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {loading
              ? "Analyzing Resume..."
              : "Analyze Resume"}

          </button>


        </div>


        {/* RESULT */}

        {result && (

          <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                ✓
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Analysis Result
              </h2>

            </div>

            <div className="bg-slate-50 rounded-xl p-6">

              <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700 font-sans">
                {result}
              </pre>

            </div>

          </div>

        )}

      </div>

    </main>

  );

}


export default Pdf_AnalyzerUi;