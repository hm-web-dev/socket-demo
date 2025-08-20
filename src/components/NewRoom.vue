<script>
const API_URL = 'http://localhost:3000'; // TODO: change this to production URL

export default {
    data() {
        return {
            roomCode: '',
            createdRoom: false,
            toastShow: false,
            errorMessage: ''
        }
    },
    methods: {

        createRoom() {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            fetch(API_URL + '/createRoom', options).then(response =>
                response.json())
                .then(data => {
                    if (data.error) {
                        throw new Error(data.error);
                    }
                    this.createdRoom = true;
                    this.roomCode = data.code;
                })
                .catch(error => {
                    this.errorMessage = error;
                    setTimeout(() => {
                        this.errorMessage = '';
                    }, 2000); // hide the toast after 2 seconds
                    console.error('Error creating room:', error);
                });
        },
        joinRoom() {
            if (this.roomCode.length === 6) {
                this.$router.push({ path: `/rooms/${this.roomCode}` });
            } else {
                this.errorMessage = 'Room code must be 6 characters long';
                setTimeout(() => {
                    this.errorMessage = '';
                }, 4000); // hide the toast after 2 seconds
            }
        },
        copyLink() {
            const link = `${window.location.origin}/#/rooms/${this.roomCode}`;
            navigator.clipboard.writeText(link).then(() => {
                this.toastShow = true;
                setTimeout(() => {
                    this.toastShow = false;
                }, 4000); // hide the toast after 2 seconds
            }).catch(err => {
                console.error('Failed to copy link: ', err);
            });
        }
    }
}
</script>
<template>
    <!-- this is a component where you have a button on the left to create a new room, and then navigates you to the room (also you can copy the link)
 and an input box on the right to join a room with a code -->
    <div class="new-room">
        <div v-if="errorMessage" class="toast" :class="{ 'show': errorMessage }">There was an error creating a
            room: {{ errorMessage }}
        </div>
        <div class="section">
            <div class="create-room">
                <button @click="createRoom">Create New Room</button>
                <div v-if="createdRoom">
                    <p>Room created! Click this link to go (copy to share):</p>
                    <router-link :to="{ name: 'Rooms', params: { id: roomCode } }">/rooms/{{ roomCode }}</router-link>
                    <img @click="copyLink" alt="Vue logo" class="copy" src="../assets/copyclipboard.svg" width="24"
                        height="24" />
                    <div class="toast" :class="{ 'show': toastShow }">Link copied to clipboard!</div>
                </div>
            </div>
        </div>

        <div class="divider"></div>
        <div class="section">
            <div class="join-room">
                <input v-model="roomCode" placeholder="Enter room code" />
                <button @click="joinRoom">Join Room</button>
            </div>
        </div>
    </div>
</template>
<style>
.new-room {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 2rem;
    justify-content: space-around;
    height: 500px;
}

.section {
    margin: 0 2rem;
}

.divider {
    height: 500px;
    border-left: 6px solid var(--highlight-color);
    position: absolute;
    top: 0;
}

.copy {
    cursor: pointer;
    margin-left: 0.5rem;
    background-color: var(--highlight-color);
    border-radius: 50%;
}

.toast {
    visibility: hidden;
    width: 20%;
    text-align: center;
    border-radius: 5px;
    padding: 10px;
    position: absolute;
    top: 50%;
    left: 40%;
    align-self:center;
    z-index: 1;
    background-color: var(--color-background-soft);
    opacity: 0;
    transition: opacity 1s, visibility 1s;
}


.toast.show {
    visibility: visible;
    opacity: 1;
}
</style>