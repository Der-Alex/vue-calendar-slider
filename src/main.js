import { createApp } from 'vue';
import App from './App.vue';
import vueCalendarSlider from '@/plugins/vueCalendarSlider';
const app = createApp(App);
app.use(vueCalendarSlider).mount('#app');
