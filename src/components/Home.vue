<template>
    <div class="home">

        <h2>Welcome to the Just One game!</h2>
        <p class="about">In this game, we require 3 or more players. Players take turns being the sole guesser of a secret word, of which the other players, called cluers, know about.</p>
        <p class="about">Each cluer will write just one word to help the guesser guess the secret word. The guesser will then try to guess the word based on their other word clues.</p>
        <p class="about">It's pretty simple! The <i><u>catch</u></i> is that if two or more cluers give the same clue, the guesser will not be able to see those clues! Try to be more unique about your clue.</p>
        <hr class="about" />
        <footer>
            The purpose of making this game was to learn about Vue.js, Vue Router, and Socket.IO. 
            I got started with ChatGPT; it was hard to keep making changes that could expand well.
            If you have any questions, feel free to reach out to me at irenelfeng[at]gmail. 
        </footer>
    </div>
</template>
<style>
.home {
    margin: 2rem auto;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    height: 800px;
    justify-items: flex-start;
}
.about {
    margin: 1rem 0;
}
footer {
    justify-self: flex-end;
}
</style>