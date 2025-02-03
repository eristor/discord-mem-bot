<template>
  <div class="container">
    <h1 class="title">Список учасників сервера</h1>
    <ul v-if="members.length" class="members-list">
      <li v-for="member in members" :key="member.id" class="member-item">
        <img :src="member.avatar" alt="Avatar" class="avatar" />
        <div class="member-info">
          <p class="member-name">{{ member.username }}</p>
          <p class="member-role">Роль: {{ member.role }}</p>
        </div>
      </li>
    </ul>
    <p v-else>Завантаження учасників...</p>
  </div>
</template>

<script>
export default {
  name: "MemberListView",
  data() {
    return {
      members: []
    };
  },
  async created() {
    try {
      // Виконуємо запит до бекенду
      const response = await fetch('https://discord-mem-bot.vercel.app/api/members');
      this.members = await response.json();
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
}
.title {
  font-size: 24px;
  margin-bottom: 20px;
}
.members-list {
  list-style-type: none;
  padding: 0;
}
.member-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}
.member-info {
  display: flex;
  flex-direction: column;
}
.member-name {
  font-weight: bold;
}
.member-role {
  color: gray;
}
</style>
