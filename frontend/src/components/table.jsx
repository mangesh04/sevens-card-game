import { useEffect, useRef } from "react";
import Card from "./card";
import "./table.css";
import { socket } from "../socket";
import playedSound from '../assets/played.wav';


export default function Table({ table, setTable }) {


    const audioRef = useRef(null);

    useEffect(() => {

        audioRef.current = new Audio(playedSound);
        const tableHandler = ({ card, index }) => {

            // adding new card to table
            setTable((prevTable) => {

                let newTable = [...prevTable]
                prevTable.map((ele, i) => {
                    newTable[i] = [...ele]
                })

                newTable[index[0]][index[1]] = card;
                return newTable;
            });

        }
        socket.on("change-table", tableHandler);
        return () => {
            socket.off("change-table", tableHandler);
            audioRef.current = null;
        }
        // socket.on("new-table", ({ table }) => {
        //     setTable(table);
        //     console.log("new deck recived");
        // })
    }, []);

    useEffect(() => {
        audioRef.current.play();
    }, [table])

    return (
        <>
            <div className="table">

                {table.map((column, i) => (
                    <div className="card_column" key={i}>

                        <div className="card_slot top_slot">
                            {column[0].value &&
                                <Card value={column[0].value} suiteIndex={column[0].suiteIndex} shadow={true} />}
                        </div>

                        <Card value={column[1].value} suiteIndex={column[1].suiteIndex} />

                        <div className="card_slot bottom_slot">
                            {column[2].value &&
                                <Card value={column[2].value} suiteIndex={column[2].suiteIndex} shadow={true} />
                            }
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
