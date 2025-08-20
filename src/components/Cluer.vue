<script>
import { GameState, cluesMarkDupes } from '../utils'

export default {
    props: {
        gameState: GameState,
        socket: Object,
        roomState: {
            clues: Object,
            guesser: String,
            players: Array,
            wordToGuess: String,
            win: Boolean,
            socketsToNames: Map,
        },
    },
    data() {
        return {
            clue: ''
        }
    },
    computed: {
        GameState() {
            return GameState;
        }, // can read object GameState for HTML template
        submittedClues() {
            console.log(cluesMarkDupes(this.roomState.clues))
            return cluesMarkDupes(this.roomState.clues);
        }
    },
    created() {
        this.socket.on('guesser guessed', (guess) => {
            // TODO: remove toast. why is this showing up on other components? 
            console.log(guess);
            let pop = this.$toast.open(
                {
                    message: `Guesser guessed ${guess}`,
                    type: "info",
                    position: 'top',
                    duration: 1000 * 2,
                    dismissible: true
                });
        })
    },
    methods: {
        sendMessage() {
            this.socket.emit('clue', this.clue, this.$route.params.id);
        }
    }

}
</script>

<template>
    <div>
        <h1>Cluer</h1>
        <div v-if="gameState == GameState.LOADING_PLAYERS">
            <h2>Waiting for players...</h2>
        </div>
        <div v-else>
            <h2>The word is {{ roomState.wordToGuess }}</h2>
            <div v-if="gameState == GameState.WRITE_CLUES">
                <input type="text" v-model="clue" />
                <button @click="sendMessage">Send Clue</button>
                <p> {{ Object.keys(roomState.clues).length }} clues submitted... </p>
            </div>
            <div v-else-if="new Set([GameState.REVEAL_CLUES, GameState.GUESS, GameState.ROUND_END]).has(gameState)">
                <p>All clues:</p>
                <ul>
                    <li v-for="c in submittedClues" :key="c" :class="c.isDupe ? 'dupe' : null">
                        Cluer: {{ roomState.socketsToNames[c.cluer] }}, Clue: {{ c.clue }}
                    </li>
                </ul>
                <div v-if="gameState == GameState.GUESS">
                    <h2>Guesser is guessing...</h2>
                </div>
                <div v-else-if="gameState == GameState.ROUND_END">
                    <h2>Round over!</h2>
                    <h2 v-if="roomState.win">Nice job!</h2>
                    <h2 v-else>Better luck next time!</h2>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.dupe {
    color: red;
}
</style>