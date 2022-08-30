<template>
  <div class="vcs-wrapper" :class="wrapperClasses">
    <div
      class="vcs-container"
      :class="containerClasses"
      @mousedown="dragStart" ref="container"
    >
      <div
        class="vcs-item"
        :class="itemClasses"
        v-for="(dateItem, index) in dates"
        :key="dateItem"
        ref="dateItems"
        @mousedown="setCurrentItem(index)"
        @click.prevent="scrollToId(index)"
      >
        <p class="vcs-text" :class="itemTextClasses">{{ dateItem.toLocaleDateString('de-DE') }}</p>
      </div>
    </div>
    <div
      class="vcs-container vcs-target"
      :class="[containerClasses, targetClasses]"
      @mousedown="dragStart"
      ref="target"
    >
      <div
        class="vcs-item"
        :class="[itemClasses, targetItemClasses]"
        v-for="(dateItem, index) in dates"
        :key="dateItem"
        @mousedown="setCurrentItem(index)"
      >
        <span class="vcs-text" :class="[itemTextClasses, targetItemTextClasses]">{{ dateItem.toLocaleDateString('de-DE') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, computed, watch} from 'vue';
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
const count = ref(100);

// const currentMonth = computed(() => {
//   return selectedDate.value.toLocaleDateString('de-DE', { month: 'long' });
// });

const setCurrentItem = (index) => {
  currentBox.value = dateItems.value[index];
  console.log('currentbox', currentBox.value);
};

const dragStart = (e) => {
  e = e || window.event;
  e.preventDefault();
  count.value = 100;
  moved.value = false;
  x.value = e.clientX;
  document.onmousemove = moveElement;
  document.onmouseup = dragEnd;
  posx.value = parseInt(
    getComputedStyle(root.value).getPropertyValue('--posx').slice(0, -2)
  );

  container.value.classList.remove('snap');
  target.value.classList.remove('snap');
};

const scrollToId = (index) => {
  if (moved.value) {
    return false;
  } else {
    posx.value = target.value.clientWidth * index * -1;
    container.value.classList.add('snap');
    target.value.classList.add('snap');
    root.value.style.setProperty('--posx', posx.value.toString() + 'px');
    selectedDate.value = dates.value[index];
  }
};

const moveElement = (e) => {
  e = e || window.event;
  e.preventDefault();
  moved.value = true;
  if (currentBox.value && currentBox.value.getBoundingClientRect) {
    lastX.value = x.value;
    x.value = e.clientX;
    posx.value = parseInt(
      getComputedStyle(root.value).getPropertyValue('--posx').slice(0, -2)
    );
    let newVal = 0;
    if (lastX.value < x.value) {
      newVal = posx.value + (x.value - lastX.value);
      //console.log('lastx', lastX.value,'x', x.value, x.value - lastX.value );
      speed.value = x.value - lastX.value;
    } else if (lastX.value > x.value) {
      newVal = posx.value - (lastX.value - x.value);
      //console.log('lastx', lastX.value,'x', x.value, lastX.value - x.value );
      speed.value = x.value - lastX.value;
    } else {
      newVal = posx.value;
    }
    //console.log('speed', speed.value);
    root.value.style.setProperty('--posx', newVal.toString() + 'px');
  }
};


const animateVelocity = (timestamp) => {
  posx.value = parseInt(getComputedStyle(root.value).getPropertyValue('--posx').slice(0, -2));
  console.log('velocity', posx.value, speed.value, timestamp);
  root.value.style.setProperty('--posx', (posx.value + speed.value).toString() + 'px');
  console.log('new posx', getComputedStyle(root.value).getPropertyValue('--posx'));
  if (speed.value < -20) {
    speed.value = -20;
  }
  if (speed.value > 20) {
    speed.value = 20;
  }

  if (count.value > 0) {
    count.value--;
    if (count.value < 60) {
      speed.value *= 0.98;
    }
    window.requestAnimationFrame(animateVelocity);
  }
  if (count.value === 0) {
    const itemsInContainer = [];

    for (const item of dateItems.value) {
      if (
        (item.getBoundingClientRect().left >=
          target.value.getBoundingClientRect().left &&
          item.getBoundingClientRect().left <=
          target.value.getBoundingClientRect().right) ||
        (item.getBoundingClientRect().right <=
          target.value.getBoundingClientRect().right &&
          item.getBoundingClientRect().right >=
          target.value.getBoundingClientRect().left)
      ) {
        console.log(item);
        itemsInContainer.push(item);
      }
    }

    if (itemsInContainer.length <= 1) {
      if (posx.value >= 0) {
        posx.value = 0;
        selectedDate.value = dates.value[0];
      } else {
        console.log(target.value.width, target.value.clientWidth);
        posx.value = (dateItems.value.length - 1) * target.value.clientWidth * -1;
        selectedDate.value = dates.value[dates.value.length - 1];
      }
    }

    if (itemsInContainer.length === 2) {
      const item1 =
        target.value.clientWidth - itemsInContainer[0].getBoundingClientRect().right;
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
        posx.value = item1Index * target.value.clientWidth * -1;
        selectedDate.value = dates.value[item1Index];
      } else {
        posx.value = item2Index * target.value.clientWidth * -1;
        selectedDate.value = dates.value[item2Index];
      }
      console.log('POSX', posx.value, selectedDate.value);
    }

    container.value.classList.add('snap');
    target.value.classList.add('snap');
    root.value.style.setProperty('--posx', posx.value.toString() + 'px');

    console.log('items in container', itemsInContainer);
  }

      // if (speed.value > 0) {
      //   speed.value--;
      // } else if (speed.value < 0) {
      //   speed.value++
      // };

};


const dragEnd = () => {
  console.log('dragEnd');
  window.requestAnimationFrame(animateVelocity);

  document.onmouseup = null;
  document.onmousemove = null;
};

onMounted(() => {
  root.value.style.setProperty('--posx', '0px');
  let currentDate = new Date(props.startDate);
  console.log('current date', currentDate, currentDate.getDate());
  while (currentDate <= props.endDate) {
    dates.value.push(currentDate);
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }
});
watch(dateItems, newVal => {
  if (newVal.length > 0) {
    const d = selectedDate.value.toLocaleDateString('de-DE');
    const index = dateItems.value.findIndex(item => item.innerHTML.indexOf(d) > -1);
    if (index > -1) {
      root.value.style.setProperty('--posx', (target.value.clientWidth * index * -1).toString() + 'px');
    }
  }
});
</script>

<style scoped>
:root {
  --posx: 0px;
}
.vcs-wrapper * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.vcs-wrapper {
  position: relative;
}
.vcs-container {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.vcs-target {
  width: 100px;
  height: 32px;
  overflow: hidden;
}
.vcs-item {
  width: 100px;
  height: 32px;
  flex: 1 0 100px;
  transform: translateX(var(--posx));
}
.vcs-text {
  pointer-events: none;
}

</style>
