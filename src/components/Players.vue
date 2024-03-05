<!-- 
    Players Component, this component will be used to display the list of players
    In the room
-->

<script>
import GameState from '../utils'

const PLAYER_STATES = {
    CLUER: 'cluer',
    GUESSER: 'guesser',
    CLUER_WRITING: 'cluer-writing',
    CLUER_WRITING_DONE: 'cluer-writing-done',
}
export default {
    props: {
        gameState: GameState,
        players: Array,
        socket: Object,
        guesser: String,
    },
    watch: {
        players(to, from) {
            this.updateEmojis();
        },
    },
    data() {
        return {
            playerStates: {} // reduced below
        }
    },
    created() {
        this.updateEmojis();
        this.createListens();
    },
    methods: {
        updateEmojis() {
            this.playerStates = this.players.reduce((acc, player) => {
                if (player === this.guesser) {
                    acc[player] = PLAYER_STATES.GUESSER;
                } else {
                    // if writing or loading 
                    // also check if already done and don't change things 
                    if (this.playerStates[player]) {
                        acc[player] = this.playerStates[player];
                        return acc;
                    }
                    if (this.GameState === GameState.WRITE_CLUES)
                        acc[player] = PLAYER_STATES.CLUER_WRITING;
                    else acc[player] = PLAYER_STATES.CLUER;
                }
                return acc;
            }, {});
        }, 
        createListens() {
            this.socket.on('clue submitted', (socketId, clue) => {
                this.playerStates[socketId] = PLAYER_STATES.CLUER_WRITING_DONE;
            });
            console.log(this.playerStates);

        }
    }
}
</script>

<template>
    <div>
        <h1>Players</h1>
        <ul>
            <li v-for="player in players" :key="player" :class="playerStates[player]">{{ player }} / {{
                playerStates[player] }}</li>
        </ul>
    </div>
</template>

<style>
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