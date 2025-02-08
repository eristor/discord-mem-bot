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
          <td class="fs-5">{{ index + 1 }}</td>
          <td v-if="reaction.image_url?.length > 2" class="reaction-cell">
            <img  :src="reaction.image_url" alt="Reaction" class="reaction-image" />
          </td>
          <td v-else class="reaction-cell without_img">
            {{ reaction.name }}
          </td>
          <td class="text-center fs-4">{{ reaction.count }}</td>
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
      return Object.values(this.reactions)
        .sort((a, b) => b.count - a.count);
    }
  },
  async mounted() {
    // Завантаження статистики з сервера
    const response = await fetch('https://discord-bot-server-zblp.onrender.com/api/reactions-stats');
    this.reactions = await response.json();
    console.log(this.reactions);
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
    width: 64px;
    height: 64px;
    border-radius: 8px;
  }
  .without_img {
    font-size: 50px;
  }
</style>
