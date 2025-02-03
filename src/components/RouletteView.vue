<template>
  <div class="container text-center py-4">
    <h1 class="mb-4 ">Рулетка фріків</h1>

    <!-- Відображення учасників під час анімації рулетки -->
    <div class="roulette-display border rounded p-4 mb-4 d-flex justify-content-center align-items-center" style="height: 150px;">
      <div v-if="currentMember" class="animated-member text-center d-flex align-items-center gap-3">
        <img :src="currentMember.avatar" alt="Avatar" class="rounded-circle mb-2" style="width: 100px; height: 100px;" />
        <p class="fw-bold">{{ currentMember.username }}</p>
      </div>
    </div>

    <!-- Кнопка запуску рулетки -->
    <button @click="startRoulette" class="btn btn-danger mb-4" :disabled="isSpinning">
      {{ isSpinning ? 'Шукається головний фрік...' : 'Запустити пошук фріка' }}
    </button>

    <!-- Відображення остаточного переможця -->
    <transition name="fade-slide">
      <div v-if="winner" class="winner alert alert-success text-center">
        <h2 class="alert-heading">⚠️ Обраний фрік ⚠️:</h2>
        <img :src="winner.avatar" alt="Avatar" class="rounded-circle mb-3" style="width: 120px; height: 120px;" />
        <p class="h4 fw-bold">{{ winner.username }}</p>
        <p class="text-muted">Роль: {{ winner.role }}</p>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      members: [],
      currentMember: null,
      winner: null,
      isSpinning: false
    };
  },
  async created() {
    try {
      const response = await fetch('https://discord-bot-server-zblp.onrender.com/api/members');
      this.members = await response.json();
    } catch (error) {
      console.error('Помилка отримання учасників:', error);
    }
  },
  methods: {
    async startRoulette() {
      if (this.members.length === 0) {
        alert('Список учасників порожній!');
        return;
      }

      this.isSpinning = true;
      this.winner = null;

      let spinDuration = 3000;
      let intervalTime = 100;

      const spinInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * this.members.length);
        this.currentMember = this.members[randomIndex];
      }, intervalTime);

      setTimeout(() => {
        clearInterval(spinInterval);
        this.selectWinner();
      }, spinDuration);
    },

    async selectWinner() {
      const randomIndex = Math.floor(Math.random() * this.members.length);
      this.winner = this.members[randomIndex];
      this.currentMember = this.winner;
      this.isSpinning = false;

      try {
        await fetch('https://discord-bot-server-zblp.onrender.com/api/roulette', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            winner: {
              id: this.winner.id,          // Передаємо ID переможця для тегу
              username: this.winner.username
            }
          })
        });

        console.log('Повідомлення успішно відправлено.');
      } catch (error) {
        console.error('Помилка відправлення повідомлення:', error);
      }
    }
  }
};
</script>

<style scoped>
.animated-member {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
