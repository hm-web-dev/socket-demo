<script>
import { io } from 'socket.io-client'
import Guesser from './Guesser.vue'
import Cluer from './Cluer.vue'
import Players from './Players.vue'
import { GameState } from '../utils'

const URL = process.env.NODE_ENV === "production" ?
    "http://msfeng.com:4000" : "http://localhost:3000";

export default {
    data() {
        return {
            /* 
            clues: {
                cluer: clue
            }, 
            guesser: String, 
            players: [String]
            wordToGuess: String
            win: Boolean
            }
            */
           roomState: {
               clues: {}, 
               guesser: '',
               players: [],
               wordToGuess: '', 
               win: false
           },
            socket: io(URL),
            socketId: '',
            room: this.$route.params.id.toString(),
            // TODO: should start at loading players but not in the mood right now
            gameState: GameState.WRITE_CLUES,
            // clues: {},
            // guesserSocket: '',
            // players: [],
            // wordToGuess: '',
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
                this.roomState.clues = stateData['clues'];
                this.roomState.guesser = stateData['guesser'];
                this.roomState.wordToGuess = stateData['wordToGuess'];
                // use the object spread operator to copy array
                this.roomState.players = [...stateData['cluers'], stateData['guesser']];
                this.roomState.win = stateData['win'];
                console.log(stateData['clues']);
                console.log(this.roomState['players']);
            });

            this.socket.on('game state', (gameState) => {
                this.gameState = gameState;
                console.log('gameState is ' + gameState);
            });

        }
    },
    components: { Guesser, Cluer, Players }
}
</script>

<template>
    <main class="main">
        <div>
            <h1>Just One</h1>
            
            Room: {{ room }}
            <Guesser v-if="roomState.guesser === socketId" 
            :gameState="gameState" :socket="socket" :roomState="roomState"
            ></Guesser>
            <Cluer v-else :gameState="gameState" :socket="socket" :roomState="roomState"></Cluer>
        </div>
        <div>
            <Players :socket="socket" :gameState="gameState" :roomState="roomState"></Players>
        </div>
    </main>
</template>