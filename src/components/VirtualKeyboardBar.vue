<template>
  <div>
    <div id="bottomBar" class="bg-surface-variant q-pa-xs">
      <q-btn class="text-primary" flat round icon="tag" @touchstart.prevent="$emit('appendHashtag')" />
    </div>
    <div id="layoutViewport"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

defineEmits(['appendHashtag'])

let viewportHandler, layoutViewport, bottomBar;
let pendingUpdate = false;

onMounted(() => {
  bottomBar = document.getElementById('bottomBar');
  layoutViewport = document.getElementById("layoutViewport");

  viewportHandler = (event) => {
    if (pendingUpdate) return;

    pendingUpdate = true;
    requestAnimationFrame(() => {
      pendingUpdate = false;

      // Since the bar is position: fixed we need to offset it by the
      // visual viewport's offset from the layout viewport origin.
      const viewport = event.target;
      const offsetLeft = viewport.offsetLeft;
      const offsetTop =
        viewport.height -
        layoutViewport.getBoundingClientRect().height +
        viewport.offsetTop;

      bottomBar.style.transform = `translate(${offsetLeft}px, ${offsetTop}px) scale(${1 / viewport.scale
        })`;
    });
  };
  window.visualViewport.addEventListener("scroll", viewportHandler, { passive: true });
  window.visualViewport.addEventListener("resize", viewportHandler, { passive: true });
})
onBeforeUnmount(() => {
  window.visualViewport.removeEventListener("scroll", viewportHandler);
  window.visualViewport.removeEventListener("resize", viewportHandler);
})
</script>

<style lang="scss">
#layoutViewport {
  position: fixed;
  width: 100%;
  height: 100%;
  visibility: hidden;
}

#bottomBar {
  will-change: transform;
  position: fixed;
  // z-index: 1000;
  left: 0px;
  right: 0px;
  bottom: 0px;
  transform-origin: left bottom;
  transform: translate(0px, 0px) scale(1);
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 250ms;
}
</style>
