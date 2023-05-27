<template>
  <q-page class="q-mx-auto" style="max-width: 600px" padding>
    <br />
    <div v-if="editor">
      <editor-content :editor="editor" />
    </div>





  </q-page>
</template>

<script setup>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import suggestion from './../composables/suggestion'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const editor = ref(null)

onMounted(() => {

  editor.value = new Editor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion,
      }),
    ],
    content: `
        <p>Hi <span data-type="mention" data-id="Winona Ryder"></span>!</p>
        <p>Feeling ... when/at/to ...  #mytag</p>
      `,
  })
})

onBeforeUnmount(() => {
  editor.value.destroy()
})

</script>

<style lang="scss">
.ProseMirror {
  >*+* {
    margin-top: 0.75em;
  }
}

.mention {
  border: 1px solid #000;
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
  box-decoration-break: clone;
}
</style>
