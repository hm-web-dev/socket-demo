<script>
import { io } from 'socket.io-client'
import Guesser from './Guesser.vue'
import Cluer from './Cluer.vue'
import Players from './Players.vue'
import { GameState } from '../utils'
import NotFound from './404.vue'

const URL = process.env.NODE_ENV === "production" ?
    "msfeng.local:3000" : "http://localhost:3000";

export default {
    data() {
        return {
            /* 
            clues: {
                cluer: clue
            }, 
            players: [String], // list of all socket ids
            guesser: String, 
            cluers: [String],
            socketsToNames: {String socketId: String name},
            wordToGuess: String
            win: Boolean
            }
            */
            roomState: {
                clues: {},
                guesser: '',
                players: [],
                wordToGuess: '',
                win: false,
                socketsToNames: {}, // TODO: make it a Map object instead, but server can't stringify data that well
            },
            socket: io(URL),
            socketId: '',
            name: '',
            changeNameModal: false,
            gameReady: false,
            roomExists: false,
            room: this.$route.params.id.toString(),
            gameState: GameState.LOADING_PLAYERS,
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
            this.room = this.$route.params.id.toString();
            this.checkRoom();
            this.createSockets();
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
        this.checkRoom();
        // create sockets
        this.createSockets();
        console.log("game ready:" + this.gameReady);
    },
    methods: {
        checkRoom() {
            // check if the room exists 
            fetch(`${URL}/rooms/${this.$route.params.id}`)
                .then(response => {
                    console.log(response);
                    if (response.ok) this.roomExists = true;
                    else {
                        console.error("Room does not exist");
                        this.roomExists = false;
                    }
                })
        },
        createSockets() {
            console.log('i am socket ' + this.socketId);

            this.socket.on("connect_error", (err) => {
                console.log(`connect_error due to ${err.message}`);
                this.gameReady = false;
            });
            this.socket.on("connect", (err) => {
                console.log("is this err? " + err);
                console.log('connected as ' + this.socket.id);
                this.socketId = this.socket.id;
                this.socket.emit('query game state', this.$route.params.id);
                this.changeNameModal = true;
                this.gameReady = true;
            });
            // Handle selected cards
            this.socket.on('room state', (stateData) => {
                this.roomState.clues = stateData['clues'];
                this.roomState.guesser = stateData['guesser'];
                this.roomState.wordToGuess = stateData['wordToGuess'];
                // use the object spread operator to copy array
                this.roomState.players = [...stateData['cluers'], stateData['guesser']];
                this.roomState.win = stateData['win'];
                console.log("socketsToNames");
                console.log(stateData);
                console.log(stateData['socketsToNames']);
                this.roomState.socketsToNames = stateData['socketsToNames'];


            });

            this.socket.on('game state', (gameState) => {
                if (gameState === null) {
                    return;
                }
                this.gameState = gameState;
                console.log('gameState is ' + gameState);
            });

        },
        rename() {
            this.changeNameModal = false;
            this.socket.emit('join room', this.$route.params.id, this.name);
        },
        playLogic() {
            // if the game is in progress, then the player can't join
            return ![GameState.LOADING_PLAYERS, GameState.ROUND_END].includes(this.gameState)
                && !this.roomState.players.includes(this.socketId);
        }
    },
    components: { Guesser, Cluer, Players, NotFound }
}
</script>

<template>
    <main class="main" v-if="roomExists && gameReady">
        <div v-if="playLogic()">
            Sorry, you cannot join this game. It is already in progress. Please refresh and try again
        </div>
        <div v-else>
            <div v-if="changeNameModal" class="modal">
                <div class="modal-content">

                    <p> Choose a name</p>
                    <input v-model="name">
                    <button class="close" @click="rename" :disabled="name == ''">Submit</button>
                </div>
            </div>
            <h1>Just One</h1>
            Room: {{ room }}
            <Guesser v-if="roomState.guesser === socketId" :gameState="gameState" :socket="socket"
                :roomState="roomState"></Guesser>
            <Cluer v-else :gameState="gameState" :socket="socket" :roomState="roomState"></Cluer>
        </div>
        <div>
            <Players :socket="socket" :gameState="gameState" :roomState="roomState"></Players>
        </div>

    </main>
    <div v-else-if="!roomExists">
        <NotFound></NotFound>
    </div>
    <div v-else>
        <h1>Just One</h1>
        <p>Server is down. Sorry!</p>
    </div>
</template>

<style>
.modal {
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    left: 0;
    top: 50%;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    background: var(--color-background-soft);
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
}

.close {
    color: #aaaaaa;
    font-weight: bold;
}

.close:hover,
.close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
}
</style>