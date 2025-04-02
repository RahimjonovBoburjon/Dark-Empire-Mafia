<template>
  <div class="min-h-screen bg-gray-900 text-white p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Victory Screen -->
      <div v-if="gameEnded" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-gray-800 p-8 rounded-lg max-w-2xl w-full">
          <h2 class="text-4xl font-bold text-center mb-6">{{ winner }} wins!</h2>
          <div class="space-y-4">
            <h3 class="text-2xl font-semibold mb-4">Players and their roles:</h3>
            <div v-for="player in players" :key="player.id" 
                 class="flex items-center justify-between p-3 bg-gray-700 rounded">
              <span class="text-lg">{{ player.name }}</span>
              <span class="text-yellow-500">{{ player.role }}</span>
            </div>
          </div>
          <button @click="returnToLobby" class="w-full mt-6 p-3 bg-blue-600 hover:bg-blue-700 rounded">
            Return to Lobby
          </button>
        </div>
      </div>

      <!-- Game Content (Hidden when game ends) -->
      <div v-if="!gameEnded">
        <!-- Loading State -->
        <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div class="text-2xl">Loading game data...</div>
        </div>

        <!-- Game Header -->
        <header class="mb-8">
          <h1 class="text-4xl font-bold text-center">VueMafia</h1>
          <div class="flex justify-between items-center mt-4 table">
            <div class="text-xl">Room: {{ roomId }}</div>
            <div class="text-xl">Phase: {{ gamePhase }}</div>
            <div v-if="currentPlayer" class="text-xl">
              Playing as: {{ currentPlayer.name }} ({{ currentPlayer.role || 'Not assigned' }})
            </div>
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
                <div class="flex items-center gap-2">
                  <span v-if="player.isAlive" class="text-green-500">Alive</span>
                  <span v-else class="text-red-500">Dead</span>
                  <span v-if="player.role && (!player.isAlive || gameEnded)" 
                        class="text-yellow-500">
                    ({{ player.role }})
                  </span>
                  <span v-if="detectiveCheckResult && detectiveCheckResult.targetId === player.id && currentPlayer?.role === 'detective'" 
                        class="text-blue-500">
                    ({{ detectiveCheckResult.isMafia ? 'Mafia' : 'Civilian' }})
                  </span>
                </div>
              </div>
            </div>
            <button v-if="isHost && gamePhase === 'lobby'" 
                    @click="startGame"
                    class="w-full mt-4 p-2 bg-green-600 hover:bg-green-700 rounded">
              Start Game
            </button>
            <button v-if="isHost && gamePhase === 'night' && allNightActionsComplete" 
                    @click="endNightPhase"
                    class="w-full mt-4 p-2 bg-blue-600 hover:bg-blue-700 rounded">
              End Night Phase
            </button>
          </div>

          <!-- Game Actions -->
          <div class="bg-gray-800 p-4 rounded-lg">
            <h2 class="text-2xl font-semibold mb-4">Actions</h2>
            <div v-if="gamePhase === 'lobby'" class="text-center">
              <p>Waiting for more players...</p>
              <p>Current players: {{ players.length }}/{{ maxPlayers }}</p>
            </div>
            <div v-else-if="isDayPhase" class="space-y-4">
              <h3 class="text-xl">Day Phase - Vote to Eliminate</h3>
              <div class="space-y-2">
                <button v-for="player in alivePlayers" :key="player.id"
                        @click="voteToEliminate(player.id)"
                        :disabled="!currentPlayer?.isAlive || hasVoted"
                        class="w-full p-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50">
                  Vote to eliminate {{ player.name }}
                </button>
              </div>
              <div v-if="votes.length > 0" class="mt-4">
                <h4 class="text-lg mb-2">Current Votes:</h4>
                <div v-for="vote in votes" :key="vote.voterId" class="text-sm">
                  {{ getPlayerName(vote.voterId) }} voted for {{ getPlayerName(vote.targetId) }}
                </div>
              </div>
            </div>
            <div v-else class="space-y-4">
              <h3 class="text-xl">Night Phase</h3>
              <div v-if="isMafia && currentPlayer?.isAlive" class="space-y-2">
                <h4 class="text-lg">Mafia Action</h4>
                <button v-for="player in alivePlayers" :key="player.id"
                        @click="mafiaKill(player.id)"
                        :disabled="nightActions.mafia !== null"
                        class="w-full p-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50">
                  Kill {{ player.name }}
                </button>
              </div>
              <div v-if="isDoctor && currentPlayer?.isAlive" class="space-y-2">
                <h4 class="text-lg">Doctor Action</h4>
                <button v-for="player in alivePlayers" :key="player.id"
                        @click="doctorSave(player.id)"
                        :disabled="nightActions.doctor !== null"
                        class="w-full p-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50">
                  Save {{ player.name }}
                </button>
              </div>
              <div v-if="isDetective && currentPlayer?.isAlive" class="space-y-2">
                <h4 class="text-lg">Detective Action</h4>
                <button v-for="player in alivePlayers" :key="player.id"
                        @click="detectiveCheck(player.id)"
                        :disabled="nightActions.detective !== null"
                        class="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50">
                  Check {{ player.name }}
                </button>
                <div v-if="detectiveCheckResult" class="mt-2 text-blue-400">
                  {{ getPlayerName(detectiveCheckResult.targetId) }} is {{ detectiveCheckResult.isMafia ? 'Mafia' : 'Civilian' }}
                </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebase/config';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';

