from dotenv import load_dotenv
import os
from io import BytesIO

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS

from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import mm
from xml.sax.saxutils import escape


# =========================
# Load Environment Variables
# =========================

load_dotenv()


# =========================
# Flask App
# =========================

app = Flask(__name__)
CORS(app)


# =========================
# Mistral AI
# =========================

llm = ChatMistralAI(
    model="ministral-8b-2512",
    api_key=os.getenv("MISTRAL_API_KEY")
)


# =========================
# Resume Prompt
# =========================

prompt = ChatPromptTemplate.from_template(
    """
    You are a professional resume builder.

    The user will provide raw information about themselves.
    Convert that information into a professional, ATS-friendly resume.

    Rules:

    - Use ONLY the information provided by the user.
    - Do NOT invent any information.
    - Do NOT add fake skills, experience, projects, education,
      certifications, achievements, or job titles.
    - Improve grammar and wording where necessary.
    - Make the content professional and concise.
    - Organize the information into appropriate resume sections.
    - If a section has no information, do not create fake content for it.
    - Do not change factual information such as dates, CGPA,
      percentages, company names, project names, etc.

    Suggested sections:

    - Name and Contact Information
    - Professional Summary
    - Technical Skills
    - Education
    - Experience
    - Projects
    - Certifications
    - Achievements

    User's raw information:

    {user_text}

    Return only the complete professional resume.
    """
)


# =========================
# LangChain Chain
# =========================

chain = prompt | llm | StrOutputParser()


# =========================
# Build Resume API
# =========================

@app.route("/build-resume", methods=["POST"])
def build_resume():

    user_text = request.form.get("user_text")

    # Check input
    if not user_text or not user_text.strip():
        return jsonify({
            "error": "Resume information is required"
        }), 400

    try:

        # =================================
        # 1. Generate Resume using Mistral
        # =================================

        resume_text = chain.invoke({
            "user_text": user_text
        })

        print("\n================ GENERATED RESUME ================\n")
        print(resume_text)
        print("\n===================================================\n")


        # =================================
        # 2. Create PDF in Memory
        # =================================

        pdf_buffer = BytesIO()

        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=A4,

            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm
        )


        # =================================
        # 3. PDF Styles
        # =================================

        styles = getSampleStyleSheet()

        normal_style = styles["Normal"]

        normal_style.fontSize = 10
        normal_style.leading = 14


        # =================================
        # 4. Add Resume Content
        # =================================

        story = []

        lines = resume_text.split("\n")


        for line in lines:

            line = line.strip()


            # Empty line
            if not line:

                story.append(
                    Spacer(1, 5)
                )

                continue


            # Remove Markdown symbols
            line = line.replace("**", "")
            line = line.replace("###", "")
            line = line.replace("##", "")
            line = line.replace("#", "")


            # Escape special HTML characters
            safe_line = escape(line)


            # Add line to PDF
            story.append(
                Paragraph(
                    safe_line,
                    normal_style
                )
            )


        # =================================
        # 5. Generate PDF
        # =================================

        doc.build(story)


        # Move buffer to beginning
        pdf_buffer.seek(0)


        # =================================
        # 6. Send PDF to Spring Boot
        # =================================

        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name="Generated_Resume.pdf",
            mimetype="application/pdf"
        )


    except Exception as e:

        print("\nERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# =========================
# Start Flask Server
# =========================

if __name__ == "__main__":

   app.run(
    host="0.0.0.0",
    port=int(os.environ.get("PORT", 5000)),
    debug=False
)