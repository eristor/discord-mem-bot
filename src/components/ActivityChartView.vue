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
      <button class="btn btn-success" @click="filterStats">Застосувати фільтр</button>
    </div>

    <!-- Графік -->
    <div class="chart-container">
      <canvas id="userStatsChart"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart } from 'chart.js/auto';

export default {
  data() {
    return {
      chart: null,
      startDate: '',
      endDate: '',
      stats: {}
    };
  },
  async mounted() {
    // Отримуємо початкову статистику
    await this.fetchStats();
    this.renderChart();
  },
  methods: {
    async fetchStats() {
      const response = await fetch('https://discord-mem-bot.vercel.app/api/user-stats');
      this.stats = await response.json();
    },
    filterStats() {
      if (!this.startDate || !this.endDate) {
        alert('Будь ласка, оберіть обидві дати.');
        return;
      }

      const filteredData = {};
      for (const userId in this.stats) {
        const user = this.stats[userId];
        const filteredMessages = {};

        // Фільтруємо повідомлення за обраними датами
        for (const date in user.messages) {
          if (date >= this.startDate && date <= this.endDate) {
            filteredMessages[date] = user.messages[date];
          }
        }

        if (Object.keys(filteredMessages).length > 0) {
          filteredData[userId] = {
            username: user.username,
            messages: filteredMessages
          };
        }
      }

      this.renderChart(filteredData);
    },
    renderChart(filteredStats = this.stats) {
      if (this.chart) {
        this.chart.destroy();
      }

      const labels = [];
      const data = [];

      for (const userId in filteredStats) {
        labels.push(filteredStats[userId].username);

        const messageCounts = Object.values(filteredStats[userId].messages);
        data.push(messageCounts.reduce((sum, count) => sum + count, 0));
      }

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
