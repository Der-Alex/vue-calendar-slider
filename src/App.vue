<template>
  <div>
    <vue-calendar-slider
      :start-date="new Date('2022-08-01')"
      :end-date="new Date('2022-10-30')"
      wrapper-classes="vue-calendar-slider"
      container-classes="vue-calendar-slider-container"
      item-classes="calendar-item"
      target-classes="vue-calendar-slider-container-fake"
    />
  </div>
</template>

<script setup></script>