const route = useRoute();
const roomId = route.params.id;
const players = ref([]);
const gamePhase = ref('lobby');
const messages = ref([]);
const newMessage = ref('');
const currentPlayer = ref(null);
const maxPlayers = 8;
const loading = ref(true);
const votes = ref([]);
const hasVoted = ref(false);
const nightActions = ref({
  mafia: null,
  doctor: null,
  detective: null
});
const gameEnded = ref(false);
const winner = ref('');
const detectiveCheckResult = ref(null);

let unsubscribe = null;

const isDayPhase = computed(() => gamePhase.value === 'day');
const alivePlayers = computed(() => players.value.filter(p => p.isAlive));
const isMafia = computed(() => currentPlayer.value?.role === 'mafia');
const isDoctor = computed(() => currentPlayer.value?.role === 'doctor');
const isDetective = computed(() => currentPlayer.value?.role === 'detective');
const isHost = computed(() => {
  // If in lobby phase, only the first player is host
  if (gamePhase.value === 'lobby') {
    return players.value[0]?.id === currentPlayer.value?.id;
  }
  
  // During game, find the first alive player to be host
  const firstAlivePlayer = players.value.find(p => p.isAlive);
  return firstAlivePlayer?.id === currentPlayer.value?.id;
});
const allNightActionsComplete = computed(() => {
  if (!isMafia.value && !isDoctor.value && !isDetective.value) return true;
  return (
    (!isMafia.value || nightActions.value.mafia !== null) &&
    (!isDoctor.value || nightActions.value.doctor !== null) &&
    (!isDetective.value || nightActions.value.detective !== null)
  );
});

const getPlayerName = (playerId) => {
  const player = players.value.find(p => p.id === playerId);
  return player ? player.name : 'Unknown';
};

const startGame = async () => {
  if (players.value.length < 5) {
    alert('Need at least 5 players to start the game!');
    return;
  }

  const roles = assignRoles(players.value.length);
  const updatedPlayers = players.value.map((player, index) => ({
    ...player,
    role: roles[index]
  }));

  await updateDoc(doc(db, 'games', roomId), {
    players: updatedPlayers,
    phase: 'night',
    nightActions: {
      mafia: null,
      doctor: null,
      detective: null
    },
    votes: []
  });
};

const assignRoles = (playerCount) => {
  const roles = [];
  const mafiaCount = Math.max(1, Math.floor(playerCount / 4));
  
  // Add mafia roles
  for (let i = 0; i < mafiaCount; i++) {
    roles.push('mafia');
  }
  
  // Add special roles
  roles.push('doctor');
  roles.push('detective');
  
  // Fill remaining with civilians
  while (roles.length < playerCount) {
    roles.push('civilian');
  }
  
  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  
  return roles;
};

const voteToEliminate = async (playerId) => {
  if (!currentPlayer.value?.isAlive || hasVoted.value) return;

  const gameRef = doc(db, 'games', roomId);
  await updateDoc(gameRef, {
    votes: arrayUnion({
      voterId: currentPlayer.value.id,
      targetId: playerId
    })
  });

  hasVoted.value = true;

  // Check if all alive players have voted
  const aliveCount = alivePlayers.value.length;
  const currentVotes = votes.value.length;
  if (currentVotes + 1 >= aliveCount) {
    // Process votes
    const voteCounts = {};
    votes.value.forEach(vote => {
      voteCounts[vote.targetId] = (voteCounts[vote.targetId] || 0) + 1;
    });

    const maxVotes = Math.max(...Object.values(voteCounts));
    const eliminatedPlayers = Object.entries(voteCounts)
      .filter(([_, count]) => count === maxVotes)
      .map(([id]) => id);

    if (eliminatedPlayers.length === 1) {
      const eliminatedPlayerId = eliminatedPlayers[0];
      const updatedPlayers = players.value.map(player => {
        if (player.id === eliminatedPlayerId) {
          return { ...player, isAlive: false };
        }
        return player;
      });

      await updateDoc(gameRef, {
        players: updatedPlayers,
        phase: 'night',
        votes: [],
        nightActions: {
          mafia: null,
          doctor: null,
          detective: null
        }
      });

      checkWinConditions(updatedPlayers);
    }
  }
};

