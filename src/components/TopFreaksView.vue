<template>
  <div>
    <h2 class="text-center">Топ фріків дня</h2>
    <table class="table table-dark table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Ім'я користувача</th>
          <th>Кількість перемог</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(winner, index) in sortedWinners" :key="winner.username">
          <td>{{ index + 1 }}</td>
          <td>{{ winner.username }}</td>
          <td>{{ winner.count }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      winners: {}
    };
  },
  computed: {
    sortedWinners() {
      // Сортуємо за кількістю перемог
      return Object.values(this.winners).sort((a, b) => b.count - a.count);
    }
  },
  async mounted() {
    // Завантаження статистики з сервера
    const response = await fetch('https://discord-bot-server-zblp.onrender.com/api/freak-stats');
    this.winners = await response.json();
  }
};
</script>

<style scoped>
h2 {
  margin-bottom: 20px;
  color: #ffc107;
}

table {
  width: 80%;
  margin: 0 auto;
  background-color: #212529;
  color: #fff;
  border-radius: 8px;
}
</style>
