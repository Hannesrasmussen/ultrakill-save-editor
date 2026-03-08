import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';

document.documentElement.classList.add('dark');
document.documentElement.style.colorScheme = 'dark';

createApp(App).use(router).mount('#app');
