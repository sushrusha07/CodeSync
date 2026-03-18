import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      alert("Room ID and Username required");
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>CodeSync</h1>
      <p style={styles.subtitle}>Real-time collaborative coding platform</p>

      <div style={styles.card}>
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <button style={styles.joinBtn} onClick={joinRoom}>
          Join Room
        </button>

        <p style={styles.create}>
          Don't have a room?{" "}
          <span onClick={createNewRoom} style={styles.link}>
            Create one
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white",
  },
  title: {
    fontSize: "48px",
    marginBottom: "10px",
  },
  subtitle: {
    marginBottom: "30px",
    color: "#94a3b8",
  },
  card: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "10px",
    width: "350px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "none",
  },
  joinBtn: {
    padding: "10px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  create: {
    textAlign: "center",
  },
  link: {
    color: "#6366f1",
    cursor: "pointer",
  },
};

export default Home;