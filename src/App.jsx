import React, { useEffect, useState, useRef } from "react";
import { ZIM } from "zego-zim-web";
import bcg from "./assets/bcg.jpg";

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState("Hardik");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const zimInstanceRef = useRef(null);
  const messageEndRef = useRef(null);

  const appID = 1321966650;
  const tokenA =
    "04AAAAAGifUKAADIasKrOAohXNTWGUaQCxq/9iY0lAEjIbsM3C+QQU9pU0QvhxYF84sW9s2HZ62TzJx/1jW329ayLCsRbFHjBMzMN1j5UOPYvME4EK6lgOv8mjiV58Hk3RFFAdIkk8BJtgEda1XvNlL67oOQwpIQmL+WMyTsQFJcG2swOPmEmvK4XzpyvR28fb3xbgeDifrh91veoTgdQEYZo6qgRA5Tfk7Ss7jTi5DobDHq6EFpAMstZURyMLuEG6gzFYr9SVXNdrAQ==";
  const tokenB =
    "04AAAAAGifULcADMR/8jTmU1kiR2sebQCxY+4lDVub2DUan2PKLkYp3FwdiSZWcAaw1dZ9k+QiraP42HHRVit1aJaDMwjhqkTUF5+t5w49M7Azo1CYrU8QNm9GJhwIwGKgdWUrHF/cyTLft6lCXV4kcWC5TZufg/sqj2myyWMPJMgzLLGYjVaFhyz09sPz4QMSSIqPBFpV5X1uhVftCgiihZ4DXEHIELKlXFoewc/qWSRj00bSe53j8vBRK1AxDE60WqLIu6cH4rkxAQ==";

  // Create instance
  useEffect(() => {
    const instance = ZIM.create({ appID });
    zimInstanceRef.current = instance;

    instance.on("error", (zim, errorInfo) => {
      console.log("error", errorInfo.code, errorInfo.message);
    });

    instance.on("connectionStateChanged", (zim, { state, event }) => {
      console.log("connectionStateChanged", state, event);
    });

    instance.on("peerMessageReceived", (zim, { messageList }) => {
      setMessages((prev) => [...prev, ...messageList]);
    });

    instance.on("tokenWillExpire", (zim, { second }) => {
      console.log("tokenWillExpire", second);
      instance
        .renewToken(selectedUser === "Hardik" ? tokenA : tokenB)
        .then(() => console.log("Token Renewed"))
        .catch((err) => console.log(err));
    });

    return () => {
      instance.destroy();
    };
  }, [appID, selectedUser]);

  // Auto scroll
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Login handler
  const handleLogin = () => {
    if (!zimInstanceRef.current) {
      console.log("ZIM instance not ready yet");
      return;
    }

    const info = {
      userID: selectedUser,
      userName: selectedUser,
    };
    const loginToken = selectedUser === "Hardik" ? tokenA : tokenB;

    zimInstanceRef.current
      .login(info, loginToken)
      .then(() => {
        setUserInfo(info);
        setIsLoggedIn(true);
        console.log("Logged In");
      })
      .catch((err) => {
        console.log("Login Failed", err);
      });
  };

  // Send message
  const handleSendMessage = () => {
    if (!isLoggedIn || !messageText.trim()) return;

    const toConversationID = selectedUser === "Hardik" ? "Nilesh" : "Hardik";
    const conversationType = 0;
    const config = { priority: 1 };

    const messageTextObj = {
      type: 1,
      message: messageText,
      extendedData: "",
    };

    zimInstanceRef.current
      .sendMessage(messageTextObj, toConversationID, conversationType, config)
      .then(({ message }) => {
        setMessages((prev) => [...prev, message]);
      })
      .catch((err) => console.log(err));

    setMessageText("");
  };

  // Time formatting
  const formatTime = (timeStamp) => {
    const date = new Date(timeStamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-center p-2"
      style={{ backgroundImage: `url(${bcg})` }}
    >
      <h1 className="text-center text-[2.7rem] font-bold" style={{color:"white"}}>
        Real Time Chat App
      </h1>

      {!isLoggedIn ? (
        <div className="w-[90%] max-w-[600px] h-[400px] overflow-auto p-5 bg-black/20 backdrop-blur-md shadow-2xl rounded-xl flex flex-col items-center justify-center gap-8 border-2 border-gray-700 mx-auto mt-5">
          <h1 className="text-xl font-bold">Select User</h1>
          <select
            className="px-12 py-1 rounded-xl bg-black text-white"
            onChange={(e) => setSelectedUser(e.target.value)}
            value={selectedUser}
          >
            <option value="Hardik">Hardik Pathak</option>
            <option value="Nilesh">Nilesh Thakur</option>
          </select>
          <button
            className="p-2 bg-white font-semibold cursor-pointer text-black rounded-lg w-[100px]"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      ) : (
        <div className="w-[90%] max-w-[800px] h-[600px] overflow-auto p-5 bg-black/20 backdrop-blur-md shadow-2xl rounded-xl flex flex-col items-center gap-8 border-2 border-gray-700 mx-auto mt-5">
          <h2 className="text-[2.2rem] font-bold">
            {selectedUser === "Hardik" ? "Nilesh" : "Hardik"}
          </h2>
          <div className="w-full h-[1px] bg-black"></div>
          <div className="w-full flex flex-col gap-2 items-center h-[400px] overflow-auto">
            {messages.map((msg, i) => {
              const isOwnMessage = msg.senderUserID === userInfo.userID;
              return (
                <div
                  key={i}
                  className={`flex w-full ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-5 py-2 shadow-lg text-white ${
                      isOwnMessage
                        ? "bg-gray-800 rounded-t-2xl rounded-bl-2xl"
                        : "bg-gray-900 rounded-t-2xl rounded-br-2xl"
                    }`}
                  >
                    <div>{msg.message}</div>
                    <div className="text-[13px] text-gray-400">
                      {formatTime(msg.timestamp || msg.time)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
          <div className="flex items-center justify-center gap-5 w-full">
            <input
              type="text"
              placeholder="Message"
              className="rounded-2xl bg-gray-700 outline-none text-white px-5 py-2 placeholder-white w-full"
              onChange={(e) => setMessageText(e.target.value)}
              value={messageText}
            />
            <button
              className="p-2 bg-white text-black rounded-2xl w-[100px] font-semibold"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
