// CHAT-GPT-generated!  

// Import required libraries
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Import the database functions
const db = require('./db');

// Create the express app and the server
const app = express();
const server = http.createServer(app);

// Create the socket server and attach it to the express server
const io = socketIO(server, {
    // have to add cors manually
    cors: {
        origin: ["http://127.0.0.1:5173", "http://localhost:5173"]
    }
});

// Serve a different room 
app.post('/createRoom', (req, res) => {
    // create an active room in database, will last for 1 hour
    db.createRoom(req, res);

});

// Serve a specific room 
app.get('/:room', async (req, res) => {
    // get the room from the database
    // if the room is still active, send the room data to the client
    // if the room is not active, send a 500 error
    // if the room does not exist, send a 404 error
    db.getRoom(req, res);
    const sockets = await io.fetchSockets();

    for (const socket of sockets) {
        console.log("socket");
        console.log(socket.id);
        // console.log(socket.handshake);
        console.log(socket.rooms); // they are in different rooms
        console.log(socket.data);

    }

});
// see if I can send the room data to the client
// Set up an array of available cards
console.log("does this work?")
const availableCards = ['Ace', 'King', 'Queen', 'Jack', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

// Set up an empty array to store selected cards
let selectedCards = [];
// Handle different socket connections
io.on('connection', (socket) => {
    console.log('A user has connected');

    // server emits the available cards to all connected clients
    socket.emit('available cards', availableCards);

    // Handle card selection from clients
    socket.on('card selected', (card) => {
        console.log(`User selected ${card}`);

        // Add the selected card to the array of selected cards
        selectedCards.push(card);

        // Emit the updated array of selected cards to all connected clients
        io.emit('selected cards', selectedCards);

        // emits only to others. not necessary
        socket.broadcast.emit('hi', { 'aKey': Math.random(5) });
    });

    // Handle socket disconnections
    socket.on('disconnect', () => {
        console.log('A user has disconnected');
    });
});
// Start the server
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});