import { useState } from "react";

function InterviewUi() {

  const [language, setLanguage] = useState("");
  const [interviewId, setInterviewId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [finalAnalysis, setFinalAnalysis] = useState("");

  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);


  // =========================================
  // START INTERVIEW
  // =========================================

  const startInterview = async () => {

    if (!language.trim()) {
      alert("Please enter programming language");
      return;
    }

    setLoading(true);

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "JWT token not found. Please login first."
        );
      }

      const formData = new URLSearchParams();

      formData.append(
        "language",
        language
      );

      const response = await fetch(
        "http://localhost:8080/api/interview/start",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",

            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const text = await response.text();

      console.log("Status:", response.status);
      console.log("Response:", text);

      if (!response.ok) {

        throw new Error(
          text ||
          `Request failed: ${response.status}`
        );

      }

      if (!text) {

        throw new Error(
          "Server returned an empty response."
        );

      }

      const data = JSON.parse(text);

      console.log("Interview Data:", data);

      setInterviewId(
        data.interview_id
      );

      setQuestion(
        data.question
      );

      setQuestionNumber(
        data.question_number
      );

      setStarted(true);
      setCompleted(false);

      setEvaluation("");
      setFinalAnalysis("");
      setAnswer("");


    } catch (error) {

      console.error(
        "Start Interview Error:",
        error
      );

      alert(error.message);

    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // SUBMIT ANSWER
  // =========================================

  const submitAnswer = async () => {

    if (!answer.trim()) {

      alert(
        "Please enter your answer"
      );

      return;
    }

    setLoading(true);

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {

        throw new Error(
          "JWT token not found. Please login first."
        );

      }

      const formData =
        new URLSearchParams();

      formData.append(
        "interview_id",
        interviewId
      );

      formData.append(
        "answer",
        answer
      );


      const response = await fetch(
        "http://localhost:8080/api/interview/answer",
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/x-www-form-urlencoded",

            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );


      const text =
        await response.text();

      console.log(
        "Status:",
        response.status
      );

      console.log(
        "Response:",
        text
      );


      if (!response.ok) {

        throw new Error(
          text ||
          `Request failed: ${response.status}`
        );

      }


      if (!text) {

        throw new Error(
          "Server returned an empty response."
        );

      }


      const data =
        JSON.parse(text);


      console.log(
        "Answer Response:",
        data
      );


      // =========================================
      // COMPLETED
      // =========================================

      if (data.completed) {

        setFinalAnalysis(
          data.final_analysis
        );

        setCompleted(true);

        setQuestion("");

        setEvaluation("");

        setAnswer("");

      }


      // =========================================
      // NEXT QUESTION
      // =========================================

      else {

        setEvaluation(
          data.evaluation
        );

        setQuestion(
          data.question
        );

        setQuestionNumber(
          data.question_number
        );

        setAnswer("");

      }


    } catch (error) {

      console.error(
        "Submit Answer Error:",
        error
      );

      alert(error.message);

    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // NEW INTERVIEW
  // =========================================

  const newInterview = () => {

    setLanguage("");
    setInterviewId("");
    setQuestion("");
    setAnswer("");
    setEvaluation("");
    setFinalAnalysis("");

    setLoading(false);
    setStarted(false);
    setCompleted(false);
    setQuestionNumber(0);

  };


  // =========================================
  // ENTER KEY
  // =========================================

  const handleKeyDown = (e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      submitAnswer();

    }

  };


  // =========================================
  // UI
  // =========================================

  return (

    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10">

      <div className="max-w-5xl mx-auto">


        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="text-center mb-10">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-2xl mb-4">
            🎯
          </div>

          <h1 className="text-4xl font-bold text-slate-900">
            AI Technical Interviewer
          </h1>

          <p className="mt-3 text-slate-500">
            Practice technical interviews with an AI interviewer
          </p>

        </div>


        {/* ================================= */}
        {/* START INTERVIEW */}
        {/* ================================= */}

        {!started && (

          <div className="max-w-2xl mx-auto">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">


              <div className="text-center mb-8">

                <div className="text-4xl mb-3">
                  💻
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Start Your Interview
                </h2>

                <p className="text-slate-500 mt-2">
                  Choose a programming language to begin
                </p>

              </div>


              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Programming Language
              </label>


              <input
                type="text"
                placeholder="Example: Java"
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value)
                }
                className="w-full px-4 py-3 rounded-xl
                border border-slate-300
                text-slate-700
                outline-none
                focus:ring-2 focus:ring-blue-500
                focus:border-blue-500"
              />


              <button
                onClick={startInterview}
                disabled={loading}
                className="w-full mt-6 py-3 rounded-xl
                bg-blue-600 text-white
                font-semibold
                hover:bg-blue-700
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed"
              >

                {loading
                  ? "Starting Interview..."
                  : "Start Interview"}

              </button>


              {/* FEATURES */}

              <div className="grid grid-cols-3 gap-3 mt-8">

                <div className="text-center p-3 bg-slate-50 rounded-xl">

                  <div className="text-xl">
                    🟢
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Easy
                  </p>

                </div>


                <div className="text-center p-3 bg-slate-50 rounded-xl">

                  <div className="text-xl">
                    🟡
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Medium
                  </p>

                </div>


                <div className="text-center p-3 bg-slate-50 rounded-xl">

                  <div className="text-xl">
                    🔴
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Hard
                  </p>

                </div>

              </div>


            </div>

          </div>

        )}


        {/* ================================= */}
        {/* INTERVIEW */}
        {/* ================================= */}

        {started && !completed && (

          <div className="max-w-4xl mx-auto">


            {/* PROGRESS */}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">

              <div className="flex justify-between items-center mb-3">

                <div>

                  <p className="text-sm text-slate-500">
                    Interview
                  </p>

                  <p className="font-semibold text-slate-800">
                    {language}
                  </p>

                </div>


                <div className="text-right">

                  <p className="text-sm text-slate-500">
                    Progress
                  </p>

                  <p className="font-bold text-blue-600">
                    {questionNumber} / 10
                  </p>

                </div>

              </div>


              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${questionNumber * 10}%`
                  }}
                />

              </div>

            </div>


            {/* QUESTION CARD */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">


              <div className="flex items-center gap-3 mb-6">

                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {questionNumber}
                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Question {questionNumber}
                  </p>

                  <h2 className="font-bold text-slate-900">
                    Technical Question
                  </h2>

                </div>

              </div>


              {/* QUESTION */}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-7">

                <p className="text-lg leading-8 text-slate-800">
                  {question}
                </p>

              </div>


              {/* PREVIOUS EVALUATION */}

              {evaluation && (

                <div className="mb-7">

                  <div className="flex items-center gap-2 mb-3">

                    <span className="text-lg">
                      💡
                    </span>

                    <h3 className="font-semibold text-slate-800">
                      Previous Answer Evaluation
                    </h3>

                  </div>


                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">

                    <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                      {evaluation}
                    </p>

                  </div>

                </div>

              )}


              {/* ANSWER */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Answer
                </label>


                <textarea

                  placeholder="Type your answer here..."

                  value={answer}

                  onChange={(e) =>
                    setAnswer(e.target.value)
                  }

                  onKeyDown={handleKeyDown}

                  rows={8}

                  className="w-full rounded-xl
                  border border-slate-300
                  px-4 py-4
                  text-slate-700
                  outline-none
                  resize-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500"

                />


                <p className="text-xs text-slate-400 mt-2">
                  Press Enter to submit • Shift + Enter for new line
                </p>

              </div>


              {/* SUBMIT */}

              <button

                onClick={submitAnswer}

                disabled={
                  loading ||
                  !answer.trim()
                }

                className="w-full mt-6 py-3 rounded-xl
                bg-blue-600
                text-white
                font-semibold
                hover:bg-blue-700
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed"

              >

                {loading
                  ? "Evaluating Answer..."
                  : questionNumber === 10
                  ? "Submit Final Answer"
                  : "Submit Answer →"}

              </button>


            </div>

          </div>

        )}


        {/* ================================= */}
        {/* FINAL ANALYSIS */}
        {/* ================================= */}

        {completed && (

          <div className="max-w-4xl mx-auto">


            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">


              {/* SUCCESS HEADER */}

              <div className="bg-blue-600 text-white p-8 text-center">

                <div className="text-5xl mb-3">
                  🎉
                </div>

                <h2 className="text-3xl font-bold">
                  Interview Completed
                </h2>

                <p className="mt-2 text-blue-100">
                  Your AI interview analysis is ready
                </p>

              </div>


              {/* ANALYSIS */}

              <div className="p-8">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    📊
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">
                    Final Interview Analysis
                  </h3>

                </div>


                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">

                  <pre
                    className="whitespace-pre-wrap
                    font-sans
                    text-sm
                    leading-7
                    text-slate-700"
                  >
                    {finalAnalysis}
                  </pre>

                </div>


                {/* NEW INTERVIEW */}

                <button

                  onClick={newInterview}

                  className="w-full mt-6 py-3
                  rounded-xl
                  bg-blue-600
                  text-white
                  font-semibold
                  hover:bg-blue-700
                  transition"

                >
                  Start New Interview
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </main>

  );

}


export default InterviewUi;