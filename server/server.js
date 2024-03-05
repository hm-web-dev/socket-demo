// Import required libraries
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Import the database functions
const db = require('./db');

// Import GameState 
const { GameState } = require('./constants');

// Create the express app and the server
const app = express();
app.use(express.json());
// Handle CORS w/ client
// For more information about CORS (Cross-Origin Resource Sharing):
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use((req, res, next) => {
    // Allow access from multiple origins
    const allowedOrigins = [
        "http://localhost:5173",
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    // Allow specific requests
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Pass to next layer of middleware
    next();
});

// Create the socket server and attach it to the express server
const server = http.createServer(app);
const io = socketIO(server, {
    // have to add cors again for sockets
    cors: {
        origin: "http://localhost:5173",
    }
});

// Create a new room 
app.post('/createRoom', (req, res) => {
    // create an active room in database, will last for 1 hour
    db.createRoom(req, res);

});

// Serve a specific room 
// app.post('/rooms/:room', async (req, res) => {
//     // get the room from the database
//     // if the room is still active, send the room data to the client
//     // if the room is not active, send a 500 error
//     // if the room does not exist, send a 404 error
//     const code = await db.getRoom(req.params.room).then(async (row) => {
//         console.log('socket id : ' + req.body.socket);

//         await joinRoom(req.body.socket, row.code);
//         res.json(row);
//     }).catch((error) => {
//         console.log(error);
//     })
// });

// Set up a map of rooms to selected cards
let roomData = {};
/* roomId: {
    clues: {
        cluer: String, clue: String
    }, 
    guesser: String, 
    cluers: [String],
    wordToGuess: String
    }
*/
// Handle different socket connections
io.on('connection', (socket) => {
    console.log('A user has connected');

    socket.on('join room', async (room) => {
        // TODO: call db.getRoom and only the join the room if the room exists.
        console.log(`${socket.id} joined room ${room}`);
        await joinRoom(socket.id, room);
        // Add the clues to the map of clues
        if (!roomData[room]) {
            roomData[room] = {};
            roomData[room]['clues'] = {};
            // you are the first person, so you are the guesser (for now)
            roomData[room]['guesser'] = socket.id;
            roomData[room]['cluers'] = [];
            // get a word from the database
            roomData[room]['wordToGuess'] = db.getWord();
            socket.to(room).emit('game state', GameState.LOADING_PLAYERS);
        } else {
            // if the room already exists, you are a cluer
            roomData[room]['cluers'].push(socket.id);    
        }
        socket.to(room).emit('room state', roomData[room]);
    });

    // Handle clue send from clients
    socket.on('clue', (clue, room) => {
        console.log(`User clue ${clue} in room ${room}`);
        roomData[room]['clues'][socket.id] = clue;
        // clue submitted by a cluer
        socket.to(room).emit('clue submitted', socket.id, clue);
        sendCluers(socket, room);
    });

    // Handle socket disconnections
    socket.on('disconnecting', function () {
        var self = this;
        var rooms = Object.keys(self.rooms);
        // TODO: update roomData to remove the disconnected user 
        // and select a new guesser if the current guesser has disconnected

        rooms.forEach(function (room) {
            roomData[room]['clues'][self.id] = null;
            if (roomData[room]['guesser'] === self.id) {
                // the next cluer becomes the guesser
                roomData[room]['guesser'] = roomData[room]['cluers'][0];
            }
            self.to(room).emit('user left', self.id);
            self.to(room).emit('room state', roomData[room]);
        });
        console.log('A user has disconnected');
        socket.leaveAll();
    });
});

/* START SOCKET HELPER FUNCTIONS */

// have the requesting socket join the correct room and leave all other rooms
const joinRoom = async (socketId, room) => {
    const sockets = await io.fetchSockets();
    sockets.find(socket => {
        if (socket.id == socketId) {
            io.sockets.adapter.rooms.forEach((val, key) => {
                if (key !== room) {
                    socket.leave(key);
                }
            });
            socket.join(room);
        }
    });
}

// emit to the rest of the sockets only if all the cluers are ready. 
// or if you run out of time 
const sendCluers = (socket, room) => {
    const clues = roomData[room]['clues'];
    const numPlayers = io.sockets.adapter.rooms.get(room).size;
    if (Object.keys(clues).length === numPlayers - 1) {
        // Emit the updated array of selected cards to all connected clients
        socket.to(room).emit('game state', GameState.REVEAL_CLUES);
        // we need to emit it to a specific room 
        // changed from io.to() to socket.to(); 
        console.log('All cluers are ready');
        // broadcast to the room the room state 
        socket.to(room).emit('room state', roomData[room]);
    }
}

/* END SOCKET HELPER FUNCTIONS */

// Start the server
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});