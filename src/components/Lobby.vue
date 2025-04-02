<template>
  <div class="min-h-screen bg-gray-900 text-white p-4">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-center">VueMafia Lobby</h1>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Create Game -->
        <div class="bg-gray-800 p-6 rounded-lg">
          <h2 class="text-2xl font-semibold mb-4">Create New Game</h2>
          <div class="space-y-4">
            <div>
              <label class="block mb-2">Your Name</label>
              <input v-model="playerName" class="w-full p-2 bg-gray-700 rounded" placeholder="Enter your name">
            </div>
            <button @click="createGame" class="w-full p-3 bg-green-600 hover:bg-green-700 rounded">
              Create Game
            </button>
          </div>
        </div>

        <!-- Join Game -->
        <div class="bg-gray-800 p-6 rounded-lg">
          <h2 class="text-2xl font-semibold mb-4">Join Existing Game</h2>
          <div class="space-y-4">
            <div>
              <label class="block mb-2">Your Name</label>
              <input v-model="joinPlayerName" class="w-full p-2 bg-gray-700 rounded" placeholder="Enter your name">
            </div>
            <div>
              <label class="block mb-2">Game Code</label>
              <input v-model="gameCode" class="w-full p-2 bg-gray-700 rounded" placeholder="Enter game code">
            </div>
            <button @click="joinGame" class="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded">
              Join Game
            </button>
          </div>
        </div>
      </div>

      <!-- Active Games -->
      <div class="mt-8 bg-gray-800 p-6 rounded-lg">
        <h2 class="text-2xl font-semibold mb-4">Active Games</h2>
        <div class="space-y-2">
          <div v-for="game in activeGames" :key="game.id"
            class="flex items-center justify-between p-3 bg-gray-700 rounded">
            <div>
              <span class="font-semibold">Game {{ game.id }}</span>
              <span class="text-gray-400 ml-2">
                ({{ game.players.length }}/{{ game.maxPlayers }} players)
              </span>
            </div>
            <button @click="joinSpecificGame(game.id)" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';

const router = useRouter();
const playerName = ref('');
const joinPlayerName = ref('');
const gameCode = ref('');
const activeGames = ref([]);

const createGame = async () => {
  if (!playerName.value.trim()) return;

  try {
    const gameRef = await addDoc(collection(db, 'games'), {
      players: [{
        id: Date.now().toString(),
        name: playerName.value,
        role: null,
        isAlive: true
      }],
      phase: 'lobby',
      maxPlayers: 8,
      createdAt: new Date()
    });

    router.push(`/game/${gameRef.id}`);
  } catch (error) {
    console.error('Error creating game:', error);
  }
};

const joinGame = async () => {
  if (!joinPlayerName.value.trim() || !gameCode.value.trim()) return;

  try {
    const gameRef = doc(db, 'games', gameCode.value);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists()) {
      const game = gameDoc.data();
      if (game.players.length < game.maxPlayers) {
        await updateDoc(gameRef, {
          players: [...game.players, {
            id: Date.now().toString(),
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

const fetchActiveGames = async () => {
  try {
    const q = query(collection(db, 'games'), where('phase', '==', 'lobby'));
    const querySnapshot = await getDocs(q);
    activeGames.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching active games:', error);
  }
};

onMounted(() => {
  fetchActiveGames();
});
</script>