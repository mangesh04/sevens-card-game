const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // change to ynur frontend origin in production
        methods: ["GET", "POST"]
    }
});

let table = [[{}, { value: 0, suiteIndex: 0 }, {}], [{}, { value: '7', suiteIndex: 1 }, {}], [{}, { value: 0, suiteIndex: 2 }, {}], [{}, { value: 0, suiteIndex: 3 }, {}]];

// Utilities♦
function generateShuffledDeck() {
    const suits = [0, 1, 2, 3];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const deck = [];

    for (const suit of suits) {
        for (const value of values) {
            if (value == '7' && suit == 1)
                continue;
            deck.push({ value, suiteIndex: suit });
        }
    }

    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

function splitDeck(deck, playerCount) {
    const hands = Array(playerCount).fill(0).map(() => []);
    deck.forEach((card, i) => {
        hands[i % playerCount].push(card);
    });
    return hands;
}

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


const rooms = {};
let playerTurn = 0;
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("get-hand", (roomId) => {
        const room = rooms[roomId];
        if (!room || room.players.length < 2) return;

        const deck = generateShuffledDeck();
        const playerCount = room.players.length;
        const hands = splitDeck(deck, playerCount);

        // Assign hands to players and notify individually
        room.players.forEach((player, index) => {
            io.to(player.id).emit("get-hand", {
                hand: hands[index]
            });
        });
    });

    socket.on("start-game", (roomId) => {
        const room = rooms[roomId];
        if (!room || room.players.length < 2) return;

        room.players.forEach((player, index) => {
            io.to(player.id).emit("start-game", {
                players: room.players.map(p => ({ name: p.name, id: p.id })),
            });
        });
    });

    socket.on("start-again", (roomId) => {
        // roomId
        // const room = rooms[roomId];
        // if (!room || room.players.length < 2) return;

        // const deck = generateShuffledDeck();
        // const playerCount = room.players.length;
        // const hands = splitDeck(deck, playerCount);

        // Assign hands to players and notify individually
        // room.players.forEach((player, index) => {
        //     io.to(player.id).emit("get-hand", {
        //         hand: hands[index]
        //     });
        // });
        console.log("start-again", "new-table")

        io.to(roomId).emit("new-table");
    })

    socket.on("player-move", ({ value, suiteIndex ,roomId}) => {

        let i = suiteIndex;

        let j;

        if (getValueIndex(value) > '7')
            j = 0

        if (value == '7')
            j = 1;

        if (getValueIndex(value) < '7')
            j = 2

        // table[i][j] = { value, suiteIndex };

        io.to(roomId).emit("change-table", { card: { value, suiteIndex }, index: [i, j] });
        io.to(roomId).emit("change-turn");

    });

    socket.on("winner", ({ winner,roomId }) => {
        console.log("winner is ", winner)
        io.to(roomId).emit("winner", { winner });
    })

    socket.on("pass", (roomId) => {

        io.to(roomId).emit("change-turn");
    });

    socket.on("create-lobby", (playerName, callback) => {
        const roomId = generateRoomId();
        rooms[roomId] = { players: [{ id: socket.id, name: playerName }] };
        socket.join(roomId);
        callback({ roomId });
        console.log(`Lobby created: ${roomId}`);
    });

    socket.on("join-lobby", ({ roomId, playerName }, callback) => {
        const room = rooms[roomId];
        if (room) {
            room.players.push({ id: socket.id, name: playerName });
            socket.join(roomId);
            callback({ success: true, players: room.players });
            io.to(roomId).emit("player-joined", room.players);
        } else {
            callback({ success: false, error: "Room not found" });
        }
    });

    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
            io.to(roomId).emit("player-joined", rooms[roomId].players);
        }
        console.log("Client disconnected:", socket.id);
    });
});

function generateRoomId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}



// server.listen(3001, '192.168.230.73', () => {
//     console.log("Server running on http://localhost:3001");
// });
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server running on http://localhost:3001");
});
