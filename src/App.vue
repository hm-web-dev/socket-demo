<script>

</script>

<template>
  <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
  <div class="navigation">

    <router-link to="/home">Go to Home</router-link>
    <router-link to="/new-room">Join / Create Room</router-link>
  </div>
  <router-view />

</template>

<style scoped>
.navigation {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 1rem 0;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {

  .logo {
    margin: 0 2rem 0 0;
  }
}
</style>
