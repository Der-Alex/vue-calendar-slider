<template>
  <div class="foo">
    <div class="vcs-wrapper" :class="wrapperClasses">
      <div
        class="vcs-container"
        :class="containerClasses"
        @touchstart="dragStart" ref="container"
        @mousedown="dragStart"
      >
        <div
          class="vcs-item"
          :class="itemClasses"
          v-for="(dateItem, index) in dates"
          :key="dateItem"
          ref="dateItems"
          @touchstart="(e) => setCurrentItem(e, index)"
          @mousedown="(e) => setCurrentItem(e, index)"
          @touchend="(e) => scrollToId(e, index)"
          @mouseup="(e) => scrollToId(e, index)"
        >
          <p class="vcs-text" :class="itemTextClasses">{{ dateItem.toLocaleDateString('de-DE') }}</p>
        </div>
      </div>
      <div
        class="vcs-container vcs-target"
        :class="[containerClasses, targetClasses]"
        @touchstart="dragStart"
        @mousedown="dragStart"
        ref="target"
      >
        <div
          class="vcs-item"
          :class="[itemClasses, targetItemClasses]"
          v-for="(dateItem, index) in dates"
          :key="dateItem"
        >
          <span class="vcs-text" :class="[itemTextClasses, targetItemTextClasses]">{{ dateItem.toLocaleDateString('de-DE') }}</span>
        </div>
      </div>
    </div>
    <div>
      <pre>{{ currentEvent }}</pre>
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
const currentEvent = ref(null);

// const currentMonth = computed(() => {
//   return selectedDate.value.toLocaleDateString('de-DE', { month: 'long' });
// });

const setCurrentItem = (evt, index) => {
  console.log('setcurrentitem', evt, index);
  currentBox.value = dateItems.value[index];
};

const dragStart = (e) => {
  console.log('dragstart', e);
  e = e || window.event;
  e.preventDefault();
  let moveX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX || e.changedTouches[0].clientX;
  currentEvent.value = e.type;
  count.value = 100;
  moved.value = false;
  x.value = moveX;
  document.onmousemove = moveElement;
  document.onmouseup = dragEnd;
  document.ontouchmove = moveElement;
  document.ontouchend = dragEnd;
  posx.value = parseInt(
    getComputedStyle(root.value).getPropertyValue('--posx').slice(0, -2)
  );

  container.value.classList.remove('snap');
  target.value.classList.remove('snap');
};

const scrollToId = (evt, index) => {
  currentEvent.value = evt.type;
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

const doIt = (e) => {
  currentEvent.value = e.type;
  let moveX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX || e.changedTouches[0].clientX;
  if (currentBox.value && currentBox.value.getBoundingClientRect) {
    lastX.value = x.value;
    x.value = moveX
    posx.value = parseInt(
      getComputedStyle(root.value).getPropertyValue('--posx').slice(0, -2)
    );
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
    root.value.style.setProperty('--posx', newVal.toString() + 'px');
  }
};

const moveElement = (e) => {
  e = e || window.event;
  //e.preventDefault();
  moved.value = true;
  currentEvent.value = e.type;
  let moveX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX || e.changedTouches[0].clientX;

  if (currentBox.value && currentBox.value.getBoundingClientRect) {
    lastX.value = x.value;
    x.value = moveX;
    posx.value = parseInt(
      getComputedStyle(root.value).getPropertyValue('--posx').slice(0, -2)
    );
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
    root.value.style.setProperty('--posx', newVal.toString() + 'px');
  }
  //window.requestAnimationFrame((timestamp) => doIt(e));
};


const animateVelocity = (timestamp) => {
  if (speed.value <= 1 && speed.value >= -1) {
    moved.value = false;
    count.value = 0;
  }
  if (moved.value) {
    posx.value = parseInt(getComputedStyle(root.value).getPropertyValue('--posx').slice(0, -2));
    root.value.style.setProperty('--posx', (posx.value + speed.value).toString() + 'px');
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
        itemsInContainer.push(item);
      }
    }

    if (itemsInContainer.length === 0) {
      if (posx.value >= 0) {
        posx.value = 0;
        selectedDate.value = dates.value[0];
      } else {
        posx.value = (dateItems.value.length - 1) * target.value.clientWidth * -1;
        selectedDate.value = dates.value[dates.value.length - 1];
      }
    }

    if (itemsInContainer.length === 1) {
      if (itemsInContainer[0] === dateItems.value[0]) {
        posx.value = 0;
        selectedDate.value = dates.value[0];
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
    }

    container.value.classList.add('snap');
    target.value.classList.add('snap');
    root.value.style.setProperty('--posx', posx.value.toString() + 'px');
  }
};


const dragEnd = (e) => {
  console.log('dragend');
  currentEvent.value = 'dragend';
  //lastX.value = x.value;
  //x.value = e.touches[0].clientX;
  window.requestAnimationFrame(animateVelocity);

  document.onmouseup = null;
  document.onmousemove = null;
  document.ontouchmove = null;
  document.ontouchend = null;
};

onMounted(() => {
  root.value.style.setProperty('--posx', '0px');
  let currentDate = new Date(props.startDate);
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
  width: 100%;
  height: 88px;
  overflow: hidden;
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
  will-change: transform;
  transform: translateX(var(--posx));
}
.vcs-text {
  pointer-events: none;
}

</style>
