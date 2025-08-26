<script>
import { GameState, cluesMarkDupes } from '../utils'
import PreviousGuesses from './PreviousGuesses.vue';

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
            guesses: Array,
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
            console.log(guess);
        })
    },
    methods: {
        sendMessage() {
            this.socket.emit('clue', this.clue, this.$route.params.id);
        }
    }, 
    components: {
        PreviousGuesses
    }

}
</script>

<template>
    <div>
        <h1>Cluer</h1>
        <div v-if="gameState == GameState.LOADING_PLAYERS">
            <div class="centered-container">
                <h1 v-if="roomState.players.length < 3">Waiting for players</h1>
                <h2 v-else>Waiting for guesser to start the round...</h2>
                
                <div class="loader"></div>
            </div>
        </div>
        <div v-else>
            <h2>The word is <span class="highlight">{{ roomState.wordToGuess }}</span></h2>
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
                    <div class="loader"></div>
                    <PreviousGuesses :guesses="roomState.guesses" />
                </div>
                <div v-else-if="gameState == GameState.ROUND_END">
                    <h2>Round over!</h2>
                    <div v-if="roomState.win"><h2>Nice job! It took you {{ roomState.guesses.length + 1 }} guesses!</h2></div>
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

.highlight {
    color: var(--color-bright-green);
    font-weight: bold;
}
</style>