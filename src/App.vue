<script>

</script>

<template>
  <div>

    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
    <router-link to="/home">Go to Home</router-link>
    <router-link to="/rooms/plfw9z">Go to room p</router-link>
    <router-link to="/rooms/7mjam7">Go to room 7</router-link>
  </div>
  <router-view />
  
</template>

<style scoped>


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
