<template>
  <div>
    <h2 class="text-center">Статистика повідомлень за користувачами</h2>

    <!-- Фільтр за датами -->
    <div class="filters d-flex justify-content-center align-items-center">
      <label class="d-flex flex-column flex-md-row align-items-center text-dark gap-2">
        <span>Початкова дата:</span>
        <input type="date" v-model="startDate" />
      </label>
      <label class="d-flex flex-column flex-md-row align-items-center text-dark gap-2">
        <span>Кінцева дата:</span>
        <input type="date" v-model="endDate" />
      </label>
      <div class="d-flex gap-2 align-items-center">
        <button class="btn btn-success" @click="filterStats">Застосувати фільтр</button>
        <button class="btn btn-danger" @click="filterClear">Очистити фільтр</button>
      </div>
    </div>

    <!-- Графік -->
    <div class="chart-container">
      <canvas id="userStatsChart"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart } from 'chart.js/auto';
import { toast } from 'vue3-toastify';

export default {
  data() {
    return {
      chart: null,
      startDate: '',
      endDate: '',
      stats: []
    };
  },
  async mounted() {
    // Отримуємо початкову статистику
    await this.fetchStats();
    this.renderChart();
  },
  methods: {
    async fetchStats() {
      const response = await fetch('https://discord-bot-server-zblp.onrender.com/api/user-stats');
      this.stats = await response.json();
    },
    filterClear() {
      this.startDate = '';
      this.endDate = '';
    },
    filterStats() {
      if (!this.startDate || !this.endDate) {
        toast.warning('Будь ласка, оберіть обидві дати.', {
          theme: 'colored',
          position: 'top-right'
        });
        return;
      }

      const filteredData = this.stats.filter(entry => entry.date >= this.startDate && entry.date <= this.endDate);
      this.renderChart(filteredData);
    },
    renderChart(filteredStats = this.stats) {
      if (this.chart) {
        this.chart.destroy();
      }

      const userMessageCounts = {};

      // Агрегуємо кількість повідомлень за користувачами
      filteredStats.forEach(entry => {
        if (!userMessageCounts[entry.username]) {
          userMessageCounts[entry.username] = 0;
        }
        userMessageCounts[entry.username] += entry.message_count;
      });

      const labels = Object.keys(userMessageCounts);
      const data = Object.values(userMessageCounts);

      // Створюємо графік
      this.chart = new Chart(document.getElementById('userStatsChart'), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Кількість повідомлень',
              data: data,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Користувачі'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Кількість повідомлень'
              },
              beginAtZero: true
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
h2 {
  margin-bottom: 20px;
  color: #fff;
}

.filters {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.filters label {
  display: flex;
  flex-direction: column;
  color: #fff;
}

.chart-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>
