import { createApp } from 'vue'
import App from './App.vue'
// Імпортуємо CSS Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
// Якщо потрібно, можна імпортувати і JavaScript-компоненти Bootstrap
import 'bootstrap';
import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const app = createApp(App);

app.use(Vue3Toastify, {
  position: 'bottom-right',
  autoClose: 3000
});

app.mount('#app');
