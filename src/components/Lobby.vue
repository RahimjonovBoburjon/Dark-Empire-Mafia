<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div class="text-2xl font-light">Loading game data...</div>
        </div>
      </div>

      <header class="mb-12 text-center">
        <h1 class="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-800">
          Dark Empire: Mafia
        </h1>
        <p class="text-gray-400 text-lg">Enter the shadows of deception and power</p>
      </header>

      <!-- Previously Joined Games -->
      <div v-if="previousGames.length > 0" class="mb-12">
        <div class="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-xl">
          <h2 class="text-2xl font-semibold mb-6 flex items-center">
            <span class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">🔄</span>
            Your Previous Games
          </h2>
          <div class="space-y-4">
            <div v-for="game in previousGames" :key="game.id"
              class="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-300">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <span class="font-semibold">Game {{ game.id }}</span>
                  <span class="text-gray-400 ml-2">
                    ({{ game.players.length }}/{{ game.maxPlayers }} players)
                  </span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="rejoinGame(game.id)" 
                  class="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg font-medium transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
                >
                  Rejoin
                </button>
                <button 
                  @click="removeGame(game.id)" 
                  class="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transform hover:scale-[1.02] transition-all duration-300"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Create Game -->
        <div class="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
          <h2 class="text-2xl font-semibold mb-6 flex items-center">
            <span class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">+</span>
            Create New Game
          </h2>
          <div class="space-y-6">
            <div>
              <label class="block mb-2 text-gray-300">Your Name</label>
              <input 
                v-model="playerName" 
                class="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                placeholder="Enter your name"
              >
            </div>
            <div>
              <label class="block mb-2 text-gray-300">Number of Players (5-20)</label>
              <select 
                v-model="maxPlayers" 
                class="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              >
                <option v-for="n in 16" :key="n" :value="n + 4">{{ n + 4 }} players</option>
              </select>
            </div>
            <button 
              @click="createGame" 
              class="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg font-medium transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
              :disabled="!playerName.trim()"
              :class="{'opacity-50 cursor-not-allowed': !playerName.trim()}"
            >
              Create Game
            </button>
          </div>
        </div>

        <!-- Join Game -->
        <div class="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
          <h2 class="text-2xl font-semibold mb-6 flex items-center">
            <span class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">→</span>
            Join Existing Game
          </h2>
          <div class="space-y-6">
            <div>
              <label class="block mb-2 text-gray-300">Your Name</label>
              <input 
                v-model="joinPlayerName" 
                class="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                placeholder="Enter your name"
              >
            </div>
            <div>
              <label class="block mb-2 text-gray-300">Game Code</label>
              <input 
                v-model="gameCode" 
                class="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                placeholder="Enter game code"
              >
            </div>
            <button 
              @click="joinGame" 
              class="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-medium transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
              :disabled="!joinPlayerName.trim() || !gameCode.trim()"
              :class="{'opacity-50 cursor-not-allowed': !joinPlayerName.trim() || !gameCode.trim()}"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>

      <!-- Active Games -->
      <div class="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-xl">
        <h2 class="text-2xl font-semibold mb-6 flex items-center">
          <span class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">⚡</span>
          Active Games
        </h2>
        <div class="space-y-4">
          <div v-for="game in activeGames" :key="game.id"
            class="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-300">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <span class="font-semibold">Game {{ game.id }}</span>
                <span class="text-gray-400 ml-2">
                  ({{ game.players.length }}/{{ game.maxPlayers }} players)
                </span>
              </div>
            </div>
            <button 
              @click="joinSpecificGame(game.id)" 
              class="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg font-medium transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
              :disabled="!joinPlayerName.trim()"
              :class="{'opacity-50 cursor-not-allowed': !joinPlayerName.trim()}"
            >
              Join
            </button>
          </div>
          <div v-if="activeGames.length === 0" class="text-center py-8 text-gray-400">
            No active games available. Create one to get started!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

const router = useRouter();
const playerName = ref(localStorage.getItem('playerName') || '');
const joinPlayerName = ref(localStorage.getItem('playerName') || '');
const gameCode = ref('');
const activeGames = ref([]);
const previousGames = ref([]);
const loading = ref(true);
const maxPlayers = ref(8); // Default to 8 players

let unsubscribe = null;

// Watch for changes in player names and save to localStorage
watch(playerName, (newName) => {
  if (newName.trim()) {
    localStorage.setItem('playerName', newName);
    joinPlayerName.value = newName;
  }
});

