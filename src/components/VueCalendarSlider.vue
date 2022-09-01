<template>
  <div class="p-4">
    <div class="vcs-wrapper relative w-full h-32" :class="wrapperClasses">
      <div
        class="outer-container w-full absolute h-20 top-6 overflow-hidden rounded-xl cursor-grab"
        :class="{ 'cursor-grabbing': touching }"
        @touchstart="dragStart"
        @mousedown="dragStart"
      >
        <div
          class="vcs-container absolute top-0 w-full h-20 flex items-center justify-start"
          :class="containerClasses"
          ref="container"
        >
          <div
            class="vcs-item h-20 w-20 bg-gray-300 flex-none flex items-start justify-center"
            :data-date="dateItem.toLocaleDateString('de-DE')"
            v-for="(dateItem, index) in dates"
            :key="dateItem"
            ref="dateItems"
            @touchstart="setCurrentItem(index)"
            @mousedown="setCurrentItem(index)"
            @touchend="scrollToId(index)"
            @mouseup="scrollToId(index)"
          >
            <p
              class="vcs-text flex flex-col items-center"
              :class="itemTextClasses"
            >
              <span class="font-regular text-xs my-1 text-gray-600">{{
                dateItem.toLocaleDateString('de-DE', { weekday: 'long' })
              }}</span>
              <span class="font-bold text-sm text-gray-700 my-1">{{
                dateItem.toLocaleDateString('de-DE', { day: '2-digit' })
              }}</span>
              <span class="rounded-full bg-red-600 w-2 h-2 my-1"></span>
            </p>
          </div>
        </div>
      </div>
      <div
        class="outer-container absolute top-0 w-20 h-32 bg-red-600 rounded-3xl flex items-center justify-center overflow-hidden cursor-grab"
        :class="{ 'cursor-grabbing': touching }"
        ref="targetcontainer"
      >
        <div
          class="vcs-container vcs-target w-full flex items-center justify-start"
          :class="[containerClasses, targetClasses]"
          @touchstart="dragStart"
          @mousedown="dragStart"
          ref="target"
        >
          <div
            class="vcs-item h-20 flex-none w-20 bg-red-600 flex items-start justify-center"
            :data-date="dateItem.toLocaleDateString('de-DE')"
            :class="[
              itemClasses,
              targetItemClasses,
              index === 0 ? 'rounded-l-xl' : '',
              index === dates.length - 1 ? 'rounded-r-xl' : '',
            ]"
            v-for="(dateItem, index) in dates"
            :key="dateItem"
          >
            <p
              class="vcs-text flex flex-col items-center"
              :class="itemTextClasses"
            >
              <span class="font-regular text-xs my-1 text-gray-100">{{
                dateItem.toLocaleDateString('de-DE', { weekday: 'long' })
              }}</span>
              <span class="font-bold text-sm text-gray-100 my-1">{{
                dateItem.toLocaleDateString('de-DE', { day: '2-digit' })
              }}</span>
              <span class="rounded-full bg-gray-100 w-2 h-2 my-1"></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  startDate: Date,
  endDate: Date,
  wrapperClasses: String,
  containerClasses: String,
  itemClasses: String,
  itemTextClasses: String,
  targetClasses: String,
  targetItemClasses: String,
  targetItemTextClasses: String,
});

const container = ref(null);
const target = ref(null);
const targetcontainer = ref(null);
const dates = ref([]);
const selectedDate = ref(new Date());
const dateItems = ref([]);
const root = ref(document.documentElement);
const currentBox = ref(null);
const x = ref(0);
const lastX = ref(0);
const posx = ref(0);
const moved = ref(false);
const speed = ref(0);
const count = ref(60);
const touching = ref(false);

// Change this variable to false to write the styles directly to the container elements.
const testCssCustomProperties = ref(false);

const setCurrentItem = (index) => {
  console.log('setCurrentItem');
  currentBox.value = dateItems.value[index];
};

const dragStart = (e) => {
  e = e || window.event;
  e.preventDefault();
  console.log('dragStart');

  touching.value = true;
  let moveX =
    e.type === 'mousedown'
      ? e.clientX
      : e.touches[0].clientX || e.changedTouches[0].clientX;

  count.value = 60;
  moved.value = false;
  x.value = moveX;
  document.onmousemove = (e) => requestAnimationFrame(() => moveElement(e));
  document.ontouchmove = (e) => requestAnimationFrame(() => moveElement(e));
  document.onmouseup = dragEnd;
  document.ontouchend = dragEnd;

  container.value.classList.remove('snap');
  target.value.classList.remove('snap');
};

const scrollToId = (index) => {
  console.log('scrollToId');
  if (moved.value) {
    return false;
  } else {
    posx.value = targetcontainer.value.clientWidth * index * -1;

    if (testCssCustomProperties.value) {
      root.value.style.setProperty('--posx', `${posx.value}px`);
    } else {
      container.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
      target.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
    }

    container.value.classList.add('snap');
    target.value.classList.add('snap');
    selectedDate.value = dates.value[index];
  }
};

