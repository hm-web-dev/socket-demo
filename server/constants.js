const GameState = Object.freeze({ 
    LOADING_PLAYERS: 0, 
    WRITE_CLUES: 1, 
    REVEAL_CLUES: 2, 
    GUESS: 3,
    ROUND_END: 4
}); 

module.exports = { GameState };