watch(joinPlayerName, (newName) => {
  if (newName.trim()) {
    localStorage.setItem('playerName', newName);
    playerName.value = newName;
  }
});

const createGame = async () => {
  if (!playerName.value.trim()) return;

  try {
    const playerId = Date.now().toString();
    localStorage.setItem('playerId', playerId);
    
    const gameRef = await addDoc(collection(db, 'games'), {
      players: [{
        id: playerId,
        name: playerName.value,
        role: null,
        isAlive: true
      }],
      phase: 'lobby',
      maxPlayers: maxPlayers.value,
      createdAt: new Date(),
      settings: {
        mafiaCount: getMafiaCount(maxPlayers.value),
        doctorCount: 1,
        detectiveCount: 1
      }
    });

    // Save to previous games
    const gameData = {
      id: gameRef.id,
      players: [{ id: playerId, name: playerName.value, isAlive: true }],
      maxPlayers: maxPlayers.value
    };
    saveToPreviousGames(gameData);
    
    router.push(`/game/${gameRef.id}`);
  } catch (error) {
    console.error('Error creating game:', error);
  }
};

const joinGame = async () => {
  if (!joinPlayerName.value.trim() || !gameCode.value.trim()) return;

  try {
    const playerId = Date.now().toString();
    localStorage.setItem('playerId', playerId);
    
    const gameRef = doc(db, 'games', gameCode.value);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists()) {
      const game = gameDoc.data();
      if (game.players.length < game.maxPlayers) {
        // Save to previous games
        saveToPreviousGames({
          id: gameCode.value,
          players: game.players,
          maxPlayers: game.maxPlayers
        });
        
        await updateDoc(gameRef, {
          players: [...game.players, {
            id: playerId,
            name: joinPlayerName.value,
            role: null,
            isAlive: true
          }]
        });
        router.push(`/game/${gameCode.value}`);
      } else {
        alert('Game is full!');
      }
    } else {
      alert('Game not found!');
    }
  } catch (error) {
    console.error('Error joining game:', error);
  }
};

const joinSpecificGame = (gameId) => {
  if (!joinPlayerName.value.trim()) {
    alert('Please enter your name first!');
    return;
  }
  gameCode.value = gameId;
  joinGame();
};

const fetchActiveGames = () => {
  loading.value = true;
  const q = query(collection(db, 'games'), where('phase', '==', 'lobby'));
  unsubscribe = onSnapshot(q, (querySnapshot) => {
    activeGames.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    loading.value = false;
  }, (error) => {
    console.error('Error fetching active games:', error);
    loading.value = false;
  });
};

const rejoinGame = (gameId) => {
  router.push(`/game/${gameId}`);
};

const removeGame = async (gameId) => {
  try {
    const playerId = localStorage.getItem('playerId');
    if (!playerId) return;

    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists()) {
      const game = gameDoc.data();
      // Remove player from the game
      const updatedPlayers = game.players.filter(player => player.id !== playerId);
      
      if (updatedPlayers.length === 0) {
        // If no players remain, delete the game
        await deleteDoc(gameRef);
        
        // Also delete all messages for this game
        const messagesRef = collection(db, 'games', gameId, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } else {
        // Update the game with remaining players
        await updateDoc(gameRef, {
          players: updatedPlayers
        });
      }

      // Remove from local storage
      previousGames.value = previousGames.value.filter(game => game.id !== gameId);
      localStorage.setItem('previousGames', JSON.stringify(previousGames.value));
    }
  } catch (error) {
    console.error('Error removing player from game:', error);
  }
};

const saveToPreviousGames = (gameData) => {
  // Check if game already exists in previous games
  const existingGameIndex = previousGames.value.findIndex(game => game.id === gameData.id);
  
  if (existingGameIndex === -1) {
    previousGames.value.push(gameData);
  } else {
    previousGames.value[existingGameIndex] = gameData;
  }
  
  localStorage.setItem('previousGames', JSON.stringify(previousGames.value));
};

// Helper function to determine mafia count based on player count
const getMafiaCount = (playerCount) => {
  if (playerCount === 5) return 1;
  if (playerCount <= 7) return 2;
  if (playerCount <= 10) return 2;
  if (playerCount <= 14) return 3;
  return 4; // For 15-20 players
};

onMounted(() => {
  // Load previous games from localStorage
  const savedGames = localStorage.getItem('previousGames');
  if (savedGames) {
    previousGames.value = JSON.parse(savedGames);
  }
  fetchActiveGames();
});

// Clean up listener when component is unmounted
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>