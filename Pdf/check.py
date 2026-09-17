from dotenv import load_dotenv
import os
from langchain_mistralai import ChatMistralAI

load_dotenv()

llm = ChatMistralAI(
    model="ministral-8b-2512",
    api_key=os.getenv("MISTRAL_API_KEY")
)
response = llm.invoke("Say hello in one sentence.")

print(response.content)