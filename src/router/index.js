import { createRouter, createWebHistory } from 'vue-router';
import Lobby from '../components/Lobby.vue';
import GameRoom from '../components/GameRoom.vue';

const routes = [
  {
    path: '/',
    name: 'Lobby',
    component: Lobby
  },
  {
    path: '/game/:id',
    name: 'GameRoom',
    component: GameRoom,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 