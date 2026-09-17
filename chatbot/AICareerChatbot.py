from dotenv import load_dotenv
import os
import uuid

from flask import Flask, request, jsonify
from flask_cors import CORS

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_mistralai import ChatMistralAI
from langchain_mistralai import MistralAIEmbeddings

from langchain_chroma import Chroma

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


# --------------------------------
# Load environment variables
# --------------------------------

load_dotenv()


# --------------------------------
# Flask
# --------------------------------

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "uploads"
)

os.makedirs(UPLOAD_DIR, exist_ok=True)

# --------------------------------
# Paths
# --------------------------------

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

CHROMA_DIR = os.path.join(
    BASE_DIR,
    "chroma_db"
)


# --------------------------------
# Mistral LLM
# --------------------------------

llm = ChatMistralAI(
    model="ministral-8b-2512",
    api_key=os.getenv("MISTRAL_API_KEY")
)


# --------------------------------
# Mistral Embeddings
# --------------------------------

embeddings = MistralAIEmbeddings(
    model="mistral-embed",
    api_key=os.getenv("MISTRAL_API_KEY")
)


# --------------------------------
# Chroma Vector Database
# --------------------------------

vector_db = Chroma(
    persist_directory=CHROMA_DIR,
    collection_name="career_knowledge",
    embedding_function=embeddings
)


# --------------------------------
# Retriever
# --------------------------------

retriever = vector_db.as_retriever(
    search_kwargs={
        "k": 4
    }
)


# --------------------------------
# RAG Prompt
# --------------------------------

rag_prompt = ChatPromptTemplate.from_template(
    """
You are a professional career chatbot.

You have access to career-related documents.

Use the provided context to answer the user's question
when the context is relevant.

If the context contains useful information:
- Use it in your answer.
- Do not invent information.
- Give a clear and practical answer.

If the context does not contain the answer:
- You can answer using your general knowledge.
- Clearly avoid pretending that the information came from the PDF.

Context:

{context}


User Question:

{question}


Give a helpful answer.
"""
)


# --------------------------------
# Normal Chat Prompt
# --------------------------------

normal_prompt = ChatPromptTemplate.from_template(
    """
You are a professional career chatbot.

The user has not provided a relevant document.

Answer the user's career-related question using
your general knowledge.

Give a clear, practical and helpful answer.

User Question:

{question}
"""
)

@app.route("/upload", methods=["POST"])
def upload_pdf():

    pdf = request.files.get("pdf")

    if pdf is None:
        return jsonify({
            "error": "PDF is required"
        }), 400

    if pdf.filename == "":
        return jsonify({
            "error": "Please select a PDF"
        }), 400

    if not pdf.filename.lower().endswith(".pdf"):
        return jsonify({
            "error": "Only PDF files are allowed"
        }), 400

    try:

        # Unique ID for this uploaded PDF
        session_id = str(uuid.uuid4())

        pdf_path = os.path.join(
            UPLOAD_DIR,
            session_id + ".pdf"
        )

        pdf.save(pdf_path)

        # -----------------------------
        # Load PDF
        # -----------------------------

        loader = PyPDFLoader(pdf_path)

        documents = loader.load()

        # -----------------------------
        # Split into chunks
        # -----------------------------

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )

        chunks = text_splitter.split_documents(
            documents
        )

        # -----------------------------
        # Create embeddings
        # -----------------------------

        embeddings = MistralAIEmbeddings(
            model="mistral-embed",
            api_key=os.getenv("MISTRAL_API_KEY")
        )

        # -----------------------------
        # User-specific Chroma DB
        # -----------------------------

        collection_name = "user_" + session_id.replace("-", "_")

        vector_db = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=CHROMA_DIR,
            collection_name=collection_name
        )

        return jsonify({

            "message": "PDF uploaded successfully",

            "session_id": session_id,

            "pages": len(documents),

            "chunks": len(chunks)

        })

    except Exception as e:

        print("UPLOAD ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500

# --------------------------------
# Chat Endpoint
# --------------------------------

@app.route("/chat", methods=["POST"])
def chat():

    user_text = request.form.get("user_text")
    session_id = request.form.get("session_id")

    print("FORM:", request.form.to_dict())
    print("VALUES:", request.values.to_dict())
    print("FILES:", request.files.to_dict())
    print("CONTENT TYPE:", request.content_type)

    print("\n====================================")
    print("QUESTION:", user_text)
    print("SESSION ID:", session_id)
    print("====================================")

    if not user_text or not user_text.strip():

        return jsonify({
            "error": "Question is required"
        }), 400

    try:

        # =========================================
        # CASE 1: USER PDF
        # =========================================

        if session_id:

            collection_name = (
                "user_" +
                session_id.replace("-", "_")
            )

            print("Opening collection:")
            print(collection_name)

            user_vector_db = Chroma(
                persist_directory=CHROMA_DIR,
                collection_name=collection_name,
                embedding_function=embeddings
            )

            # -----------------------------------------
            # Check stored chunks
            # -----------------------------------------

            collection_data = user_vector_db.get()

            total_chunks = len(
                collection_data["ids"]
            )

            print("TOTAL CHUNKS IN PDF DB:", total_chunks)

            # -----------------------------------------
            # If collection has no chunks
            # -----------------------------------------

            if total_chunks == 0:

                return jsonify({
                    "error": "No chunks found for this PDF session"
                }), 404

            # -----------------------------------------
            # Search PDF
            # -----------------------------------------

            documents = user_vector_db.similarity_search(
                user_text,
                k=min(4, total_chunks)
            )

            print(
                "RETRIEVED DOCUMENTS:",
                len(documents)
            )

            # -----------------------------------------
            # If documents found
            # -----------------------------------------

            if len(documents) > 0:

                context = "\n\n".join(
                    document.page_content
                    for document in documents
                )

                print("\n========== PDF CONTEXT ==========")
                print(context)
                print("=================================\n")

                chain = (
                    rag_prompt
                    | llm
                    | StrOutputParser()
                )

                answer = chain.invoke({
                    "context": context,
                    "question": user_text
                })

                print("FINAL MODE: USER_PDF_RAG")

                return jsonify({

                    "answer": answer,

                    "mode": "USER_PDF_RAG",

                    "session_id": session_id,

                    "retrieved_chunks": len(documents)

                })


        # =========================================
        # CASE 2: NORMAL CHAT
        # =========================================

        print("FINAL MODE: NORMAL")

        chain = (
            normal_prompt
            | llm
            | StrOutputParser()
        )

        answer = chain.invoke({
            "question": user_text
        })

        return jsonify({

            "answer": answer,

            "mode": "NORMAL"

        })


    except Exception as e:

        print("\n========== CHAT ERROR ==========")
        print(str(e))
        print("================================\n")

        return jsonify({

            "error": str(e)

        }), 500


# --------------------------------
# Start Flask
# --------------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5003,
        debug=True
    )