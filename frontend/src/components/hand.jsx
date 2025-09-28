import { useEffect, useState } from "react";
import { socket } from "../socket";
import Card from "./card";

export default function Hand({ table, roomId, players, turn, selfId }) {

    const [hand, setHand] = useState([]);

    useEffect(() => {
        socket.emit("get-hand", roomId);
        const handHandler = ({ hand }) => {

            hand.sort((a, b) => {
                if (a.suiteIndex === b.suiteIndex)
                    return getValueIndex(a.value) - getValueIndex(b.value);
                return a.suiteIndex - b.suiteIndex;
            })

            setHand(hand);
        }
        socket.on("get-hand", handHandler);

        if (players[turn].id === selfId && checkAllCards(hand)) {
            socket.emit("pass",roomId)
            console.log("pass message sent")
        }

        return () => {
            socket.off("get-hand", handHandler);
        }
    }, [])

    function checkAllCards(hand) {
        // if (hand[0] == 1) return false;
        if (hand.length === 0) return false;

        let badCards = 0;
        hand.map((card) => {
            if (!isFit(card)) {
                badCards++
            }
        })
        return badCards == hand.length;
    }

    useEffect(() => {
        console.log(hand.length);

        if (hand.length === 1 && players[turn].id === selfId && isFit(hand[0])) {
            socket.emit("winner", { winner: players[turn].name ,roomId});
            console.log("winner message sent");
        }

        if (players[turn].id === selfId && checkAllCards(hand)) {
            socket.emit("pass",roomId)
            console.log("pass message sent")
        }
    }, [turn]);


    function getValueIndex(value) {
        if (value === 'A')
            return 1;
        if (value === 'J')
            return 11;
        if (value === 'Q')
            return 12;
        if (value === 'K')
            return 13;
        return Number(value);
    }


    function isFit({ value, suiteIndex }) {

        if (value == '7')
            return true;

        if (table[suiteIndex][1].value) {

            if (value === '8')
                return true;

            if (value === '6')
                return true;

            if (table[suiteIndex][0].value) {
                if (getValueIndex(table[suiteIndex][0].value) + 1 === getValueIndex(value))
                    return true;
            }

            if (table[suiteIndex][2].value) {
                if (getValueIndex(table[suiteIndex][2].value) - 1 === getValueIndex(value))
                    return true;
            }
        }
        return false;
    }

    function playMove(value, suiteIndex) {

        if (players[turn].id === selfId && isFit({ value, suiteIndex })) {
            socket.emit("player-move", { value, suiteIndex,roomId });


            setHand((prevHand) => {
                let newHand = prevHand.filter(item => !(item.value === value && item.suiteIndex === suiteIndex));
                return newHand;
            });
        }
    }

    // if (hand.length == 0) {
    //     return (
    //     )
    // }



    return (
        hand.map((card, i) => (
            <Card key={i} value={card.value} suiteIndex={card.suiteIndex} shadow={isFit({ value: card.value, suiteIndex: card.suiteIndex })} onClick={() => { playMove(card.value, card.suiteIndex) }} />
        ))
    )
}