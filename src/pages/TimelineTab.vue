<template>
  <q-page padding>
    <div id="toolbar-wrap">
      <div id="toolbar">
        <button class="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z" />
          </svg></button>
        <div class="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z" />
          </svg></div>
        <div class="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M8 3v9a4 4 0 1 0 8 0V3h2v9a6 6 0 1 1-12 0V3h2zM4 20h16v2H4v-2z" />
          </svg></div>
      </div>
    </div>

    <div id="editor" contentEditable="true">
      <p>This is a very long editable area.</p>
      <p>The problem is, when you focus in this area on an iOS device, a keyboard pops up and that beautiful fixed toolbar
        at the top gets hidden.</p>
      <p>You will need to fork this pen and view in debug mode on an iOS device to see the fix in action (so that you are
        not viewing it inside an iframe).</p>
      <p>You might need to scroll down a bit to see the header disappear.</p>
      <p>Let's fix this problem, using JavaScript!</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>...</p>
      <p>This is a very long editable area.</p>
      <p>The problem is, when you focus in this area on an iOS device, a keyboard pops up and that beautiful fixed toolbar
        at the top gets hidden.</p>
      <p>Let's fix this problem, using JavaScript!</p>

    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import debounce from 'lodash/debounce'
let fixPosition = 0; // the fix
// let lastScrollY = window.pageYOffset; // the last scroll position
onMounted(() => {

  let toolbarWrap = document.getElementById('toolbar-wrap'); // the toolbar wrap
  let toolbar = document.getElementById('toolbar'); // the toolbar
  let editor = document.getElementById('editor'); // the editor

  // function to set the margin to show the toolbar if hidden
  const setMargin = function () {
    // if toolbar wrap is hidden
    const newPosition = toolbarWrap.getBoundingClientRect().top;
    if (newPosition < -1) {
      // add a margin to show the toolbar
      toolbar.classList.add("down"); // add class so toolbar can be animated
      fixPosition = Math.abs(newPosition); // this is new position we need to fix the toolbar in the display
      // if at the bottom of the page take a couple of pixels off due to gap
      if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
        fixPosition -= 2;
      }
      // set the margin to the new fixed position
      toolbar.style["margin-top"] = fixPosition + "px";
    }
  }

  // use lodash debounce to stop flicker
  // const debounceMargin = debounce(setMargin, 150);
  const debounceMargin = debounce(setMargin, 10);


  // function to run on scroll and blur
  const showToolbar = function () {
    // remove animation and put toolbar back in default position
    if (fixPosition > 0) {
      toolbar.classList.remove("down");
      fixPosition = 0;
      toolbar.style["margin-top"] = 0 + "px";
    }
    // will check if toolbar needs to be fixed
    debounceMargin();
  }

  // add an event listener to scroll to check if
  // toolbar position has moved off the page
  window.addEventListener("scroll", showToolbar);
  // add an event listener to blur as iOS keyboard may have closed
  // and toolbar postition needs to be checked again
  editor.addEventListener("blur", showToolbar);
});
</script>

<style lang="scss">
body {
  margin: 0px;
}

#editor {
  padding: 5px 20px;
}

#editor:focus {
  outline: 2px solid transparent;
}

#toolbar-wrap {
  position: sticky;
  top: 0px;
  height: 60px;
  width: 100%;
}

#toolbar {
  position: absolute;
  left: 0px;
  right: 0px;
  padding: 15px;
  background-color: #f1f5f9;
}

#toolbar.down {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  // transition-duration: 10ms;
  transition-duration: 500ms;
}

.button {
  border-radius: 5px;
  background-color: transparent;
  border: 0px;
  padding: 3px 5px;
  line-height: 0px;
  display: inline-block;
  margin: 1px;
  cursor: pointer;
}

.button:hover {
  background-color: #e2e8f0;
}
</style>
