<template>
  <div v-if="showStatus" class="fixed bottom-4 right-4 z-50">
    <div
      class="p-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center"
      :class="statusClass"
    >
      <span v-if="checking" class="animate-spin mr-2">⟳</span>
      {{ statusMessage }}
      <button @click="showStatus = false" class="ml-2 hover:opacity-70">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const showStatus = ref(true)
const statusClass = ref('bg-blue-500')
const checking = ref(true)
</script>
