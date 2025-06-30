import React, { useState } from "react";
import { socket } from "../socket";
import "./lobby.css"

export default function Lobby({ setRoomInfo }) {
  const [playerName, setPlayerName] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");

  const createLobby = () => {
    if (!playerName) return alert("Enter your name");
    socket.emit("create-lobby", playerName, ({ roomId }) => {
      setRoomInfo({ roomId, playerName });
    });
  };

  const joinLobby = () => {
    if (!roomIdInput || !playerName) return alert("Enter both fields");
    socket.emit("join-lobby", { roomId: roomIdInput, playerName }, (res) => {
      if (res.success) {
        setRoomInfo({ roomId: roomIdInput, playerName });
      } else {
        alert(res.error);
      }
    });
  };

  return (

    <>
      <div className="lobby">

        <div className="lobby-container">
          <h2>Sevens Multiplayer</h2>
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <br /><br />
          <button onClick={createLobby}>Create Lobby</button>

          <hr />

          <input
            type="text"
            placeholder="Room ID"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
          />
          <br /><br />
          <button onClick={joinLobby}>Join Lobby</button>
        </div>

      </div>
    </>
  );

}
