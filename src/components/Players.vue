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
            wordToGuess: String
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
            console.log(to);
            this.playerStates = to.players.reduce((acc, player) => {
                console.log("this player is a " + player);
                if (player === to.guesser) {
                    acc[player] = PLAYER_STATES.GUESSER;
                } else {
                    // if writing or loading 
                    // also check if already done and don't change things 
                    if (this.playerStates[player]) {
                        acc[player] = this.playerStates[player];
                        return acc;
                    }
                    if (this.gameState === GameState.WRITE_CLUES)
                        acc[player] = PLAYER_STATES.CLUER_WRITING;
                    else acc[player] = PLAYER_STATES.CLUER;
                }
                return acc;
            }, {});
        },
        createListens() {
            // computed props can't listen to the clue submitted event:
            // instead once the clues change we can get the cluer to write 
            this.socket.on('clue submitted', (socketId, _clue) => {
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
            <li v-for="player in roomState.players" :key="player" :class="playerStates[player]">{{ player }} / {{
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