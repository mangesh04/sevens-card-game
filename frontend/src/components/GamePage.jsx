import Table from "./table";
import Hand from "./hand";
import "./GamePage.css";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import Card from "./card";

export default function GamePage({ players, roomId, selfId }) {

  const newTable = [[{}, { value: "", suiteIndex: 0 }, {}], [{}, { value: '7', suiteIndex: 1 }, {}], [{}, { value: "", suiteIndex: 2 }, {}], [{}, { value: "", suiteIndex: 3 }, {}]];

  const [table, setTable] = useState(newTable);

  const [turn, setTurn] = useState(0);
  const [winner, setWinner] = useState("");

  useEffect(() => {
    const handler = () => {
      console.log("received")
      setTurn(prev => { return (prev >= players.length - 1) ? 0 : prev + 1 });
    };

    socket.on("change-turn", handler)

    const winnerHandler = ({ winner }) => {
      console.log("winner recievd", winner);
      setWinner(winner);
    }

    socket.on("winner", winnerHandler)

    const tableHandler = () => {
      setTable(newTable);
      setWinner("");
    }

    socket.on("new-table", tableHandler);

    return () => {
      socket.off("change-turn", handler);
      socket.off("winner", winnerHandler);
      socket.off("new-table", tableHandler);
    }

  }, [])

  function start_again() {
    socket.emit("start-again");
  }
  if (winner) {

    return (
      <div className="game-container">
        <h4>{players[turn]?.name} Won 🎉🎉 </h4>
        <button onClick={start_again}> Play again </button>
      </div>
    )
  }

  return (
    <div className="game-container">

      <Table table={table} setTable={setTable} setTurn={setTurn} />

      <h4>{players[turn]?.name}'s Turn</h4>

      <div className="card-row"> <Hand table={table} roomId={roomId} turn={turn} players={players} selfId={selfId} /></div>

    </div>
  );
}
