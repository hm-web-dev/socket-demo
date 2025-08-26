<!-- 
    Players Component, this component will be used to display the list of players
    In the room
-->

<script>
import { GameState } from '../utils'

const PLAYER_STATES = {
    CLUER: 'cluer',
    GUESSER: 'guesser',
    CLUER_WRITING: 'cluer-writing',
    CLUER_WRITING_DONE: 'cluer-writing-done',
}
export default {
    props: {
        gameState: GameState,
        socket: Object,
        roomState: {
            clues: Object,
            guesser: String,
            players: Array,
            wordToGuess: String, 
            socketsToNames: Object, // maybe use map instead 
        },
    },
    watch: {
        roomState: {
            handler(to, from) {
                console.log("room state changed");
                this.updateEmojis(to);
            },
            deep: true
        }
    },
    data() {
        return {
            // playerStates: { 'socketId': PLAYER_STATES }
            playerStates: {}
            // TODO: make this a computed property instead, it is cleaner
        }
    },
    created() {
        this.updateEmojis(this.roomState);
        this.createListens();
    },
    methods: {
        updateEmojis(to) {
            // not really sure if I like this flow.
            if (this.gameState === GameState.ROUND_END) {
                this.playerStates = {};
                return;
            }
            this.playerStates = to.players.reduce((acc, player) => {
                console.log("this player is a " + player);
                console.log(to.socketsToNames);
                if (player === to.guesser) {
                    acc[player] = PLAYER_STATES.GUESSER;
                } else {
                    // check if already done and don't change things 
                    // because the socket will take care of changing to writing_done
                    // TODO: LOGIC BUG, need to fix in a second
                    if (this.playerStates[player] && this.gameState === GameState.WRITE_CLUES) {
                        acc[player] = this.playerStates[player]; // either writing or writing done
                        return acc;
                    }
                    acc[player] = (this.gameState === GameState.LOADING_PLAYERS) ? PLAYER_STATES.CLUER
                        : PLAYER_STATES.CLUER_WRITING;

                }
                return acc;
            }, {});
        },
        createListens() {
            // computed props can't listen to the clue submitted event:
            // instead once the clues change we can get the cluer to write 
            this.socket.on('clue submitted', (socketId, _clue) => {
                console.log("clue submitted: " + _clue);
                this.playerStates[socketId] = PLAYER_STATES.CLUER_WRITING_DONE;
            });
            // TODO: do something with user leaving the room: socket event 'user left'

        }
    }
}
</script>

<template>
    <div>
        <h1>Players</h1>
        <ul>
            <li v-for="player in roomState.players" :key="player"
                :class="[playerStates[player], this.socket.id == player ? 'you' : '']">{{ roomState.socketsToNames[player] ?? player }} / {{
                playerStates[player] }}</li>
        </ul>
    </div>
</template>

<style scoped>
ul {
    list-style: none;
}

li {
    margin: 0.5rem;
}

li.you {
    font-weight: bold;
}

li::before {
    content: '👤';
    margin-right: 0.5rem;
}

li.guesser::before {
    content: '🔍';
}

li.cluer::before {
    content: '📝';
}

li.cluer-writing::before {
    content: '✏️';
}

li.cluer-writing-done::before {
    content: '✅';
}
</style>