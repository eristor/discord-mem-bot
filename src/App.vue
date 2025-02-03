<template>
  <div>
    <!-- Меню навігації -->
    <nav class="animated-menu">
      <ul>
        <li><a href="#" @click.prevent="goTo('roulette')">🎲 Рулетка</a></li>
        <li><a href="#" @click.prevent="goTo('members')">👥 Список учасників</a></li>
        <li><a href="#" @click.prevent="goTo('chart')">📊 Статистика</a></li>
        <li><a href="#" @click.prevent="goTo('freaks')">🏆 Топ фріків</a></li>
        <li><a href="#" @click.prevent="goTo('about')">ℹ️ Про нас</a></li>
      </ul>
    </nav>

    <!-- Головна секція -->
    <main>
      <RouletteView v-if="currentView === 'roulette'" />
      <MemberListView v-if="currentView === 'members'" />
      <ActivityChartView v-if="currentView === 'chart'" />
      <TopFreaksView v-if="currentView === 'freaks'" />
      <div v-if="currentView === 'about'" class="about-page">
        <h1>Про наш проєкт</h1>
        <p>Це фантастична рулетка для обрання фріка дня!</p>
      </div>
    </main>
  </div>
</template>

<script>
import MemberListView from './components/MemberListView.vue';
import RouletteView from './components/RouletteView.vue';
import ActivityChartView from './components/ActivityChartView.vue';
import TopFreaksView from './components/TopFreaksView.vue';

export default {
  components: {
    MemberListView,
    RouletteView,
    ActivityChartView,
    TopFreaksView
  },
  data() {
    return {
      currentView: 'roulette'
    };
  },
  created() {
    // Отримуємо поточний view з URL або локального сховища
    const urlParams = new URLSearchParams(window.location.search);
    const storedView = localStorage.getItem('currentView');
    this.currentView = urlParams.get('view') || storedView || 'roulette';

    // Синхронізуємо URL при зміні представлення
    window.history.replaceState({}, '', `?view=${this.currentView}`);
  },
  methods: {
    goTo(view) {
      this.currentView = view;

      // Оновлюємо URL-параметр і локальне сховище
      window.history.pushState({}, '', `?view=${view}`);
      localStorage.setItem('currentView', view);
    }
  }
};
</script>

<style>
/* Додаємо нестандартний шрифт */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

body {
  font-family: 'Press Start 2P', cursive;
  margin: 0;
  padding: 0;
  color: #fff;
  background-color: #343a40;
}

/* Стилі для меню */
.animated-menu {
  position: fixed;
  top: 0;
  width: 100%;
  background-color: #212529;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  padding: 10px 0;
}

.animated-menu ul {
  display: flex;
  justify-content: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.animated-menu li {
  margin: 0 15px;
}

.animated-menu a {
  color: #ffc107;
  text-decoration: none;
  font-size: 18px;
  position: relative;
  padding: 5px 10px;
  transition: color 0.3s ease;
}

.animated-menu a:hover {
  color: #fd7e14;
}

/* Анімація підкреслення при наведенні */
.animated-menu a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #fd7e14;
  transition: width 0.3s ease;
}

.animated-menu a:hover::after {
  width: 100%;
}

/* Головна секція */
main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.about-page {
  text-align: center;
  animation: fadeIn 0.6s ease-in-out;
}

/* Анімація появи */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
