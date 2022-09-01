import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import vueCalendarSlider from '@/plugins/vueCalendarSlider';
const app = createApp(App);
app.use(vueCalendarSlider).mount('#app');
