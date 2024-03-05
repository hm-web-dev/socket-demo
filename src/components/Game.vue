<script>
import { io } from 'socket.io-client'
import Guesser from './Guesser.vue'
import Cluer from './Cluer.vue'
import Players from './Players.vue'
import GameState from '../utils'

const URL = process.env.NODE_ENV === "production" ?
    "http://msfeng.com:4000" : "http://localhost:3000";

export default {
    data() {
        return {
            /* 
            clues: {
                cluer: String, clue: String
            }, 
            guesser: String, 
            players: [String]
            wordToGuess: String
            }
            */
            socket: io(URL),
            socketId: '',
            room: this.$route.params.id.toString(),
            // TODO: should start at loading players but not in the mood right now
            gameState: GameState.WRITE_CLUES,
            clues: {},
            guesserSocket: '',
            players: [],
            wordToGuess: '',
        }
    },
    watch: {
        $route(to, from) {
            // react to route changes...
            // this.socket.emit('join room', this.$route.params.id);
            this.createSockets();
            this.room = this.$route.params.id.toString();
        },
        socketId(to, from) {
            this.createSockets();
        },
        guesserSocket(to, from) {
            this.createSockets();
        },
        // clues(to, from) {
        //     this.createSockets();
        // }
    },
    created() {
        this.socket.emit('join room', this.$route.params.id);
        this.createSockets();
    },
    methods: {
        createSockets() {
            console.log('i am socket ' + this.socketId);

            this.socket.on("connect", () => {
                console.log('connected as ' + this.socket.id);
                this.socketId = this.socket.id;
            });
            // Handle selected cards
            this.socket.on('room state', (stateData) => {
                this.clues = stateData['clues'];
                this.guesserSocket = stateData['guesser'];
                // use the object spread operator to copy array
                this.players = [...stateData['cluers'], stateData['guesser']];
                console.log('server sent room state');
                console.log('guesser is: ' + this.guesserSocket);
            });

        }
    },
    components: { Guesser, Cluer, Players }
}
</script>

<template>
    <main>
        <h1>Just One</h1>

        Room: {{ room }}
        <Guesser v-if="guesserSocket === socketId" :socket="socket"></Guesser>
        <Cluer v-else :socket="socket" :clues="clues" :gameState="gameState"></Cluer>
    </main>
    <div>
        <Players :players="players" :socket="socket" :gameState="gameState" :guesser="guesserSocket"></Players>
    </div>
</template>