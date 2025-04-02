<template>
  <div class="min-h-screen bg-gray-900 text-white p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Game Header -->
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-center">VueMafia</h1>
        <div class="flex justify-between items-center mt-4">
          <div class="text-xl">Room: {{ roomId }}</div>
          <div class="text-xl">Phase: {{ gamePhase }}</div>
        </div>
      </header>

      <!-- Game Content -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Players List -->
        <div class="bg-gray-800 p-4 rounded-lg">
          <h2 class="text-2xl font-semibold mb-4">Players</h2>
          <div class="space-y-2">
            <div v-for="player in players" :key="player.id" 
                 class="flex items-center justify-between p-2 bg-gray-700 rounded">
              <span>{{ player.name }}</span>
              <span v-if="player.isAlive" class="text-green-500">Alive</span>
              <span v-else class="text-red-500">Dead</span>
            </div>
          </div>
        </div>

        <!-- Game Actions -->
        <div class="bg-gray-800 p-4 rounded-lg">
          <h2 class="text-2xl font-semibold mb-4">Actions</h2>
          <div v-if="isDayPhase" class="space-y-4">
            <h3 class="text-xl">Day Phase - Vote to Eliminate</h3>
            <div class="space-y-2">
              <button v-for="player in alivePlayers" :key="player.id"
                      @click="voteToEliminate(player.id)"
                      class="w-full p-2 bg-red-600 hover:bg-red-700 rounded">
                Vote to eliminate {{ player.name }}
              </button>
            </div>
          </div>
          <div v-else class="space-y-4">
            <h3 class="text-xl">Night Phase</h3>
            <div v-if="isMafia" class="space-y-2">
              <h4 class="text-lg">Mafia Action</h4>
              <button v-for="player in alivePlayers" :key="player.id"
                      @click="mafiaKill(player.id)"
                      class="w-full p-2 bg-red-600 hover:bg-red-700 rounded">
                Kill {{ player.name }}
              </button>
            </div>
            <div v-if="isDoctor" class="space-y-2">
              <h4 class="text-lg">Doctor Action</h4>
              <button v-for="player in alivePlayers" :key="player.id"
                      @click="doctorSave(player.id)"
                      class="w-full p-2 bg-green-600 hover:bg-green-700 rounded">
                Save {{ player.name }}
              </button>
            </div>
            <div v-if="isDetective" class="space-y-2">
              <h4 class="text-lg">Detective Action</h4>
              <button v-for="player in alivePlayers" :key="player.id"
                      @click="detectiveCheck(player.id)"
                      class="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded">
                Check {{ player.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Chat -->
        <div class="bg-gray-800 p-4 rounded-lg">
          <h2 class="text-2xl font-semibold mb-4">Chat</h2>
          <div class="h-96 overflow-y-auto mb-4">
            <div v-for="message in messages" :key="message.id" class="mb-2">
              <span class="font-semibold">{{ message.sender }}:</span>
              <span>{{ message.text }}</span>
            </div>
          </div>
          <div class="flex">
            <input v-model="newMessage" @keyup.enter="sendMessage"
                   class="flex-1 p-2 bg-gray-700 rounded-l"
                   placeholder="Type your message...">
            <button @click="sendMessage"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebase/config';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';

const route = useRoute();
const roomId = route.params.id;
const players = ref([]);
const gamePhase = ref('day');
const messages = ref([]);
const newMessage = ref('');
const currentPlayer = ref(null);

const isDayPhase = computed(() => gamePhase.value === 'day');
const alivePlayers = computed(() => players.value.filter(p => p.isAlive));
const isMafia = computed(() => currentPlayer.value?.role === 'mafia');
const isDoctor = computed(() => currentPlayer.value?.role === 'doctor');
const isDetective = computed(() => currentPlayer.value?.role === 'detective');

// TODO: Implement game logic functions
const voteToEliminate = (playerId) => {
  // Implement voting logic
};

const mafiaKill = (playerId) => {
  // Implement mafia kill action
};

const doctorSave = (playerId) => {
  // Implement doctor save action
};

const detectiveCheck = (playerId) => {
  // Implement detective check action
};

const sendMessage = () => {
  if (newMessage.value.trim()) {
    // Implement chat message sending
    newMessage.value = '';
  }
};

// Listen to game state changes
onSnapshot(doc(db, 'games', roomId), (doc) => {
  if (doc.exists()) {
    const data = doc.data();
    players.value = data.players;
    gamePhase.value = data.phase;
  }
});
</script> 