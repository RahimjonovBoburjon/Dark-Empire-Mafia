<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- Time-based background -->
    <div 
      class="fixed inset-0 transition-all duration-1000"
      :class="{
        'bg-gradient-to-br from-blue-400 to-blue-600': isDay,
        'bg-gradient-to-br from-orange-500 to-purple-800': isEvening,
        'bg-gradient-to-br from-gray-900 to-gray-800': isNight
      }"
    >
      <!-- Sun/Moon -->
      <div 
        class="fixed top-8 right-8 w-16 h-16 rounded-full transition-all duration-1000"
        :class="{
          'bg-yellow-400': isDay,
          'bg-orange-500': isEvening,
          'bg-gray-300': isNight
        }"
      >
        <div 
          v-if="isNight"
          class="absolute inset-0 flex items-center justify-center text-3xl"
        >
          🌙
        </div>
      </div>

      <!-- Stars for Night -->
      <div v-if="isNight" class="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          v-for="n in 20" 
          :key="n"
          class="absolute w-1 h-1 bg-white rounded-full"
          :style="{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random()
          }"
        ></div>
      </div>
    </div>

    <!-- Game Content -->
    <div class="relative z-10 p-4">
      <!-- Game Started Animation -->
      <div v-if="showGameStart" class="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
        <div class="text-center">
          <div class="w-32 h-32 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 class="text-4xl font-bold mb-2 text-white animate-pulse">Game Started!</h2>
          <p class="text-xl text-gray-300">The night falls upon the city...</p>
        </div>
      </div>

      <!-- Day/Night Transition -->
      <div v-if="showTransition" class="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
        <div class="text-center">
          <h2 class="text-4xl font-bold mb-2 text-white animate-pulse">
            {{ isDay ? 'Day breaks!' : 'Night falls!' }}
          </h2>
          <p class="text-xl text-gray-300">
            {{ isDay ? 'The city awakens...' : 'The city sleeps...' }}
          </p>
        </div>
      </div>

      <!-- Death Animation -->
      <div v-if="showDeath" class="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
        <div class="text-center">
          <div class="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <span class="text-6xl">💀</span>
          </div>
          <h2 class="text-4xl font-bold mb-2 text-white">Player Eliminated!</h2>
          <p class="text-xl text-gray-300">{{ deathMessage }}</p>
        </div>
      </div>

      <!-- Main Game Content -->
      <div class="max-w-6xl mx-auto">
        <!-- Game Header -->
        <header class="mb-8 flex items-center justify-between">
          <div>
            <a href="/">
              <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-800">
                Dark Empire: Mafia
              </h1>
            </a>
            <p class="text-gray-400">Game Room: {{ gameId }}</p>
            <p class="text-gray-400">Host: {{ game.players.find(p => p.isHost)?.name }}</p>
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
            <!-- Debug Info -->
            <div class="bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
              <span class="text-gray-400">Host:</span>
              <span class="ml-2 font-semibold">{{ currentPlayer?.isHost ? 'Yes' : 'No' }}</span>
            </div>
            <!-- Add Start Game Button -->
            <button 
              v-if="game.phase === 'lobby' && currentPlayer?.isHost"
              @click="startGame"
              class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Game</span>
              <span class="animate-pulse">▶️</span>
            </button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
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
const currentTime = ref(new Date().getHours());
const isDay = ref(currentTime.value >= 6 && currentTime.value < 18);
const isEvening = ref(currentTime.value >= 18 && currentTime.value < 21);
const isNight = ref(currentTime.value >= 21 || currentTime.value < 6);

// Animation states
const showGameStart = ref(false);
const showTransition = ref(false);
const showDeath = ref(false);
const deathMessage = ref('');

let unsubscribe = null;

const alivePlayers = computed(() => {
  return game.value.players.filter(p => p.isAlive);
});

const vote = async (playerId) => {
  currentVote.value = playerId;
  // Implement voting logic
};

