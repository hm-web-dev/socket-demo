import { createApp } from 'vue'
import App from './App.vue'
import * as VueRouter from 'vue-router'
import Game from './components/Game.vue'
import './assets/main.css'

// 1. Define route components.
// These can be imported from other files
// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/home', component: null },
  { path: '/rooms/:id', component: Game },
  
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = VueRouter.createRouter({
  // 4. Provide the history implementation to use. We
  // are using the hash history for simplicity here.
  history: VueRouter.createWebHashHistory(),
  routes, // short for `routes: routes`
})

createApp(App).use(router).mount('#app')

