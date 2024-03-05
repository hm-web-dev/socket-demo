/* THIS IS FROM THE SERVER. IF YOU MAKE A CHANGE TO THIS CONSTANT, 
PLEASE UPDATE GameState in server/constants.js */
const GameState = Object.freeze({ 
    LOADING_PLAYERS: 0, 
    WRITE_CLUES: 1, 
    REVEAL_CLUES: 2, 
    GUESS: 3,
    ROUND_END: 4
}); 

export default GameState;