const calculateRoleCounts = (playerCount) => {
  if (playerCount === 5) return { mafia: 1, doctor: 1, detective: 1, civilians: 2 };
  if (playerCount <= 7) return { mafia: 2, doctor: 1, detective: 1, civilians: playerCount - 4 };
  if (playerCount <= 10) return { mafia: 2, doctor: 1, detective: 1, civilians: playerCount - 4 };
  if (playerCount <= 14) return { mafia: 3, doctor: 1, detective: 1, civilians: playerCount - 5 };
  return { mafia: 4, doctor: 1, detective: 1, civilians: playerCount - 6 };
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
          // Group targets by mafia
          const targetGroups = {};
          Object.entries(mafiaTargets.value).forEach(([targetId, mafiaId]) => {
            if (!targetGroups[targetId]) {
              targetGroups[targetId] = [];
            }
            targetGroups[targetId].push(mafiaId);
          });
          
          // Find targets with most votes
          let maxVotes = 0;
          let finalTargets = [];
          
          Object.entries(targetGroups).forEach(([targetId, mafias]) => {
            if (mafias.length > maxVotes) {
              maxVotes = mafias.length;
              finalTargets = [targetId];
            } else if (mafias.length === maxVotes) {
              finalTargets.push(targetId);
            }
          });
          
          // Randomly select one target if there's a tie
          const targetToKill = finalTargets[Math.floor(Math.random() * finalTargets.length)];
          await killPlayer(targetToKill);
          
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

// Watch for game phase changes
const watchGamePhase = () => {
  const gameRef = doc(db, 'games', route.params.id);
  onSnapshot(gameRef, (doc) => {
    const game = doc.data();
    
    // Show game start animation
    if (game.phase === 'night' && !showGameStart.value) {
      showGameStart.value = true;
      setTimeout(() => {
        showGameStart.value = false;
      }, 3000);
    }

    // Show day/night transition
    if (game.phase === 'day' || game.phase === 'night') {
      showTransition.value = true;
      setTimeout(() => {
        showTransition.value = false;
      }, 2000);
    }

    // Show death animation if player was eliminated
    if (game.lastDeath) {
      deathMessage.value = `${game.lastDeath.name} was eliminated!`;
      showDeath.value = true;
      setTimeout(() => {
        showDeath.value = false;
      }, 3000);
    }
  });
};

const startGame = async () => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (gameDoc.exists()) {
      const game = gameDoc.data();
      const players = [...game.players];
      
      // Shuffle players array
      for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
      }
      
      // Calculate role counts
      const roleCounts = calculateRoleCounts(players.length);
      
      // Assign roles
      let mafiaCount = 0;
      let doctorAssigned = false;
      let detectiveAssigned = false;
      
      for (let i = 0; i < players.length; i++) {
        if (mafiaCount < roleCounts.mafia) {
          players[i].role = 'mafia';
          mafiaCount++;
        } else if (!doctorAssigned) {
          players[i].role = 'doctor';
          doctorAssigned = true;
        } else if (!detectiveAssigned) {
          players[i].role = 'detective';
          detectiveAssigned = true;
        } else {
          players[i].role = 'civilian';
        }
      }
      
      // Update game with assigned roles
      await updateDoc(gameRef, {
        phase: 'night',
        startTime: new Date(),
        players: players,
        settings: {
          ...game.settings,
          mafiaCount: roleCounts.mafia
        }
      });
    }
  } catch (error) {
    console.error('Error starting game:', error);
  }
};

onMounted(() => {
  const gameRef = doc(db, 'games', gameId);
  unsubscribe = onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      game.value = doc.data();
      const playerId = localStorage.getItem('playerId');
      currentPlayer.value = game.value.players.find(p => p.id === playerId);
      
      // Debug log
      console.log('Game Phase:', game.value.phase);
      console.log('Current Player:', currentPlayer.value);
      console.log('Is Host:', currentPlayer.value?.isHost);
    }
  });
  updateTime();
  setInterval(updateTime, 300000);
  watchGamePhase();
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// Update time every 5 minutes
const updateTime = () => {
  const hour = new Date().getHours();
  currentTime.value = hour;
  isDay.value = hour >= 6 && hour < 18;
  isEvening.value = hour >= 18 && hour < 21;
  isNight.value = hour >= 21 || hour < 6;
};
</script>

<style>
/* Add smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 1000ms;
}

/* Optimize animations */
* {
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style> 