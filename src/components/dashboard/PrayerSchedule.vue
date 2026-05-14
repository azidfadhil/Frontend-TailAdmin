<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
          Jadwal Sholat
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ todayLabel }} • Kab. Sleman, D.I. Yogyakarta
        </p>
      </div>
    </div>

    <!-- Countdown ke sholat berikutnya -->
    <div
      v-if="nextPrayer"
      class="mb-5 p-4 rounded-xl bg-brand-500 text-white"
    >
      <p class="text-sm opacity-80">Waktu sholat berikutnya</p>
      <div class="flex items-end justify-between mt-1">
        <div>
          <p class="text-xl font-bold">{{ nextPrayer.name }}</p>
          <p class="text-sm opacity-80">
            {{ nextPrayer.time }}
            <span v-if="nextPrayer.isTomorrow" class="font-medium text-brand-200">(Besok)</span>
          </p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold font-mono">{{ countdown }}</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-6 text-sm text-red-500">
      {{ error }}
    </div>

    <!-- Jadwal sholat -->
    <div v-else class="space-y-2">
      <div
        v-for="prayer in prayers"
        :key="prayer.name"
        :class="[
          'flex items-center justify-between px-4 py-3 rounded-xl transition-colors',
          prayer.isNext
            ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        ]"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg">{{ prayer.emoji }}</span>
          <span :class="[
            'font-medium text-sm',
            prayer.isNext
              ? 'text-brand-600 dark:text-brand-400'
              : prayer.isPast
                ? 'text-gray-400 dark:text-gray-600'
                : 'text-gray-700 dark:text-gray-300'
          ]">
            {{ prayer.name }}
          </span>
          <span
            v-if="prayer.isNext"
            class="text-xs px-2 py-0.5 rounded-full bg-brand-500 text-white font-medium"
          >
            Berikutnya
          </span>
        </div>
        <span :class="[
          'font-semibold text-sm font-mono',
          prayer.isNext
            ? 'text-brand-600 dark:text-brand-400'
            : prayer.isPast
              ? 'text-gray-400 dark:text-gray-600'
              : 'text-gray-800 dark:text-gray-200'
        ]">
          {{ prayer.time }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

// Konstanta lokasi masjid
const PROVINSI = 'D.I. Yogyakarta'
const KABKOTA = 'Kab. Sleman'

const isLoading = ref(true)
const error = ref('')
const scheduleData = ref<any>(null)
const now = ref(new Date())

// Update waktu setiap detik
let timer: ReturnType<typeof setInterval>

onMounted(async () => {
  await fetchSchedule()
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

async function fetchSchedule() {
  try {
    isLoading.value = true
    error.value = ''

    const month = now.value.getMonth() + 1
    const year = now.value.getFullYear()

    const res = await axios.post('https://equran.id/api/v2/shalat', {
      provinsi: PROVINSI,
      kabkota: KABKOTA,
      bulan: month,
      tahun: year
    })

    scheduleData.value = res.data.data
  } catch (err) {
    error.value = 'Gagal memuat jadwal sholat. Coba refresh halaman.'
  } finally {
    isLoading.value = false
  }
}

// Jadwal hari ini
const todaySchedule = computed(() => {
  if (!scheduleData.value) return null
  const today = now.value.getDate()
  return scheduleData.value.jadwal?.find((j: any) => j.tanggal === today)
})

// Label hari ini
const todayLabel = computed(() => {
  if (!todaySchedule.value) return ''
  return `${todaySchedule.value.hari}, ${todaySchedule.value.tanggal_lengkap}`
})

// Convert "HH:MM" ke menit
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// Menit sekarang
const currentMinutes = computed(() => {
  return now.value.getHours() * 60 + now.value.getMinutes()
})

// Data sholat
const prayerList = computed(() => {
  if (!todaySchedule.value) return []
  const s = todaySchedule.value
  return [
    { name: 'Subuh',   time: s.subuh,   emoji: '🌙' },
    { name: 'Dzuhur',  time: s.dzuhur,  emoji: '☀️' },
    { name: 'Ashar',   time: s.ashar,   emoji: '🌤️' },
    { name: 'Maghrib', time: s.maghrib, emoji: '🌅' },
    { name: 'Isya',    time: s.isya,    emoji: '🌃' },
  ]
})

// Prayers dengan status isPast dan isNext
const prayers = computed(() => {
  return prayerList.value.map((prayer, index) => {
    const prayerMinutes = timeToMinutes(prayer.time)
    const isPast = currentMinutes.value > prayerMinutes
    const isNext = !isPast && prayerList.value
      .slice(0, index)
      .every(p => currentMinutes.value > timeToMinutes(p.time))

    return { ...prayer, isPast, isNext }
  })
})

// Sholat berikutnya
const nextPrayer = computed(() => {
  // 1. Cari sholat berikutnya di hari ini
  const nextToday = prayers.value.find(p => p.isNext)
  
  if (nextToday) {
    return { ...nextToday, isTomorrow: false }
  }

  // 2. Jika sudah lewat Isya, ambil Subuh besok
  if (!scheduleData.value || !todaySchedule.value) return null

  const todayDate = now.value.getDate()
  // Coba cari jadwal besok di data bulan ini
  const tomorrowSchedule = scheduleData.value.jadwal?.find((j: any) => j.tanggal === todayDate + 1)

  // Gunakan subuh besok. Jika ganti bulan (tanggal tidak ketemu), gunakan subuh hari ini sebagai estimasi/fallback
  const subuhTime = tomorrowSchedule ? tomorrowSchedule.subuh : todaySchedule.value.subuh

  return {
    name: 'Subuh',
    time: subuhTime,
    emoji: '🌙',
    isTomorrow: true
  }
})

// Countdown
const countdown = computed(() => {
  if (!nextPrayer.value) return '--:--:--'

  let nextMinutes = timeToMinutes(nextPrayer.value.time)
  
  // Jika sholat yang dituju adalah besok, tambahkan 24 jam (1440 menit)
  if (nextPrayer.value.isTomorrow) {
    nextMinutes += 24 * 60
  }

  let diffSeconds = (nextMinutes - currentMinutes.value) * 60 - now.value.getSeconds()

  if (diffSeconds < 0) diffSeconds = 0

  const h = Math.floor(diffSeconds / 3600)
  const m = Math.floor((diffSeconds % 3600) / 60)
  const s = diffSeconds % 60

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
</script>