const moveElement = (e) => {
  e = e || window.event;
  e.preventDefault();
  console.log('moveElement');
  let moveX =
    e.type === 'mousemove'
      ? e.clientX
      : e.touches[0].clientX || e.changedTouches[0].clientX;

  moved.value = true;
  if (currentBox.value && currentBox.value.getBoundingClientRect) {
    lastX.value = x.value;
    x.value = moveX;
    let newVal = 0;
    if (lastX.value < x.value) {
      newVal = posx.value + (x.value - lastX.value);
      speed.value = x.value - lastX.value;
    } else if (lastX.value > x.value) {
      newVal = posx.value - (lastX.value - x.value);
      speed.value = x.value - lastX.value;
    } else {
      newVal = posx.value;
    }
    posx.value = newVal;

    if (testCssCustomProperties.value) {
      root.value.style.setProperty('--posx', `${posx.value}px`);
    } else {
      container.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
      target.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
    }
  }
};

const animateVelocity = (timestamp) => {
  console.log('animate', timestamp);
  if (speed.value <= 1 && speed.value >= -1) {
    moved.value = false;
    count.value = 0;
  }
  if (moved.value) {
    posx.value = posx.value + speed.value;

    if (testCssCustomProperties.value) {
      root.value.style.setProperty('--posx', `${posx.value}px`);
    } else {
      container.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
      target.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
    }

    if (speed.value < -20) {
      speed.value = -20;
    }
    if (speed.value > 20) {
      speed.value = 20;
    }
    if (count.value > 0) {
      count.value--;
      if (count.value < 50) {
        speed.value *= 0.98;
      }
      window.requestAnimationFrame(animateVelocity);
    }
  }
  if (count.value === 0) {
    const itemsInContainer = [];
    for (const item of dateItems.value) {
      if (
        (item.getBoundingClientRect().left >=
          targetcontainer.value.getBoundingClientRect().left &&
          item.getBoundingClientRect().left <=
            targetcontainer.value.getBoundingClientRect().right) ||
        (item.getBoundingClientRect().right <=
          targetcontainer.value.getBoundingClientRect().right &&
          item.getBoundingClientRect().right >=
            targetcontainer.value.getBoundingClientRect().left)
      ) {
        itemsInContainer.push(item);
      }
    }
    if (itemsInContainer.length === 0) {
      if (posx.value >= 0) {
        posx.value = 0;
        selectedDate.value = dates.value[0];
      } else {
        posx.value =
          (dateItems.value.length - 1) * targetcontainer.value.clientWidth * -1;
        selectedDate.value = dates.value[dates.value.length - 1];
      }
    }
    if (itemsInContainer.length === 1) {
      if (itemsInContainer[0].innerText === dateItems.value[0].innerText) {
        posx.value = 0;
        selectedDate.value = dates.value[0];
      } else {
        posx.value =
          targetcontainer.value.clientWidth * (dateItems.value.length - 1) * -1;
        selectedDate.value = dates.value[dates.value.length - 1];
      }
    }

    if (itemsInContainer.length === 2) {
      const item1 =
        targetcontainer.value.clientWidth -
        itemsInContainer[0].getBoundingClientRect().right;
      const item1Index = dateItems.value.findIndex(
        (item) => item === itemsInContainer[0]
      );
      const item2 =
        itemsInContainer[1].getBoundingClientRect().left -
        target.value.getBoundingClientRect().left;
      const item2Index = dateItems.value.findIndex(
        (item) => item === itemsInContainer[1]
      );

      if (item1 <= item2) {
        posx.value = item1Index * targetcontainer.value.clientWidth * -1;
        selectedDate.value = dates.value[item1Index];
      } else {
        posx.value = item2Index * targetcontainer.value.clientWidth * -1;
        selectedDate.value = dates.value[item2Index];
      }
    }

    if (testCssCustomProperties.value) {
      root.value.style.setProperty('--posx', `${posx.value}px`);
    } else {
      container.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
      target.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
    }

    container.value.classList.add('snap');
    target.value.classList.add('snap');
  }
};

const dragEnd = (e) => {
  console.log('dragEnd');
  e.preventDefault();
  touching.value = false;
  window.requestAnimationFrame(animateVelocity);
  document.onmouseup = null;
  document.ontouchend = null;
  document.onmousemove = null;
  document.ontouchmove = null;
};

onMounted(() => {
  if (testCssCustomProperties.value) {
    root.value.style.setProperty('--posx', `${posx.value}px`);
  } else {
    container.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
    target.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
  }

  let currentDate = new Date(props.startDate);
  while (currentDate <= props.endDate) {
    dates.value.push(currentDate);
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }
});

watch(dateItems, (newVal) => {
  if (newVal.length > 0) {
    const d = selectedDate.value.toLocaleDateString('de-DE');
    const index = dateItems.value.findIndex(
      (item) => item.dataset.date.indexOf(d) > -1
    );
    if (index > -1) {
      posx.value = targetcontainer.value.clientWidth * index * -1;

      if (testCssCustomProperties.value) {
        root.value.style.setProperty('--posx', `${posx.value}px`);
      } else {
        container.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
        target.value.style.transform = `translate3d(${posx.value}px, 0, 0)`;
      }
    }
  }
});
</script>

<style>
:root {
  --posx: 0px;
}

.vcs-container {
  will-change: transform;
  transform: translate3d(var(--posx), 0, 0);
}

.vcs-container.snap {
  transition: transform 0.3s ease-out;
}

.extra-line::before {
  display: block;
  content: '';
  width: 2rem;
  height: 1px;
  background: red;
  margin-right: 1rem;
}

.extra-line::after {
  display: block;
  content: '';
  width: 2rem;
  height: 1px;
  background: red;
  margin-left: 1rem;
}
</style>
