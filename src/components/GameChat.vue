<template>
  <div class="h-full flex flex-col">
    <div class="flex-1 overflow-y-auto mb-4 space-y-3 p-2">
      <div v-for="message in messages" :key="message.id"
        class="p-3 rounded-lg"
        :class="{
          'bg-gray-700/30': message.type === 'system',
          'bg-gray-700/50': message.type === 'player'
        }">
        <div class="flex items-center mb-1">
          <span class="font-semibold" :class="{
            'text-red-400': message.sender === currentPlayer?.name,
            'text-gray-300': message.sender !== currentPlayer?.name
          }">{{ message.sender }}</span>
          <span class="text-gray-400 text-sm ml-2">{{ formatTime(message.timestamp) }}</span>
        </div>
        <p class="text-gray-200">{{ message.content }}</p>
      </div>
    </div>
    <div class="sticky bottom-0 flex space-x-2 p-2 mb-8">
      <input v-model="newMessage"
        class="flex-1 p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
        placeholder="Type your message..."
        @keyup.enter="sendMessage">
      <button @click="sendMessage"
        class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg font-medium transform hover:scale-[1.02] transition-all duration-300 shadow-lg">
        Send
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

const props = defineProps({
  gameId: {
    type: String,
    required: true
  },
  currentPlayer: {
    type: Object,
    required: true
  }
});

const messages = ref([]);
const newMessage = ref('');
let unsubscribe = null;

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  
  try {
    await addDoc(collection(db, 'games', props.gameId, 'messages'), {
      sender: props.currentPlayer.name,
      content: newMessage.value,
      timestamp: serverTimestamp(),
      type: 'player'
    });
    newMessage.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

onMounted(() => {
  const messagesRef = collection(db, 'games', props.gameId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  unsubscribe = onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script> 