import { useState } from "react";

function ResumuBuilderUi() {

  const [userText, setUserText] = useState("");
  const [loading, setLoading] = useState(false);


  const buildResume = async () => {

    if (!userText.trim()) {
      alert("Please enter your resume information");
      return;
    }

    setLoading(true);

    try {

      const token = localStorage.getItem("token");

      const formData = new URLSearchParams();

      formData.append("user_text", userText);


      const response = await fetch(
        "http://localhost:8080/api/resumeBuild/build-resume",
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


      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
          `Request failed: ${response.status}`
        );

      }


      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      a.href = url;

      a.download =
        "Generated_Resume.pdf";

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

      alert(
        "Resume PDF generated successfully!"
      );


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
            📄
          </div>

          <h1 className="text-4xl font-bold text-slate-900">
            AI Resume Builder
          </h1>

          <p className="mt-3 text-slate-500">
            Enter your information and generate a professional resume
          </p>

        </div>


        {/* CARD */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">


          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Your Resume Information
          </label>


          <textarea

            placeholder={`Enter your resume information here...

Example:

Name: Ashish Kumar
Email: ashish@gmail.com
Phone: 9876543210

Education:
B.Tech Computer Science

Skills:
Java, Spring Boot, React, MySQL

Projects:
Medicare
Room Rent Management

Experience:
Fresher`}

            value={userText}

            onChange={(e) =>
              setUserText(e.target.value)
            }

            rows={20}

            className="w-full rounded-xl border border-slate-300
            px-4 py-4 text-slate-700
            outline-none resize-y
            focus:ring-2 focus:ring-blue-500
            focus:border-blue-500"

          />


          {/* BUTTON */}

          <button

            onClick={buildResume}

            disabled={loading}

            className="w-full mt-6 py-3 rounded-xl
            bg-blue-600 text-white font-semibold
            hover:bg-blue-700 transition
            disabled:opacity-50
            disabled:cursor-not-allowed"

          >

            {loading
              ? "Generating PDF..."
              : "Build My Resume"}

          </button>


        </div>


        {/* INFO */}

        <div className="mt-6 grid md:grid-cols-3 gap-4">

          <div className="bg-white rounded-xl p-5 border border-slate-200">

            <div className="text-2xl mb-2">
              ✨
            </div>

            <h3 className="font-semibold text-slate-800">
              AI Powered
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              AI helps structure your information.
            </p>

          </div>


          <div className="bg-white rounded-xl p-5 border border-slate-200">

            <div className="text-2xl mb-2">
              📄
            </div>

            <h3 className="font-semibold text-slate-800">
              PDF Resume
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Generate your resume as a PDF.
            </p>

          </div>


          <div className="bg-white rounded-xl p-5 border border-slate-200">

            <div className="text-2xl mb-2">
              🚀
            </div>

            <h3 className="font-semibold text-slate-800">
              Career Ready
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Prepare your resume for applications.
            </p>

          </div>

        </div>


      </div>

    </main>

  );

}


export default ResumuBuilderUi;