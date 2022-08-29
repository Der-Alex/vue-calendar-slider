import VueCalendarSlider from '../components/VueCalendarSlider.vue';
export default {
  install: (app, options) => {
    app.component('vue-calendar-slider', VueCalendarSlider);
  },
};
