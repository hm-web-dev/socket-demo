<script>
import GameState from '../utils'

export default {
    props: {
        clues: Array,
        socket: Object, 
        GameState: GameState,
    },
    data() {
        return {
            clue: ''
        }
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
        <input type="text" v-model="clue" />
        <button @click="sendMessage">Send Clue</button>
        <p>Selected clues:</p>
        <ul>
            <li v-for="clue in clues" :key="clue">{{ clue }}</li>
        </ul>
    </div>
</template>