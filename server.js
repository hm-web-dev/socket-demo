// CHAT-GPT-generated 

// Import required libraries
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

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

// Serve the client-side HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Set up an array of available cards
const availableCards = ['Ace', 'King', 'Queen', 'Jack', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

// Set up an empty array to store selected cards
let selectedCards = [];

// Handle socket connections

io.on('connection', (socket) => {
    console.log('A user has connected');

    // Emit the available cards to the connected client
    socket.emit('available cards', availableCards);

    // Handle card selection
    socket.on('card selected', (card) => {
        console.log(`User selected ${card}`);

        // Add the selected card to the array of selected cards
        selectedCards.push(card);

        // Emit the updated array of selected cards to all connected clients
        io.emit('selected cards', selectedCards);
        
        // emits to others 
        socket.broadcast.emit('hi', { 'aKey': Math.random(5)});
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