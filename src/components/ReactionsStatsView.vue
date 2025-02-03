<template>
  <div>
    <h2 class="text-center">Рейтинг реакцій на сервері</h2>
    <table class="table table-dark table-striped">
      <thead>
        <tr>
          <th class="text-nowrap">#</th>
          <th class="text-nowrap">Реакція</th>
          <th class="text-nowrap">Кількість використань</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(reaction, index) in sortedReactions" :key="reaction.name">
          <td>{{ index + 1 }}</td>
          <td class="reaction-cell">
            <img v-if="reaction.imageUrl" :src="reaction.imageUrl" alt="Reaction" class="reaction-image" />
            {{ reaction.name }}
          </td>
          <td>{{ reaction.count }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      reactions: {}
    };
  },
  computed: {
    sortedReactions() {
      return Object.entries(this.reactions)
        .map(([emoji, count]) => ({ emoji, count }))
        .sort((a, b) => b.count - a.count);
    }
  },
  async mounted() {
    // Завантаження статистики з сервера
    const response = await fetch('https://discord-bot-server-zblp.onrender.com/api/reactions-stats');
    this.reactions = await response.json();
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
.reaction-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reaction-image {
  width: 32px;
  height: 32px;
  border-radius: 4px;
}
</style>
