<script>
export default {
    props: {
        guesses: Array,
    },
}

</script>

<template>
    <div class="well-small" v-if="guesses.length > 0">
        <h1>Previous Guesses</h1>
        <ul>
            <li v-for="(guess, index) in [...guesses].reverse()" :key="guess">{{ guess }}
                <span v-if="index !== Object.keys(guesses).length - 1">, </span>
            </li>
        </ul>
    </div>
</template>

<style scoped>
ul {
    list-style: none;
    line-height: 1;
    padding-left: 0;
    text-align: left;
}

li {
    display: inline;
}
</style>