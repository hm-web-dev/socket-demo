const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

/* THIS IS FROM THE SERVER. IF YOU MAKE A CHANGE TO THIS CONSTANT, 
PLEASE UPDATE GameState in server/constants.js */
const GameState = Object.freeze({ 
    LOADING_PLAYERS: 0, 
    WRITE_CLUES: 1, 
    REVEAL_CLUES: 2, 
    GUESS: 3,
    ROUND_END: 4
}); 

// given map clues: {
   //  cluer: clue
// }, 
// return { cluer: String, clue: String, isDupe: Boolean}
const cluesMarkDupes = (clues) => {
    let clueSet = new Set();
    const clueObjects = [];
    for (const cluer in clues) {
        let o = new Object();
        o.cluer = cluer;
        o.clue = clues[cluer];
        // mark duplicate clues
        if (clueSet.has(clues[cluer])) {
            o.isDupe = true;
            // mark clueObjects with the same clue as a dupe
            clueObjects.forEach((clueObject) => {
                if (clueObject.clue === clues[cluer]) {
                    clueObject.isDupe = true;
                }
            });
        }
        else {
            clueSet.add(clues[cluer]);
            o.isDupe = false;
        }
        clueObjects.push(o);
    }
    console.log(clueObjects);
    return clueObjects;
}

// dupes removed for the guesser
const cluesDupesRedacted = (clues) => {
    const clueObjects = cluesMarkDupes(clues);
    return clueObjects.map((clueObject) => ({
        cluer: clueObject.cluer,
        clue: clueObject.isDupe ? '--REDACTED--' : clueObject.clue,
    }));
}

export { GameState, cluesMarkDupes, cluesDupesRedacted, SERVER_URL };