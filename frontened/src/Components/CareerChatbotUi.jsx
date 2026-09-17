import { useState, useRef, useEffect } from "react";

function CareerChatbotUi() {

  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const getCurrentUserEmail = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return "guest";
    }

    try {
      // JWT format = header.payload.signature
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return (
        payload.email ||
        payload.sub ||
        payload.username ||
        "guest"
      );
    } catch (error) {
      console.error("Unable to read JWT:", error);
      return "guest";
    }
  };


  // =========================================================
  // USER SPECIFIC STORAGE KEYS
  // =========================================================

  const userEmail = getCurrentUserEmail();

  // Email ko safe key banane ke liye
  const userKey = userEmail
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "_");


  const CURRENT_CHAT_KEY =
    `careerCurrentChatMessages_${userKey}`;

  const CHAT_HISTORY_KEY =
    `careerChatHistory_${userKey}`;

  const SESSION_ID_KEY =
    `careerChatSessionId_${userKey}`;


  // =========================================================
  // STATES
  // =========================================================

  const [pdf, setPdf] = useState(null);

  const [sessionId, setSessionId] = useState(
    localStorage.getItem(SESSION_ID_KEY) || ""
  );

  const [message, setMessage] = useState("");


  // =========================================================
  // RESTORE CURRENT USER CHAT
  // =========================================================

  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(CURRENT_CHAT_KEY) || "[]"
      );
    } catch {
      return [];
    }
  });


  // =========================================================
  // RESTORE CURRENT USER CHAT HISTORY
  // =========================================================

  const [chatHistory, setChatHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(CHAT_HISTORY_KEY) || "[]"
      );
    } catch {
      return [];
    }
  });


  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);


  // =========================================================
  // AUTO SCROLL + SAVE CURRENT CHAT
  // =========================================================

  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });


    // Save only CURRENT USER's chat
    localStorage.setItem(
      CURRENT_CHAT_KEY,
      JSON.stringify(messages)
    );

  }, [messages, sending]);


  // =========================================================
  // UPLOAD PDF
  // =========================================================

  const uploadPdf = async () => {

    if (!pdf) {
      alert("Please select a PDF first");
      return;
    }


    const token = localStorage.getItem("token");


    if (!token) {
      alert("Please login first");
      return;
    }


    const formData = new FormData();

    formData.append("pdf", pdf);


    try {

      setUploading(true);


      const response = await fetch(
        "http://localhost:5003/upload",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`
          },

          body: formData
        }
      );


      const raw = await response.text();


      let data;


      try {

        data = JSON.parse(raw);

      } catch {

        data = {
          error: raw
        };

      }


      if (!response.ok) {

        throw new Error(
          data.error || "PDF upload failed"
        );

      }


      // =====================================================
      // SAVE USER SPECIFIC SESSION ID
      // =====================================================

      localStorage.setItem(
        SESSION_ID_KEY,
        data.session_id
      );


      setSessionId(data.session_id);


      // =====================================================
      // ADD SYSTEM MESSAGE
      // =====================================================

      setMessages(prev => [
        ...prev,

        {
          type: "ai",

          text:
            `PDF uploaded successfully! 🎉\n\n` +
            `${data.pages} page(s) processed\n` +
            `${data.chunks} chunks created\n\n` +
            `You can now ask questions about your resume.`
        }

      ]);


      setPdf(null);


      if (fileInputRef.current) {

        fileInputRef.current.value = "";

      }


    } catch (error) {

      console.error(error);

      alert(error.message);

    } finally {

      setUploading(false);

    }

  };


  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = async () => {

    if (!message.trim()) {
      return;
    }


    const token = localStorage.getItem("token");


    if (!token) {
      alert("Please login first");
      return;
    }


    const userMessage = message.trim();


    // =====================================================
    // SHOW USER MESSAGE IMMEDIATELY
    // =====================================================

    setMessages(prev => [

      ...prev,

      {
        type: "user",
        text: userMessage
      }

    ]);


    setMessage("");


    try {

      setSending(true);


      const body = new URLSearchParams();


      body.append(
        "user_text",
        userMessage
      );


      // =====================================================
      // GET CURRENT USER'S SESSION
      // =====================================================

      const currentSessionId =
        localStorage.getItem(
          SESSION_ID_KEY
        );


      if (currentSessionId) {

        body.append(
          "session_id",
          currentSessionId
        );

      }


      // =====================================================
      // SEND TO PYTHON CHATBOT
      // =====================================================

      const response = await fetch(
        "http://localhost:5003/chat",
        {
          method: "POST",

          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/x-www-form-urlencoded"

          },

          body

        }
      );


      const raw = await response.text();


      let data;


      try {

        data = JSON.parse(raw);

      } catch {

        data = {
          error: raw
        };

      }


      if (!response.ok) {

        setMessages(prev => [

          ...prev,

          {
            type: "ai",

            text:
              data.error ||
              "Something went wrong."
          }

        ]);

        return;

      }


      // =====================================================
      // ADD AI RESPONSE
      // =====================================================

      setMessages(prev => [

        ...prev,

        {
          type: "ai",
          text: data.answer
        }

      ]);


    } catch (error) {

      console.error(error);


      setMessages(prev => [

        ...prev,

        {
          type: "ai",

          text:
            "Unable to connect to server."
        }

      ]);

    } finally {

      setSending(false);

    }

  };


  // =========================================================
  // SAVE CURRENT CHAT
  // =========================================================

  const saveCurrentChat = () => {

    if (messages.length === 0) {
      return;
    }


    const firstUserMessage =
      messages.find(
        msg => msg.type === "user"
      );


    const title =
      firstUserMessage?.text?.trim()

        ? firstUserMessage.text
            .trim()
            .slice(0, 40)

        : "Career Chat";


    const chatItem = {

      id: Date.now(),

      title,

      messages,

      sessionId

    };


    const updatedHistory = [

      chatItem,

      ...chatHistory

    ].slice(0, 10);


    setChatHistory(updatedHistory);


    // =====================================================
    // SAVE ONLY CURRENT USER HISTORY
    // =====================================================

    localStorage.setItem(
      CHAT_HISTORY_KEY,
      JSON.stringify(updatedHistory)
    );

  };


  // =========================================================
  // NEW CHAT
  // =========================================================

  const newChat = () => {

    saveCurrentChat();


    setMessages([]);

    setMessage("");

    setPdf(null);


    // Remove only CURRENT USER session
    localStorage.removeItem(
      SESSION_ID_KEY
    );


    // Remove only CURRENT USER current chat
    localStorage.removeItem(
      CURRENT_CHAT_KEY
    );


    setSessionId("");


    if (fileInputRef.current) {

      fileInputRef.current.value = "";

    }

  };


  // =========================================================
  // OPEN OLD CHAT
  // =========================================================

  const openChat = (chat) => {

    setMessages(
      chat.messages || []
    );


    setMessage("");


    if (chat.sessionId) {

      setSessionId(
        chat.sessionId
      );


      localStorage.setItem(
        SESSION_ID_KEY,
        chat.sessionId
      );

    } else {

      setSessionId("");


      localStorage.removeItem(
        SESSION_ID_KEY
      );

    }


    localStorage.setItem(
      CURRENT_CHAT_KEY,
      JSON.stringify(
        chat.messages || []
      )
    );

  };


  // =========================================================
  // DELETE CHAT
  // =========================================================

  const deleteChat = (chatId) => {

    const updatedHistory =
      chatHistory.filter(
        chat => chat.id !== chatId
      );


    setChatHistory(
      updatedHistory
    );


    localStorage.setItem(
      CHAT_HISTORY_KEY,
      JSON.stringify(
        updatedHistory
      )
    );

  };


  // =========================================================
  // CLEAR HISTORY
  // =========================================================

  const clearHistory = () => {

    setChatHistory([]);


    localStorage.removeItem(
      CHAT_HISTORY_KEY
    );

  };


  // =========================================================
  // ENTER KEY
  // =========================================================

  const handleKeyDown = (e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      sendMessage();

    }

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-3 sm:px-4 py-5 sm:py-8">

      <div className="max-w-6xl mx-auto">


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="text-center mb-8">

          <div
            className="
              inline-flex
              items-center
              justify-center
              w-14
              h-14
              rounded-2xl
              bg-blue-600
              text-white
              text-2xl
              shadow-lg
              mb-4
            "
          >
            🤖
          </div>


          <h1
            className="
              text-2xl
              sm:text-3xl
              lg:text-4xl
              font-bold
              text-slate-900
            "
          >
            AI Career Chatbot
          </h1>


          <p
            className="
              mt-2
              px-2
              text-sm
              sm:text-base
              text-slate-500
            "
          >
            Your AI assistant for career, resume and interview preparation
          </p>

        </div>


        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div
          className="
            grid
            lg:grid-cols-[300px_minmax(0,1fr)]
            gap-4
            sm:gap-6
          "
        >


          {/* ===================================================
              SIDEBAR
          =================================================== */}

          <div
            className="
              bg-white
              rounded-2xl
              border
              border-slate-200
              shadow-sm
              p-4
              sm:p-5
              h-fit
            "
          >


            {/* =================================================
                UPLOAD SECTION
            ================================================= */}

            <div className="mb-6">

              <div className="flex items-center gap-3 mb-4">

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-blue-50
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  📄
                </div>


                <div>

                  <h2
                    className="
                      font-semibold
                      text-slate-900
                    "
                  >
                    Resume
                  </h2>


                  <p
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    Connect your PDF
                  </p>

                </div>

              </div>


              {/* =================================================
                  FILE UPLOAD
              ================================================= */}

              <div
                className="
                  border-2
                  border-dashed
                  border-slate-300
                  rounded-xl
                  p-5
                  text-center
                  hover:border-blue-400
                  transition
                "
              >

                <div className="text-3xl mb-2">
                  📎
                </div>


                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Upload Resume
                </p>


                <p
                  className="
                    text-xs
                    text-slate-400
                    mt-1
                    mb-4
                  "
                >
                  PDF files only
                </p>


                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setPdf(
                      e.target.files[0]
                    )
                  }
                  className="
                    block
                    w-full
                    text-xs
                    text-slate-500
                    file:mr-2
                    file:py-2
                    file:px-3
                    file:rounded-lg
                    file:border-0
                    file:bg-blue-50
                    file:text-blue-700
                    hover:file:bg-blue-100
                  "
                />

              </div>


              {/* =================================================
                  SELECTED FILE
              ================================================= */}

              {pdf && (

                <div
                  className="
                    mt-3
                    p-3
                    rounded-xl
                    bg-slate-50
                    border
                    border-slate-200
                  "
                >

                  <p
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    Selected file
                  </p>


                  <p
                    className="
                      text-sm
                      font-medium
                      text-slate-800
                      truncate
                      mt-1
                    "
                  >
                    {pdf.name}
                  </p>

                </div>

              )}


              {/* =================================================
                  UPLOAD BUTTON
              ================================================= */}

              <button
                onClick={uploadPdf}
                disabled={
                  uploading ||
                  !pdf
                }
                className="
                  w-full
                  mt-3
                  py-2.5
                  rounded-xl
                  bg-blue-600
                  text-white
                  text-sm
                  font-semibold
                  hover:bg-blue-700
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                {uploading
                  ? "Processing PDF..."
                  : "Upload & Connect"
                }

              </button>


              {/* =================================================
                  CONNECTED
              ================================================= */}

              {sessionId && (

                <div
                  className="
                    mt-3
                    flex
                    items-center
                    gap-2
                    px-3
                    py-2
                    rounded-lg
                    bg-green-50
                    border
                    border-green-200
                  "
                >

                  <span
                    className="
                      text-green-600
                    "
                  >
                    ✓
                  </span>


                  <span
                    className="
                      text-xs
                      font-medium
                      text-green-700
                    "
                  >
                    Resume connected
                  </span>

                </div>

              )}

            </div>


            {/* =================================================
                DIVIDER
            ================================================= */}

            <div
              className="
                border-t
                border-slate-200
                my-5
              "
            />


            {/* =================================================
                NEW CHAT
            ================================================= */}

            <button
              onClick={newChat}
              className="
                w-full
                py-2.5
                rounded-xl
                border
                border-slate-300
                text-slate-700
                text-sm
                font-semibold
                hover:bg-slate-50
                transition
              "
            >
              + New Chat
            </button>


            {/* =================================================
                CHAT HISTORY
            ================================================= */}

            {chatHistory.length > 0 && (

              <div className="mt-6">

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-3
                  "
                >

                  <p
                    className="
                      text-xs
                      font-semibold
                      text-slate-400
                      uppercase
                      tracking-wider
                    "
                  >
                    Recent Chats
                  </p>


                  <button
                    onClick={clearHistory}
                    className="
                      text-[11px]
                      text-slate-400
                      hover:text-red-500
                      transition
                    "
                  >
                    Clear
                  </button>

                </div>


                <div className="space-y-2">

                  {chatHistory.map(
                    (chat) => (

                      <div
                        key={chat.id}
                        className="
                          group
                          flex
                          items-center
                          gap-2
                          p-2
                          rounded-lg
                          bg-slate-50
                          border
                          border-transparent
                          hover:border-blue-200
                          hover:bg-blue-50
                          transition
                        "
                      >

                        <button
                          onClick={() =>
                            openChat(chat)
                          }
                          className="
                            flex-1
                            min-w-0
                            text-left
                            px-1
                            py-1
                          "
                          title={chat.title}
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <span className="text-sm">
                              💬
                            </span>


                            <span
                              className="
                                text-xs
                                font-medium
                                text-slate-700
                                truncate
                              "
                            >
                              {chat.title}
                            </span>

                          </div>

                        </button>


                        <button
                          onClick={() =>
                            deleteChat(chat.id)
                          }
                          className="
                            shrink-0
                            w-7
                            h-7
                            rounded-lg
                            text-slate-300
                            hover:text-red-500
                            hover:bg-white
                            transition
                            opacity-0
                            group-hover:opacity-100
                          "
                          title="Delete chat"
                        >
                          ×
                        </button>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


            {/* =================================================
                FEATURES
            ================================================= */}

            <div className="mt-6">

              <p
                className="
                  text-xs
                  font-semibold
                  text-slate-400
                  uppercase
                  tracking-wider
                  mb-3
                "
              >
                What you can ask
              </p>


              <div className="space-y-2">

                <div
                  className="
                    p-3
                    rounded-lg
                    bg-slate-50
                    text-xs
                    text-slate-600
                  "
                >
                  💼 Career guidance
                </div>


                <div
                  className="
                    p-3
                    rounded-lg
                    bg-slate-50
                    text-xs
                    text-slate-600
                  "
                >
                  📄 Resume questions
                </div>


                <div
                  className="
                    p-3
                    rounded-lg
                    bg-slate-50
                    text-xs
                    text-slate-600
                  "
                >
                  💻 Technical preparation
                </div>


                <div
                  className="
                    p-3
                    rounded-lg
                    bg-slate-50
                    text-xs
                    text-slate-600
                  "
                >
                  🎯 Interview preparation
                </div>

              </div>

            </div>

          </div>


          {/* ===================================================
              CHAT AREA
          =================================================== */}

          <div
            className="
              bg-white
              rounded-2xl
              border
              border-slate-200
              shadow-sm
              overflow-hidden
              flex
              flex-col
              min-h-[650px]
            "
          >


            {/* =================================================
                CHAT HEADER
            ================================================= */}

            <div
              className="
                px-6
                py-4
                border-b
                border-slate-200
                flex
                items-center
                justify-between
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-blue-600
                    flex
                    items-center
                    justify-center
                    text-white
                    text-lg
                  "
                >
                  AI
                </div>


                <div>

                  <h2
                    className="
                      font-semibold
                      text-slate-900
                    "
                  >
                    Career Assistant
                  </h2>


                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        w-2
                        h-2
                        rounded-full
                        bg-green-500
                      "
                    />


                    <span
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      Online
                    </span>

                  </div>

                </div>

              </div>


              {sessionId && (

                <span
                  className="
                    hidden
                    sm:block
                    text-xs
                    px-3
                    py-1.5
                    rounded-full
                    bg-blue-50
                    text-blue-600
                    font-medium
                  "
                >
                  PDF Mode
                </span>

              )}

            </div>


            {/* =================================================
                MESSAGES
            ================================================= */}

            <div
              className="
                flex-1
                overflow-y-auto
                p-6
                space-y-5
                bg-slate-50/50
              "
            >

              {/* =================================================
                  EMPTY CHAT
              ================================================= */}

              {messages.length === 0 && (

                <div
                  className="
                    min-h-[500px]
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    px-4
                  "
                >

                  <div
                    className="
                      w-20
                      h-20
                      rounded-3xl
                      bg-blue-50
                      flex
                      items-center
                      justify-center
                      text-4xl
                      mb-5
                    "
                  >
                    🤖
                  </div>


                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-slate-800
                    "
                  >
                    How can I help you?
                  </h2>


                  <p
                    className="
                      max-w-md
                      text-sm
                      text-slate-500
                      mt-2
                      leading-6
                    "
                  >
                    Ask me about careers, interviews,
                    resumes, programming or upload your
                    resume to ask questions about it.
                  </p>


                  {/* =================================================
                      SUGGESTIONS
                  ================================================= */}

                  <div
                    className="
                      grid
                      sm:grid-cols-2
                      gap-3
                      mt-7
                      max-w-lg
                      w-full
                    "
                  >

                    <button
                      onClick={() =>
                        setMessage(
                          "How can I improve my resume?"
                        )
                      }
                      className="
                        p-3
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-left
                        text-sm
                        text-slate-600
                        hover:border-blue-300
                        hover:bg-blue-50
                        transition
                      "
                    >
                      📄 Improve my resume
                    </button>


                    <button
                      onClick={() =>
                        setMessage(
                          "How should I prepare for a Java interview?"
                        )
                      }
                      className="
                        p-3
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-left
                        text-sm
                        text-slate-600
                        hover:border-blue-300
                        hover:bg-blue-50
                        transition
                      "
                    >
                      💻 Prepare for Java interview
                    </button>


                    <button
                      onClick={() =>
                        setMessage(
                          "What skills should I learn for software development?"
                        )
                      }
                      className="
                        p-3
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-left
                        text-sm
                        text-slate-600
                        hover:border-blue-300
                        hover:bg-blue-50
                        transition
                      "
                    >
                      🚀 Skills to learn
                    </button>


                    <button
                      onClick={() =>
                        setMessage(
                          "Give me a career roadmap for a software developer."
                        )
                      }
                      className="
                        p-3
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-left
                        text-sm
                        text-slate-600
                        hover:border-blue-300
                        hover:bg-blue-50
                        transition
                      "
                    >
                      🗺️ Career roadmap
                    </button>

                  </div>

                </div>

              )}


              {/* =================================================
                  CHAT MESSAGES
              ================================================= */}

              {messages.map(
                (msg, index) => (

                  <div
                    key={index}
                    className={`
                      flex
                      ${
                        msg.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }
                    `}
                  >

                    <div
                      className={`
                        flex
                        gap-3
                        max-w-[85%]
                        ${
                          msg.type === "user"
                            ? "flex-row-reverse"
                            : ""
                        }
                      `}
                    >

                      {/* =================================================
                          AVATAR
                      ================================================= */}

                      <div
                        className={`
                          shrink-0
                          w-9
                          h-9
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          text-sm
                          font-bold
                          ${
                            msg.type === "user"
                              ? "bg-slate-800 text-white"
                              : "bg-blue-600 text-white"
                          }
                        `}
                      >

                        {msg.type === "user"
                          ? "U"
                          : "AI"
                        }

                      </div>


                      {/* =================================================
                          MESSAGE
                      ================================================= */}

                      <div
                        className={`
                          px-4
                          py-3
                          rounded-2xl
                          shadow-sm
                          whitespace-pre-wrap
                          text-sm
                          leading-6
                          ${
                            msg.type === "user"
                              ? "bg-blue-600 text-white rounded-tr-sm"
                              : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                          }
                        `}
                      >
                        {msg.text}
                      </div>

                    </div>

                  </div>

                )
              )}


              {/* =================================================
                  AI THINKING
              ================================================= */}

              {sending && (

                <div className="flex justify-start">

                  <div className="flex gap-3">

                    <div
                      className="
                        w-9
                        h-9
                        rounded-xl
                        bg-blue-600
                        text-white
                        flex
                        items-center
                        justify-center
                        text-xs
                        font-bold
                      "
                    >
                      AI
                    </div>


                    <div
                      className="
                        bg-white
                        border
                        border-slate-200
                        px-5
                        py-4
                        rounded-2xl
                        rounded-tl-sm
                      "
                    >

                      <div className="flex gap-1">

                        <span
                          className="
                            w-2
                            h-2
                            bg-slate-400
                            rounded-full
                            animate-bounce
                          "
                        />


                        <span
                          className="
                            w-2
                            h-2
                            bg-slate-400
                            rounded-full
                            animate-bounce
                            [animation-delay:150ms]
                          "
                        />


                        <span
                          className="
                            w-2
                            h-2
                            bg-slate-400
                            rounded-full
                            animate-bounce
                            [animation-delay:300ms]
                          "
                        />

                      </div>

                    </div>

                  </div>

                </div>

              )}


              <div ref={chatEndRef} />

            </div>


            {/* =================================================
                INPUT
            ================================================= */}

            <div
              className="
                border-t
                border-slate-200
                bg-white
                p-4
              "
            >

              <div
                className="
                  flex
                  items-end
                  gap-3
                  bg-slate-50
                  border
                  border-slate-200
                  rounded-2xl
                  p-2
                  focus-within:border-blue-400
                  focus-within:ring-2
                  focus-within:ring-blue-100
                  transition
                "
              >

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={
                    sessionId
                      ? "Ask something about your resume..."
                      : "Ask a career question..."
                  }
                  rows={2}
                  className="
                    flex-1
                    bg-transparent
                    border-0
                    outline-none
                    resize-none
                    px-3
                    py-2
                    text-sm
                    text-slate-700
                    placeholder:text-slate-400
                  "
                />


                <button
                  onClick={sendMessage}
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  className="
                    shrink-0
                    w-11
                    h-11
                    rounded-xl
                    bg-blue-600
                    text-white
                    flex
                    items-center
                    justify-center
                    hover:bg-blue-700
                    transition
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                  "
                  title="Send message"
                >
                  ➤
                </button>

              </div>


              <p
                className="
                  text-center
                  text-[11px]
                  text-slate-400
                  mt-2
                "
              >
                Press Enter to send • Shift + Enter for new line
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>

  );
}

export default CareerChatbotUi;