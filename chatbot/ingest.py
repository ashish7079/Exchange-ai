from dotenv import load_dotenv
import os

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_mistralai import MistralAIEmbeddings
from langchain_chroma import Chroma


load_dotenv()


# chatbot folder ka path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# knowledge folder
KNOWLEDGE_DIR = os.path.join(
    BASE_DIR,
    "knowledge"
)

# Vector database folder
CHROMA_DIR = os.path.join(
    BASE_DIR,
    "chroma_db"
)


documents = []


# knowledge folder ke saare files read karna
for file_name in os.listdir(KNOWLEDGE_DIR):

    file_path = os.path.join(
        KNOWLEDGE_DIR,
        file_name
    )

    if file_name.lower().endswith(".pdf"):

        print("Loading:", file_name)

        loader = PyPDFLoader(file_path)

        documents.extend(
            loader.load()
        )


print("Total pages loaded:", len(documents))


# PDF ko chhote chunks me divide karna
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)


chunks = text_splitter.split_documents(
    documents
)


print("Total chunks:", len(chunks))


# Mistral Embedding Model
embeddings = MistralAIEmbeddings(
    model="mistral-embed",
    api_key=os.getenv("MISTRAL_API_KEY")
)


# Chroma Vector Database
vector_db = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory=CHROMA_DIR,
    collection_name="career_knowledge"
)


print("Vector database created successfully!")