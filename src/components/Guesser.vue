<script>
import { GameState, cluesDupesRedacted } from '../utils'

export default {
    props: {
        gameState: GameState,
        socket: Object,
        roomState: {
            clues: Object,
            guesser: String,
            players: Array,
            wordToGuess: String,
            win: Boolean
        },
    },
    data() {
        return {
            guess: '',
            guesses: [],
        }
    },
    computed: {
        GameState() {
            return GameState;
        },
        submittedClues() {
            console.log(cluesDupesRedacted(this.roomState.clues))
            return cluesDupesRedacted(this.roomState.clues);
        }
    },
    methods: {
        writeGuess() {
            this.socket.emit('guess', this.guess, this.$route.params.id);
            if (this.guess == this.roomState.wordToGuess) {
                // yay! 
                this.roomState.win = true;
            } else {
                // try again 
                // this is so ugly, but that's alright. 
                let instance = this.$toast.open(
                    {
                        message: `Sorry, ${this.guess} is not correct`,
                        type: "error",
                        position: 'top',
                        duration: 1000 * 2,
                        dismissible: true
                    });

                this.guesses.push(this.guess);
                this.socket.emit('guess', this.guess, this.$route.params.id);
                this.guess = '';
            }
        },
        nextRound() {
            this.socket.emit('next round', this.$route.params.id);
        },
        giveUp() {
            this.socket.emit('give up', this.$route.params.id);
        }
    }

}
</script>


<template>
    <div>

        <h1>Guesser!</h1>
        <div v-if="gameState === GameState.WRITE_CLUES">
            <h1>Waiting for other players to submit clues</h1>
        </div>
        <div v-else-if="gameState === GameState.REVEAL_CLUES">
            <!-- TODO: show some kind of animation -->
        </div>
        <div v-else-if="gameState === GameState.GUESS">
            <h1>Clues</h1>
            <ul>
                <li v-for="c in submittedClues" :key="c">Cluer: {{ c.cluer }}, Clue: {{ c.clue }}</li>
            </ul>
            <h1>Write your guess</h1>
            <input type="text" v-model="guess" />
            <button @click="writeGuess">Submit Guess</button>
            <button @click="giveUp">Give up</button>
            <h1 v-if="guesses.length > 0">Previous guesses</h1>
            <ul>
                <li v-for="g in guesses" :key="g">{{ g }}</li>
            </ul>
        </div>
        <div v-else-if="gameState === GameState.ROUND_END">
            <h1>Round end</h1>
            <h2>Word was: {{ roomState.wordToGuess }}</h2>
            <h2 v-if="roomState.win">It took you {{ guesses.length + 1 }} guesses!</h2>
            <h2 v-else>Sorry, try again!</h2>
            <button @click="nextRound"> Next Round </button>
        </div>
    </div>
</template>