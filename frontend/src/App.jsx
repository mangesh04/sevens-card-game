import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";
import Lobby from "./components/lobby";
import GamePage from "./components/GamePage";
import './App.css'


function App() {

  const [roomInfo, setRoomInfo] = useState(null);
  const [players, setPlayers] = useState([]);
  const [inGame, setInGame] = useState(false);

  useEffect(() => {

    if (roomInfo) {

      socket.on("player-joined", (updatedPlayers) => {
        setPlayers(updatedPlayers);
      });

      socket.on("start-game", ({ players }) => {
        setPlayers(players);
        setInGame(true);
      });

    }

    return () => {
      socket.off("player-joined");
      socket.off("start-game");
    };
  }, [roomInfo]);

  if (!roomInfo) return <Lobby setRoomInfo={setRoomInfo} />;

  if (inGame) return <GamePage players={players} selfId={socket.id} roomId={roomInfo.roomId} />;

  return (
    <>
      <div className="room_container">
        <div>
          <h2>Room ID: {roomInfo.roomId}</h2>
          <ul>
            {players.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
          {players.length >= 2 && players.length <= 4 && players[0].id === socket.id && (
            <button onClick={() => socket.emit("start-game", roomInfo.roomId)}>Start Game</button>
          )}
        </div>
      </div>
    </>
  );
}

export default App;




// useEffect(() => {

//   setPlayerTurn(prev => { return (prev >= players.length - 1 || prev === -1) ? 0 : prev + 1 });

//   const handler = () => {
//     setPlayerTurn(prev => { return (prev >= players.length - 1 || prev === -1) ? 0 : prev + 1 });
//     console.log("message received")
//   }

//   socket.on("passed", handler);
//   return () => {
//     socket.off("passed", handler);
//   };

// }, [table]);