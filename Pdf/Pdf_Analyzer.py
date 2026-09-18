from dotenv import load_dotenv
import os

from flask import Flask, request, jsonify
from flask_cors import CORS

from langchain_community.document_loaders import PyPDFLoader
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


load_dotenv()

app = Flask(__name__)
CORS(app)


# Mistral
llm = ChatMistralAI(
    model="ministral-8b-2512",
    api_key=os.getenv("MISTRAL_API_KEY")
)


# Prompt
prompt = ChatPromptTemplate.from_template(
    """
    You are a helpful assistant.

    User will give you a resume and a job description.

    Compare the job description with the resume.

    If a required skill is not present in the resume,
    clearly tell the user that this skill is not present.

    If the resume matches the job description,
    explain why it is a good match.

    Do not invent any information.

    Resume:
    {resume}

    Job Description:
    {jd}
    """
)


chain = prompt | llm | StrOutputParser()


@app.route("/analyze", methods=["POST"])
def analyze_resume():

    # PDF receive karo
    resume = request.files.get("resume")

    # Job Description receive karo
    jd = request.form.get("jd")


    if not resume:
        return jsonify({
            "error": "Resume PDF is required"
        }), 400


    if not jd:
        return jsonify({
            "error": "Job description is required"
        }), 400


    # PDF temporarily save karo
    pdf_path = "temp_resume.pdf"
    resume.save(pdf_path)


    try:

        # PDF read karo
        loader = PyPDFLoader(pdf_path)
        docs = loader.load()


        # Saare pages ka text nikalo
        resume_text = "\n".join(
            doc.page_content
            for doc in docs
        )


        # Mistral ko bhejo
        answer = chain.invoke({
            "resume": resume_text,
            "jd": jd
        })


        return jsonify({
            "answer": answer
        })


    finally:

        # Temporary PDF delete
        if os.path.exists(pdf_path):
            os.remove(pdf_path)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )