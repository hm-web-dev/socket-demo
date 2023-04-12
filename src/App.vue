<script>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import {io} from 'socket.io-client'    

const URL = process.env.NODE_ENV === "production" ? 
"http://msfeng.com:4000" : "http://localhost:3000";

export const socket = io(URL);

export default {
  data() {
    return {
      availableCards: [],
      selectedCard: '',
      selectedCards: [], 
      message: '',
    }
  },
  created() {
    // Handle available cards
    socket.on('available cards', (cards) => {
      this.availableCards = cards;
    });

    // Handle selected cards
    socket.on('selected cards', (cards) => {
      this.selectedCards = cards;
    });

    socket.on('hi', (val) => {
      this.message = val.aKey;
      console.log(val);
    })
  },
  methods: {
    selectCard() {
      socket.emit('card selected', this.selectedCard);
      this.selectedCard = '';
    }
  }
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <h1>Card Selector</h1>
    {{ message }}
    <p>Available cards:</p>
    <ul>
      <li v-for="card in availableCards" :key="card">{{ card }}</li>
    </ul>
    <p>Select a card:</p>
    <select v-model="selectedCard">
      <option v-for="card in availableCards" :key="card" :value="card">{{ card }}</option>
    </select>
    <button @click="selectCard">Select</button>
    <p>Selected cards:</p>
    <ul>
      <li v-for="card in selectedCards" :key="card">{{ card }}</li>
    </ul>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
