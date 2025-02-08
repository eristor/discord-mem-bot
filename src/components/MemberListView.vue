<template>
  <div class="container">
    <h1 class="title">Список учасників сервера</h1>
    <ul v-if="members.length" class="members-list row">
      <li v-for="member in members" :key="member.id" class="member-item col-md-4 col-12">
        <img :src="member.avatar" alt="Avatar" class="avatar" />
        <div class="member-info">
          <p class="member-name">{{ member.username }}</p>
          <p class="member-role">Ролі: 
            <span v-for="(role, index) in member.roles" :key="index">
              {{ role }}<span v-if="index < member.roles.length - 1">, </span>
            </span>
          </p>
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
      const response = await fetch('https://discord-bot-server-zblp.onrender.com/api/members');
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
  margin-top: 40px;
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
  color: #333333;
}
</style>
