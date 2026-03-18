import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Client from "../components/Client";
import Editor from "../components/Editor";
import FilePreview from "../components/FilePreview";
import { language, cmtheme } from "../../src/atoms";
import { useRecoilState } from "recoil";
import ACTIONS from "../actions/Actions";
import { initSocket } from "../socket";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

const EditorPage = () => {
  const [lang, setLang] = useRecoilState(language);
  const [them, setThem] = useRecoilState(cmtheme);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();

  const [filePreview, setFilePreview] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const fileInputRef = useRef(null);
  const editorInstanceRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      const handleErrors = (e) => {
        console.log("socket error", e);
        toast.error("Socket connection failed.");
        reactNavigator("/");
      };

      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
        }

        setClients(clients);

        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });

      socketRef.current.on(ACTIONS.RECEIVE_MESSAGE, ({ username, message }) => {
        setMessages((prev) => [...prev, { username, message }]);
      });
    };

    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off(ACTIONS.RECEIVE_MESSAGE);
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      setFileContent(e.target.result);
      setFilePreview(true);
    };

    reader.readAsText(file);
  }

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateEditorCode = (newCode) => {
    editorInstanceRef.current?.setCode(newCode);
    codeRef.current = newCode;

    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      roomId,
      code: newCode,
    });
  };

  const handleAppendCode = () => {
    const currentCode = codeRef.current || "";
    const appendedCode = currentCode
      ? `${currentCode}\n\n${fileContent}`
      : fileContent;

    updateEditorCode(appendedCode);
    setFilePreview(false);
    resetFileInput();
  };

  const handleReplaceCode = () => {
    updateEditorCode(fileContent);
    setFilePreview(false);
    resetFileInput();
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    socketRef.current.emit(ACTIONS.SEND_MESSAGE, {
      roomId,
      message: chatInput,
      username: location.state.username,
    });

    setChatInput("");
  };

  const runCode = async () => {
    try {
      setOutput("Running...");

      const submission = await fetch(
        "https://ce.judge0.com/submissions?base64_encoded=false",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_code: codeRef.current,
            language_id: 63,
          }),
        }
      );

      const submissionData = await submission.json();
      const token = submissionData.token;

      const result = await fetch(
        `https://ce.judge0.com/submissions/${token}?base64_encoded=false&wait=true`
      );

      const resultData = await result.json();

      setOutput(
        resultData.stdout ||
          resultData.stderr ||
          resultData.compile_output ||
          "No Output"
      );
    } catch (error) {
      console.error(error);
      setOutput("Error running code");
    }
  };

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <h2 style={{ marginTop: "10px", color: "#4aed88" }}>
              CodeSync
            </h2>
          </div>

          <h3>Connected Users ({clients.length})</h3>

          <div className="clientsList">
            {clients.length === 0 ? (
              <p>No users yet</p>
            ) : (
              clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))
            )}
          </div>
        </div>

        <input
          type="file"
          accept=".js,.py,.java,.cpp,.c,.txt,.html,.css"
          style={{ display: "none" }}
          id="fileUpload"
          onChange={handleFileUpload}
          ref={fileInputRef}
        />

        <button
          className="uploadFileBtn"
          onClick={() => document.getElementById("fileUpload").click()}
        >
          Upload File
        </button>

        {filePreview && (
          <FilePreview
            setFilePreview={setFilePreview}
            fileContent={fileContent}
            resetFileInput={resetFileInput}
            onAppend={handleAppendCode}
            onReplace={handleReplaceCode}
          />
        )}

        <label>
          Select Language:
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              window.location.reload();
            }}
            className="seLang"
          >
            <option value="clike">C / C++ / Java</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </label>

        <label>
          Select Theme:
          <select
            value={them}
            onChange={(e) => setThem(e.target.value)}
            className="seLang"
          >
            <option value="default">default</option>
            <option value="material">material</option>
            <option value="monokai">monokai</option>
            <option value="dracula">dracula</option>
          </select>
        </label>

        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>

        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave Room
        </button>

        <button className="btn runBtn" onClick={runCode}>
          Run Code
        </button>
      </div>

      <div className="editorWrap">
        <Editor
          ref={editorInstanceRef}
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />

        <div
          style={{
            background: "#1e1e1e",
            color: "white",
            padding: "10px",
            height: "300px",
            overflow: "auto",
          }}
        >
          <h3>Output</h3>
          <pre>{output}</pre>

          <hr />

          <h3>Room Chat</h3>

          {messages.map((msg, index) => (
            <div key={index}>
              <strong>{msg.username}:</strong> {msg.message}
            </div>
          ))}

          <div style={{ marginTop: "10px" }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message..."
              style={{ width: "75%", marginRight: "5px" }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;