const endNightPhase = async () => {
  const gameRef = doc(db, 'games', roomId);
  const targetPlayer = players.value.find(p => p.id === nightActions.value.mafia);
  const savedPlayer = players.value.find(p => p.id === nightActions.value.doctor);

  // Process night actions
  if (targetPlayer && targetPlayer.id !== savedPlayer?.id) {
    const updatedPlayers = players.value.map(player => {
      if (player.id === targetPlayer.id) {
        return { ...player, isAlive: false };
      }
      return player;
    });

    await updateDoc(gameRef, {
      players: updatedPlayers,
      phase: 'day',
      nightActions: {
        mafia: null,
        doctor: null,
        detective: null
      }
    });

    // Check win conditions
    checkWinConditions(updatedPlayers);
  } else {
    await updateDoc(gameRef, {
      phase: 'day',
      nightActions: {
        mafia: null,
        doctor: null,
        detective: null
      }
    });
  }
};

const checkWinConditions = (players) => {
  const alivePlayers = players.filter(p => p.isAlive);
  const mafiaPlayers = alivePlayers.filter(p => p.role === 'mafia');
  const civilianPlayers = alivePlayers.filter(p => p.role !== 'mafia');

  if (mafiaPlayers.length === 0) {
    winner.value = 'Civilians';
    gameEnded.value = true;
    // Save game end state to Firebase
    const gameRef = doc(db, 'games', roomId);
    updateDoc(gameRef, {
      gameEnded: true,
      winner: 'Civilians'
    });
  } else if (mafiaPlayers.length >= civilianPlayers.length) {
    winner.value = 'Mafia';
    gameEnded.value = true;
    // Save game end state to Firebase
    const gameRef = doc(db, 'games', roomId);
    updateDoc(gameRef, {
      gameEnded: true,
      winner: 'Mafia'
    });
  }
};

const mafiaKill = async (playerId) => {
  if (!currentPlayer.value?.isAlive || !isMafia.value) return;

  const gameRef = doc(db, 'games', roomId);
  await updateDoc(gameRef, {
    'nightActions.mafia': playerId
  });
};

const doctorSave = async (playerId) => {
  if (!currentPlayer.value?.isAlive || !isDoctor.value) return;

  const gameRef = doc(db, 'games', roomId);
  await updateDoc(gameRef, {
    'nightActions.doctor': playerId
  });
};

const detectiveCheck = async (playerId) => {
  if (!currentPlayer.value?.isAlive || !isDetective.value) return;

  const gameRef = doc(db, 'games', roomId);
  await updateDoc(gameRef, {
    'nightActions.detective': playerId
  });

  const targetPlayer = players.value.find(p => p.id === playerId);
  detectiveCheckResult.value = {
    targetId: playerId,
    isMafia: targetPlayer.role === 'mafia'
  };
};

const sendMessage = () => {
  if (newMessage.value.trim()) {
    // TODO: Implement chat message sending
    newMessage.value = '';
  }
};

// Add return to lobby function
const returnToLobby = async () => {
  const gameRef = doc(db, 'games', roomId);
  await updateDoc(gameRef, {
    phase: 'lobby',
    players: players.value.map(player => ({
      ...player,
      role: null,
      isAlive: true
    })),
    votes: [],
    nightActions: {
      mafia: null,
      doctor: null,
      detective: null
    },
    gameEnded: false,
    winner: null
  });
  gameEnded.value = false;
  winner.value = '';
};

// Listen to game state changes
onMounted(() => {
  const gameRef = doc(db, 'games', roomId);
  unsubscribe = onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      players.value = data.players;
      gamePhase.value = data.phase;
      nightActions.value = data.nightActions || {
        mafia: null,
        doctor: null,
        detective: null
      };
      votes.value = data.votes || [];
      
      // Set current player
      const playerId = localStorage.getItem('playerId');
      currentPlayer.value = players.value.find(p => p.id === playerId);
      
      // Check if game is ended
      if (data.gameEnded) {
        gameEnded.value = true;
        winner.value = data.winner;
      }
      
      // Reset vote status when phase changes
      if (gamePhase.value === 'day') {
        hasVoted.value = false;
      }

      // Reset detective check result when night phase starts
      if (gamePhase.value === 'night') {
        detectiveCheckResult.value = null;
      }
      
      loading.value = false;
    }
  }, (error) => {
    console.error('Error listening to game updates:', error);
    loading.value = false;
  });
});

// Clean up listener when component is unmounted
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script> 