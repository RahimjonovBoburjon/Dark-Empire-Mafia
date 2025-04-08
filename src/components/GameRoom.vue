<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Game Header -->
      <header class="mb-8 flex items-center justify-between">
        <div>
          <a href="/">
            <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-800">
              Dark Empire: Mafia
            </h1>
          </a>
          <p class="text-gray-400">Game Room: {{ gameId }}</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
            <span class="text-gray-400">Phase:</span>
            <span class="ml-2 font-semibold text-red-500">{{ game.phase }}</span>
          </div>
          <div class="bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
            <span class="text-gray-400">Players:</span>
            <span class="ml-2 font-semibold">{{ game.players.length }}/{{ game.maxPlayers }}</span>
          </div>
        </div>
      </header>

      <!-- Main Game Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Player List -->
        <div class="lg:col-span-1">
          <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl">
            <h2 class="text-xl font-semibold mb-4 flex items-center">
              <span class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">👥</span>
              Players
            </h2>
            <div class="space-y-3">
              <div v-for="player in game.players" :key="player.id"
                class="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-300">
                <div class="flex items-center">
                  <div class="w-2 h-2 rounded-full mr-3" :class="{
                    'bg-green-500': player.isAlive,
                    'bg-red-500': !player.isAlive
                  }"></div>
                  <span class="font-medium">{{ player.name }}</span>
                </div>
                <span v-if="player.role" class="text-sm px-2 py-1 rounded bg-gray-600">
                  {{ player.role }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Actions -->
        <div class="lg:col-span-2">
          <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl mb-8">
            <h2 class="text-xl font-semibold mb-4 flex items-center">
              <span class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">⚔️</span>
              Game Actions
            </h2>
            <div class="space-y-4">
              <!-- Day Phase Actions -->
              <div v-if="game.phase === 'day'" class="space-y-4">
                <div class="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                  <h3 class="font-semibold mb-2">Vote to Eliminate</h3>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button v-for="player in alivePlayers" :key="player.id" @click="vote(player.id)"
                      class="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-all duration-300"
                      :class="{ 'ring-2 ring-red-500': currentVote === player.id }">
                      {{ player.name }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Night Phase Actions -->
              <div v-if="game.phase === 'night'" class="space-y-4">
                <div v-if="currentPlayer.role === 'mafia'" class="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                  <h3 class="font-semibold mb-2">Choose Target</h3>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button v-for="player in alivePlayers" :key="player.id" @click="mafiaAction(player.id)"
                      class="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-all duration-300"
                      :class="{ 'ring-2 ring-red-500': mafiaTarget === player.id }">
                      {{ player.name }}
                    </button>
                  </div>
                </div>

                <div v-if="currentPlayer.role === 'doctor'"
                  class="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                  <h3 class="font-semibold mb-2">Choose to Protect</h3>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button v-for="player in alivePlayers" :key="player.id" @click="doctorAction(player.id)"
                      class="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-all duration-300"
                      :class="{ 'ring-2 ring-green-500': doctorTarget === player.id }">
                      {{ player.name }}
                    </button>
                  </div>
                </div>

                <div v-if="currentPlayer.role === 'detective'"
                  class="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                  <h3 class="font-semibold mb-2">Investigate Player</h3>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button v-for="player in alivePlayers" :key="player.id" @click="detectiveAction(player.id)"
                      class="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-all duration-300"
                      :class="{ 'ring-2 ring-blue-500': detectiveTarget === player.id }">
                      {{ player.name }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Area -->
          <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl h-[500px]">
            <h2 class="text-xl font-semibold mb-4 flex items-center">
              <span class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">💬</span>
              Game Chat
            </h2>
            <GameChat :game-id="gameId" :current-player="currentPlayer" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebase/config';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import GameChat from './GameChat.vue';

const route = useRoute();
const gameId = route.params.id;
const game = ref({ players: [], phase: 'lobby' });
const currentPlayer = ref(null);
const currentVote = ref(null);
const mafiaTarget = ref(null);
const doctorTarget = ref(null);
const detectiveTarget = ref(null);
const messages = ref([]);
const newMessage = ref('');
const mafiaTargets = ref({});

let unsubscribe = null;

const alivePlayers = computed(() => {
  return game.value.players.filter(p => p.isAlive);
});

const vote = async (playerId) => {
  currentVote.value = playerId;
  // Implement voting logic
};

const mafiaAction = async (playerId) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (gameDoc.exists()) {
      const game = gameDoc.data();
      const currentMafia = game.players.filter(p => p.role === 'mafia' && p.isAlive);
      
      // If this is the first mafia to choose
      if (!mafiaTargets.value[playerId]) {
        mafiaTargets.value[playerId] = currentPlayer.value.id;
        
        // If all mafia have chosen
        if (Object.keys(mafiaTargets.value).length === currentMafia.length) {
          // Get unique targets
          const uniqueTargets = [...new Set(Object.values(mafiaTargets.value))];
          
          // If all mafia chose the same target
          if (uniqueTargets.length === 1) {
            await killPlayer(uniqueTargets[0]);
          } else {
            // Randomly select one of the targets
            const randomTarget = uniqueTargets[Math.floor(Math.random() * uniqueTargets.length)];
            await killPlayer(randomTarget);
          }
          
          // Clear mafia targets
          mafiaTargets.value = {};
        }
      }
    }
  } catch (error) {
    console.error('Error in mafia action:', error);
  }
};

const killPlayer = async (playerId) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (gameDoc.exists()) {
      const game = gameDoc.data();
      const updatedPlayers = game.players.map(player => {
        if (player.id === playerId) {
          return { ...player, isAlive: false };
        }
        return player;
      });
      
      await updateDoc(gameRef, {
        players: updatedPlayers,
        lastNightAction: {
          type: 'kill',
          target: playerId,
          timestamp: new Date()
        }
      });
    }
  } catch (error) {
    console.error('Error killing player:', error);
  }
};

const doctorAction = async (playerId) => {
  doctorTarget.value = playerId;
  // Implement doctor action logic
};

const detectiveAction = async (playerId) => {
  detectiveTarget.value = playerId;
  // Implement detective action logic
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  const message = {
    id: Date.now().toString(),
    sender: currentPlayer.value.name,
    content: newMessage.value,
    timestamp: new Date().toLocaleTimeString(),
    type: 'player'
  };

  messages.value.push(message);
  newMessage.value = '';
};

onMounted(() => {
  const gameRef = doc(db, 'games', gameId);
  unsubscribe = onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      game.value = doc.data();
      currentPlayer.value = game.value.players.find(p => p.id === localStorage.getItem('playerId'));
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>