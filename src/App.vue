<template>
<div>
  <vue-calendar-slider
    :start-date="new Date('2022-08-01')"
    :end-date="new Date('2022-09-15')"
    wrapper-classes="vue-calendar-slider"
    container-classes="vue-calendar-slider-container"
    item-classes="calendar-item"
    target-classes="vue-calendar-slider-container-fake"
  />
</div>
</template>

<script setup></script>
<script>
export default {
}
</script>

<style>

h3 {
  display: block;
}
.vcs-wrapper.vue-calendar-slider {
  width: 100%;
}
.vcs-wrapper .vue-calendar-slider-container {
  display: flex;
  align-items: stretch;
  height: 88px;
  z-index: 1;
  top: 0;
  position: absolute;
}

.vcs-wrapper .vcs-item.calendar-item {
  background: #bbb;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  padding: 8px 12px;
  transform: translate3d(var(--posx), 0, 0);
  width: 84px;
  flex: 1 0 auto;
}
.vcs-wrapper .vue-calendar-slider-container.snap .calendar-item {
  transition: transform 0.2s ease-in;
}
.vue-calendar-slider-container-fake.snap .calendar-item {
  transition: transform 0.2s ease-in;
}

.calendar-item:first-child {
  border-end-start-radius: 16px;
  border-start-start-radius: 16px;
}
.calendar-item:last-child {
  border-start-end-radius: 16px;
  border-end-end-radius: 16px;
}
.vcs-wrapper .vcs-container.vue-calendar-slider-container-fake {
  height: 88px;
  width: 84px;
  background: red;
  border-radius: 26px;
  position: absolute;
  top: 0;
  overflow: hidden;
  z-index: 2;
}
.vcs-wrapper .vue-calendar-slider-container-fake .calendar-item {
  background: red;
}

</style>