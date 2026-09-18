import os

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from pypdf import PdfReader
from mistralai.client import Mistral


load_dotenv()

app = Flask(__name__)
CORS(app)


# -----------------------------
# Mistral Client
# -----------------------------

client = Mistral(
    api_key=os.getenv("MISTRAL_API_KEY")
)


# -----------------------------
# Home
# -----------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Resume Analyzer API is running"
    })


# -----------------------------
# Health Check
# -----------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok"
    })


# -----------------------------
# Resume Analyzer
# -----------------------------

@app.route("/analyze", methods=["POST"])
def analyze_resume():

    # PDF receive karo
    resume = request.files.get("resume")

    # Job Description receive karo
    jd = request.form.get("jd")


    # Resume check
    if not resume:
        return jsonify({
            "error": "Resume PDF is required"
        }), 400


    # JD check
    if not jd:
        return jsonify({
            "error": "Job description is required"
        }), 400


    try:

        # -----------------------------
        # PDF se text extract karo
        # -----------------------------

        reader = PdfReader(resume)

        resume_text = ""

        for page in reader.pages:

            text = page.extract_text()

            if text:
                resume_text += text + "\n"


        # Agar PDF se text nahi mila
        if not resume_text.strip():

            return jsonify({
                "error": "Could not extract text from PDF"
            }), 400


        # -----------------------------
        # Prompt
        # -----------------------------

        prompt = f"""
You are a helpful career assistant.

User will give you a resume and a job description.

Compare the job description with the resume.

If a required skill is not present in the resume,
clearly tell the user that this skill is not present.

If the resume matches the job description,
explain why it is a good match.

Do not invent any information.

Resume:
{resume_text}

Job Description:
{jd}

Provide the analysis in a clear and structured way.
"""


        # -----------------------------
        # Call Mistral
        # -----------------------------

        response = client.chat.complete(
            model="ministral-8b-2512",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )


        # AI response
        answer = response.choices[0].message.content


        # -----------------------------
        # Return response
        # -----------------------------

        return jsonify({
            "answer": answer
        })


    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# -----------------------------
# Run locally
# -----------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )