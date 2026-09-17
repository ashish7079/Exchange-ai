from dotenv import load_dotenv
import os
import uuid

from flask import Flask, request, jsonify
from flask_cors import CORS

from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage


load_dotenv()


app = Flask(__name__)
CORS(app)

llm = ChatMistralAI(
    model="ministral-8b-2512",
    api_key=os.getenv("MISTRAL_API_KEY")
)

interviews = {}

@app.route("/interview/start", methods=["POST"])
def start_interview():

    language = request.form.get("language")

    if not language:
        return jsonify({
            "error": "Language is required for this interview"
        }), 400


    # Unique interview ID
    interview_id = str(uuid.uuid4())

    system_prompt = f"""
    You are an AI technical and coding interviewer.

    The candidate wants to give an interview in {language}.

    You have to conduct exactly 10 interview questions.

    Difficulty:
    - Question 1-3: Easy
    - Question 4-6: Medium
    - Question 7-10: Hard

    Rules:

    1. Ask only ONE question at a time.
    2. Wait for the candidate's answer.
    3. After receiving the answer, briefly evaluate it.
    4. Then ask the next question.
    5. Questions must be related to {language}.
    6. Do not change the programming language.
    7. Do not ask all 10 questions at once.
    8. After question 10 is answered, provide final interview analysis.
    9. Do not invent information about the candidate.
    10. There must be exactly 5 coding questions
        and exactly 5 programming-language questions.
    """


    messages = [
        SystemMessage(
            content=system_prompt
        )
    ]

    question_number = 1

    question_type = "coding problem"


    user_prompt = f"""
    Generate question {question_number} of 10.

    Difficulty: Easy

    This must be a {question_type}.

    Programming language: {language}

    Ask ONLY one interview question.

    Do not provide the answer.
    """


    messages.append(
        HumanMessage(
            content=user_prompt
        )
    )


    response = llm.invoke(messages)


    # Store AI question
    messages.append(
        AIMessage(
            content=response.content
        )
    )


    # Save interview
    interviews[interview_id] = {
        "language": language,
        "question_number": 1,
        "messages": messages
    }


    return jsonify({
        "interview_id": interview_id,
        "question_number": 1,
        "question": response.content
    })


# =========================
# Answer Question
# =========================

@app.route("/interview/answer", methods=["POST"])
def answer_interview():

    interview_id = request.form.get("interview_id")
    answer = request.form.get("answer")


    if not interview_id:
        return jsonify({
            "error": "Interview ID is required"
        }), 400


    if not answer:
        return jsonify({
            "error": "Answer is required"
        }), 400


    # Check interview exists
    if interview_id not in interviews:
        return jsonify({
            "error": "Interview not found"
        }), 404


    interview = interviews[interview_id]

    language = interview["language"]
    question_number = interview["question_number"]
    messages = interview["messages"]


    # =========================
    # Store Candidate Answer
    # =========================

    messages.append(
        HumanMessage(
            content=answer
        )
    )


    # =========================
    # Question 10 Answered
    # =========================

    if question_number == 10:

        messages.append(
            HumanMessage(
                content="""
                The interview is now complete.

                Analyze the candidate's performance.

                Provide:

                1. Overall score out of 100
                2. Technical strengths
                3. Weaknesses
                4. Questions answered well
                5. Questions that need improvement
                6. Final recommendation

                Be honest and objective.
                Do not invent information.
                """
            )
        )


        final_response = llm.invoke(messages)


        # Remove completed interview
        del interviews[interview_id]


        return jsonify({
            "completed": True,
            "final_analysis": final_response.content
        })


    # =========================
    # Evaluate Current Answer
    # =========================

    evaluation_prompt = f"""
    Evaluate the candidate's answer to question
    {question_number}.

    Programming language: {language}

    Give a very brief evaluation.

    Mention:
    - Whether the answer is correct
    - What was good
    - What needs improvement

    Do not ask another question.

    Keep the evaluation concise.
    """


    evaluation_messages = messages.copy()

    evaluation_messages.append(
        HumanMessage(
            content=evaluation_prompt
        )
    )


    evaluation_response = llm.invoke(
        evaluation_messages
    )


    evaluation = evaluation_response.content


    # =========================
    # Generate Next Question
    # =========================

    next_question_number = question_number + 1


    # Difficulty
    if next_question_number <= 3:
        difficulty = "Easy"

    elif next_question_number <= 6:
        difficulty = "Medium"

    else:
        difficulty = "Hard"


    # Exactly 5 coding + 5 programming language questions
    #
    # Odd = Coding
    # Even = Programming Language

    if next_question_number % 2 == 1:
        question_type = "coding problem"
    else:
        question_type = "programming language concept"


    next_question_prompt = f"""
    Generate question {next_question_number} of 10.

    Programming language: {language}

    Difficulty: {difficulty}

    Question type: {question_type}

    Rules:

    - Ask ONLY one question.
    - Do not provide the answer.
    - Do not ask multiple questions.
    - Keep the question related to {language}.
    """


    messages.append(
        HumanMessage(
            content=next_question_prompt
        )
    )


    next_response = llm.invoke(messages)


    # Store next AI question
    messages.append(
        AIMessage(
            content=next_response.content
        )
    )


    # Update interview
    interview["question_number"] = next_question_number
    interview["messages"] = messages


    return jsonify({
        "completed": False,
        "question_number": next_question_number,
        "evaluation": evaluation,
        "question": next_response.content
    })


# =========================
# Run Flask
# =========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )




# from dotenv import load_dotenv
# import os

# from langchain_mistralai import ChatMistralAI
# from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# load_dotenv()

# llm = ChatMistralAI(
#     model="mistral-small-latest",
#     api_key=os.getenv("MISTRAL_API_KEY")
# )


# # User se programming language ek baar lo
# language = input("Which language do you want to give interview in? : ")


# system_prompt = f"""
# You are an AI technical and coding interviewer.

# The candidate wants to give an interview in {language}.

# You have to conduct exactly 10 interview questions.

# Difficulty:
# - Question 1-3: Easy
# - Question 4-6: Medium
# - Question 7-10: Hard

# Rules:
# 1. Ask only ONE question at a time.
# 2. Wait for the candidate's answer.
# 3. After receiving the answer, briefly evaluate it.
# 4. Then ask the next question.
# 5. Questions must be related to {language} and ask coding problem related also.
# 6. Do not change the programming language.
# 7. Do not ask all 10 questions at once.
# 8. After question 10 is answered, provide a final interview analysis.
# 9. Do not invent information about the candidate.
# 10.Give 5 question related to coding problem and 5 question to programming language;
# """


# messages = [
#     SystemMessage(content=system_prompt)
# ]


# # Interview loop
# for i in range(1, 11):

#     # Ask AI to generate ONE question
#     if i <= 3:
#         difficulty = "Easy"
#     elif i <= 6:
#         difficulty = "Medium"
#     else:
#         difficulty = "Hard"

#     messages.append(
#         HumanMessage(
#             content=f"""
#             Generate question {i} of 10.

#             Difficulty: {difficulty}

#             Ask only one {language} interview question.
#             Do not provide the answer.
#             """
#         )
#     )

#     response = llm.invoke(messages)

#     print(f"\nBot: {response.content}")

#     # Store AI question in conversation history
#     messages.append(
#         AIMessage(content=response.content)
#     )

#     # Get candidate answer
#     answer = input("\nYou: ")

#     # Store candidate answer
#     messages.append(
#         HumanMessage(content=answer)
#     )


# # Final analysis
# messages.append(
#     HumanMessage(
#         content="""
#         The interview is now complete.

#         Analyze the candidate's performance.

#         Provide:
#         1. Overall score out of 100
#         2. Technical strengths
#         3. Weaknesses
#         4. Questions answered well
#         5. Questions that need improvement
#         6. Final recommendation

#         Be honest and objective.
#         """
#     )
# )

# final_response = llm.invoke(messages)

# print("\n================ FINAL ANALYSIS ================\n")
# print(final_response.content)
