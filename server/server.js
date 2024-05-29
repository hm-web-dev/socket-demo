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
        allowedOrigins: [
            "http://localhost:5173",
            "msfeng.local"
        ],
        // origin: "*", // allow all origins 
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
        cluer: clue
    }, 
    guesser: String, 
    cluers: [String],
    socketsToNames: {String socketId: String name},
    wordToGuess: String
    win: Boolean
    }
*/
// Handle different socket connections
io.on('connection', (socket) => {
    console.log('A user has connected');

    // 1. Join a room 
    socket.on('join room', async (room, name) => {
        // TODO: call db.getRoom and only the join the room if the room exists.
        console.log(`${socket.id} joined room ${room}`);
        await joinRoom(socket.id, room);
        // Add the clues to the map of clues

        if (!roomData[room] || Object.keys(roomData[room]).length === 0) {
            roomData[room] = {};
            roomData[room]['clues'] = {};
            // you are the first person, so you are the guesser (for now)
            roomData[room]['guesser'] = socket.id;
            roomData[room]['cluers'] = [];

            // get a word from the database
            roomData[room]['wordToGuess'] = db.getWord();
            roomData[room]['win'] = false;
            socket.to(room).emit('game state', GameState.LOADING_PLAYERS);
            roomData[room]['socketsToNames'] = {};
        } else {
            // if the room already exists, you are a cluer
            roomData[room]['cluers'].push(socket.id);
            // roomData[room]['socketsToNames'].set(
            //     socket.id, name
            // );
        }
        roomData[room]['socketsToNames'][socket.id] = name;
        socket.to(room).emit('room state', roomData[room]);
    });

    // 1.5 Move onto writing clues when ready to play
    socket.on('start round', (room) => {
        console.log(`Starting round in room ${room}`);
        resetCluesAndWord(socket, room);
    });

    // 2. Handle the cluer clue-giving
    socket.on('clue', (clue, room) => {
        console.log(`User clue ${clue} in room ${room}`);
        roomData[room]['clues'][socket.id] = clue;
        // clue submitted by a cluer
        socket.to(room).emit('clue submitted', socket.id, clue);
        sendCluers(socket, room);
    });

    // 3. Handle the guesser guesses 
    socket.on('guess', (guess, room) => {
        console.log(`User guessed '${guess}' in room ${room}`);
        socket.to(room).emit('guesser guessed', guess);
        if (guess === roomData[room]['wordToGuess']) {
            // the guesser guessed the word correctly
            roomData[room]['win'] = true;
            socket.to(room).emit('game state', GameState.ROUND_END);
            socket.to(room).emit('room state', roomData[room]);
        }
    });

    // 3.5 Handle gives up
    socket.on('give up', (room) => {
        console.log(`User gave up in room ${room}`);
        socket.to(room).emit('game state', GameState.ROUND_END);
    });

    // 4. Handle the next round 
    socket.on('next round', (room) => {
        // TODO: only allow to start the next round if the game state is ROUND_END
        // I don't have this as a part of the roomData but I should.
        console.log(`Starting next round in room ${room}`);
        // rotate guesser
        const guesser = roomData[room]['cluers'].shift();
        roomData[room]['cluers'].push(roomData[room]['guesser']);
        roomData[room]['guesser'] = guesser;
        // reset the clues
        resetCluesAndWord(socket, room);
    });

    // Handle socket disconnections
    socket.on('disconnecting', function () {
        var self = this;

        var rooms = self.rooms;
        console.log('A user has disconnected.');

        rooms.forEach(function (room) {
            // update roomData to remove the disconnected user 
            // and select a new guesser if the current guesser has disconnected
            if (!roomData[room] || Object.keys(roomData[room]).length === 0) {
                return;
            }
            if (roomData[room]['guesser'] === self.id) {
                console.log("guesser left");
                // the next cluer becomes the guesser
                if (roomData[room]['cluers'].length == 0) {
                    // if the guesser leaves, reset the room
                    roomData[room] = {};
                    return;
                }
                roomData[room]['guesser'] = roomData[room]['cluers'][0];
                // remove cluer 
                removeCluer(room, roomData[room]['cluers'][0]);
            } else {
                // the disconnected user was a cluer. remove clues and cluer
                delete roomData[room]['clues'][self.id];
                removeCluer(room, self.id);
            }
            self.to(room).emit('user left', self.id);
            self.to(room).emit('room state', roomData[room]);
        });
        socket.leaveAll();
    });
});

const removeCluer = (room, cluer) => {
    const index = roomData[room]['cluers'].indexOf(cluer);
    if (index > -1) {
        roomData[room]['cluers'].splice(index, 1);
    }
    delete roomData[room]['socketsToNames'][cluer];
}
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

const resetCluesAndWord = (socket, room) => {
    roomData[room]['clues'] = {};
    roomData[room]['wordToGuess'] = db.getWord(); // new word
    roomData[room]['win'] = false;
    // start the next round
    socket.to(room).emit('game state', GameState.WRITE_CLUES);
    // broadcast to the room the room state 
    socket.to(room).emit('room state', roomData[room]);
}

// emit to the rest of the sockets only if all the cluers are ready. 
// or if you run out of time 
const sendCluers = (socket, room) => {
    const clues = roomData[room]['clues'];
    const numPlayers = io.sockets.adapter.rooms.get(room).size;
    // we need to emit it to a specific room 
    // changed from io.to() to socket.to(); 
    // broadcast to the room the room state 
    socket.to(room).emit('room state', roomData[room]);
    if (Object.keys(clues).length === numPlayers - 1) {
        // Emit the updated array of selected cards to all connected clients
        socket.to(room).emit('game state', GameState.REVEAL_CLUES);
        // emit new game state 2 seconds after 
        setTimeout(() => {
            socket.to(room).emit('game state', GameState.GUESS);
        }, 2000);
    }
}

/* END SOCKET HELPER FUNCTIONS */

// Start the server
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});