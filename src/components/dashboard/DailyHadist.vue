<template>
  <div class="h-full flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
        Hadits Harian
      </h3>
      <button @click="handleManualRefresh" class="text-gray-400 hover:text-brand-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3 flex-1">
      <div class="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div class="h-4 w-1/3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-4 text-sm text-red-500 flex-1">
      {{ error }}
    </div>

    <!-- Konten Hadits -->
    <div v-else-if="hadith" class="flex-1 flex flex-col justify-start">
      
      <!-- Container Teks dengan Batas Tinggi -->
      <!-- max-h-[180px] untuk mobile (atas bawah), xl:max-h-[260px] untuk desktop -->
      <div 
        ref="textContainer"
        :class="[
          'transition-all duration-300',
          !isExpandedHadist ? 'line-clamp-6 xl:line-clamp-8' : ''
        ]"
      >
        <p class="text-right text-xl leading-relaxed text-gray-800 dark:text-gray-100 font-arabic mb-3" dir="rtl">
          {{ hadith.arab }}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
          "{{ hadith.id }}"
        </p>
      </div>

      <!-- Tombol Toggle (Hanya Muncul jika Teks Melebihi Kotak) -->
      <div class="mt-2" v-if="showReadMoreBtn">
        <button 
          @click="isExpandedHadist = !isExpandedHadist" 
          class="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors mb-3"
        >
          {{ isExpandedHadist ? 'Tutup' : 'Baca Selengkapnya' }}
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800">
      <p v-if="hadith" class="text-xs font-semibold text-brand-600 dark:text-white">
        Riwayat {{ hadith.name }} - No. {{ hadith.number }}
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'

const isLoading = ref(true)
const error = ref('')
const hadith = ref<any>(null)
let intervalTimer: ReturnType<typeof setInterval>

// State baru untuk fitur ekspansi teks
const isExpandedHadist = ref(false)
const showReadMoreBtn = ref(false)
const textContainer = ref<HTMLElement | null>(null)

// Fungsi mengecek apakah teks melebihi tinggi container
const checkOverflow = () => {
  // Gunakan setTimeout agar browser punya waktu untuk merender font & line-clamp
  setTimeout(() => {
    if (textContainer.value) {
      // scrollHeight = tinggi asli teks keseluruhan
      // clientHeight = tinggi kotak yang dibatasi oleh line-clamp
      showReadMoreBtn.value = textContainer.value.scrollHeight > textContainer.value.clientHeight
    }
  }, 100) // Beri jeda 100 milidetik (0.1 detik)
}

const fetchRandomHadith = async () => {
  isLoading.value = true
  error.value = ''
  isExpandedHadist.value = false // Reset mode baca
  
  try {
    const randomNum = Math.floor(Math.random() * 1000) + 1
    const res = await axios.get(`https://api.hadith.gading.dev/books/bukhari/${randomNum}`)
    
    hadith.value = {
      ...res.data.data.contents,
      name: res.data.data.name
    }

    // Cek overflow setelah data hadits dimasukkan ke variabel
    await checkOverflow()

  } catch (err) {
    error.value = 'Gagal memuat hadits.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const resetTimer = () => {
  // Bersihkan timer yang lama agar tidak ada timer ganda
  if (intervalTimer) clearInterval(intervalTimer)
  
  // Buat timer baru untuk 5 menit (300.000 ms) ke depan
  intervalTimer = setInterval(fetchRandomHadith, 300000)
}

// Fungsi khusus saat tombol diklik
const handleManualRefresh = () => {
  fetchRandomHadith() // Ambil hadits baru
  resetTimer()        // Reset waktu hitung mundurnya
}

onMounted(() => {
  fetchRandomHadith()
  resetTimer() // Panggil resetTimer di sini untuk memulai saat pertama kali dimuat
  
  window.addEventListener('resize', checkOverflow)
})

onUnmounted(() => {
  if (intervalTimer) clearInterval(intervalTimer)
  window.removeEventListener('resize', checkOverflow)
})
</script>